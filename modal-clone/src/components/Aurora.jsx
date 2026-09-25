import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

// Use vUv (0–1) — avoids gl_FragCoord / DPR mismatches that blank Aurora on many laptops & monitors
const VERT = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform float uBlend;

in vec2 vUv;
out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 rampColorAt(float factor, vec3 c0, vec3 c1, vec3 c2) {
  if (factor < 0.5) {
    return mix(c0, c1, factor / 0.5);
  }
  return mix(c1, c2, (factor - 0.5) / 0.5);
}

float auroraBand(vec2 uv, float time, float amplitude, float blend, float phase) {
  float height = snoise(vec2(uv.x * 2.0 + time * 0.1 + phase, time * 0.25 + phase * 0.2)) * 0.5 * amplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.55 * height;
  float midPoint = 0.20;
  float alpha = smoothstep(midPoint - blend * 0.5, midPoint + blend * 0.5, intensity);
  return max(intensity * alpha, 0.0);
}

void main() {
  vec2 uv = vUv;

  vec3 leftRamp = rampColorAt(uv.x, uColorStops[0], uColorStops[1], uColorStops[2]);
  vec3 rightRamp = rampColorAt(1.0 - uv.x, uColorStops[0], uColorStops[1], uColorStops[2]);

  float left = auroraBand(uv, uTime, uAmplitude, uBlend, 0.0);
  float right = auroraBand(vec2(1.0 - uv.x, uv.y), uTime, uAmplitude, uBlend, 1.7);

  // Keep energy in lime range — clamp stops white blow-out
  vec3 color = leftRamp * left + rightRamp * right;
  color = min(color, vec3(0.82, 1.0, 0.28));
  float alpha = min(left + right, 0.92);
  fragColor = vec4(color, alpha);
}
`

function pickDpr(cssW, cssH) {
  const raw = Math.min(window.devicePixelRatio || 1, 1.25)
  const maxPixels = 1_920_000
  const area = Math.max(cssW * cssH, 1)
  if (area * raw * raw <= maxPixels) return raw
  return Math.max(1, Math.sqrt(maxPixels / area))
}

export default function Aurora(props) {
  const {
    colorStops = ['#d2ff00', '#6f7a3a', '#b8e600'],
    amplitude = 1.05,
    blend = 0.5,
    onReady,
    onError,
  } = props
  const propsRef = useRef(props)
  propsRef.current = props
  const ctnDom = useRef(null)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return undefined

    let renderer
    let program
    let mesh
    let gl
    let animateId = 0
    let disposed = false
    let readySent = false

    const fail = (err) => {
      if (err) console.warn('Aurora failed:', err)
      propsRef.current.onError?.()
    }

    const markReady = () => {
      if (readySent || disposed) return
      readySent = true
      propsRef.current.onReady?.()
    }

    try {
      // No separate WebGL probe — probing can exhaust context slots on some GPUs
      const dpr0 = pickDpr(Math.max(ctn.offsetWidth, 1), Math.max(ctn.offsetHeight, 1))
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: dpr0,
        webgl: 2,
      })
      gl = renderer.gl
      if (!gl) {
        fail('no gl')
        return undefined
      }

      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.canvas.style.cssText = 'display:block;width:100%;height:100%;background:transparent;'

      const toStops = (stops) =>
        stops.map((hex) => {
          const c = new Color(hex)
          return [c.r, c.g, c.b]
        })

      const geometry = new Triangle(gl)
      if (geometry.attributes.uv) delete geometry.attributes.uv

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: toStops(colorStops) },
          uBlend: { value: blend },
        },
      })

      mesh = new Mesh(gl, { geometry, program })
      ctn.appendChild(gl.canvas)

      const resize = () => {
        if (disposed || !ctn) return
        const w = ctn.offsetWidth
        const h = ctn.offsetHeight
        if (w < 2 || h < 2) return
        renderer.dpr = pickDpr(w, h)
        renderer.setSize(w, h)
      }

      const onContextLost = (e) => {
        e.preventDefault()
        cancelAnimationFrame(animateId)
        animateId = 0
        fail('context lost')
      }
      gl.canvas.addEventListener('webglcontextlost', onContextLost)
      window.addEventListener('resize', resize)

      const sizeObserver =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
      sizeObserver?.observe(ctn)

      const update = (t) => {
        if (disposed) return
        animateId = requestAnimationFrame(update)
        try {
          const current = propsRef.current
          const speed = current.speed ?? 1.0
          // Noticeable motion (~2× previous hero speed)
          program.uniforms.uTime.value = t * 0.001 * speed * 0.55
          program.uniforms.uAmplitude.value = current.amplitude ?? amplitude
          program.uniforms.uBlend.value = current.blend ?? blend
          renderer.render({ scene: mesh })
        } catch (err) {
          cancelAnimationFrame(animateId)
          fail(err)
        }
      }

      resize()
      renderer.render({ scene: mesh })
      markReady()
      animateId = requestAnimationFrame(update)

      // Second layout pass after fonts/nav settle
      requestAnimationFrame(() => {
        if (disposed) return
        resize()
        renderer.render({ scene: mesh })
        markReady()
      })

      return () => {
        disposed = true
        cancelAnimationFrame(animateId)
        sizeObserver?.disconnect()
        window.removeEventListener('resize', resize)
        gl.canvas.removeEventListener('webglcontextlost', onContextLost)
        if (gl.canvas.parentNode === ctn) ctn.removeChild(gl.canvas)
      }
    } catch (err) {
      fail(err)
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, blend])

  return <div ref={ctnDom} className="aurora-container" />
}
