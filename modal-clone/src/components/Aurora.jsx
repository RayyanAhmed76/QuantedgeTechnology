import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision mediump float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
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
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
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
  float intensity = 0.6 * height;
  float midPoint = 0.20;
  float alpha = smoothstep(midPoint - blend * 0.5, midPoint + blend * 0.5, intensity);
  return max(intensity * alpha, 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec3 leftRamp = rampColorAt(uv.x, uColorStops[0], uColorStops[1], uColorStops[2]);
  vec3 rightRamp = rampColorAt(1.0 - uv.x, uColorStops[0], uColorStops[1], uColorStops[2]);

  float left = auroraBand(uv, uTime, uAmplitude, uBlend, 0.0);
  float right = auroraBand(vec2(1.0 - uv.x, uv.y), uTime, uAmplitude, uBlend, 1.7);

  vec3 color = leftRamp * left + rightRamp * right;
  float alpha = min(left + right, 1.0);
  fragColor = vec4(color, alpha);
}
`

export default function Aurora(props) {
  const {
    colorStops = ['#5227FF', '#7cff67', '#5227FF'],
    amplitude = 1.0,
    blend = 0.5,
  } = props
  const propsRef = useRef(props)
  propsRef.current = props
  const ctnDom = useRef(null)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = reduceMotion ? 1 : Math.min(window.devicePixelRatio || 1, 1.25)

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.backgroundColor = 'transparent'

    let program
    let animateId = 0
    let visible = true
    let lastFrame = 0
    const frameInterval = 1000 / 30

    function resize() {
      if (!ctn) return
      const width = ctn.offsetWidth
      const height = ctn.offsetHeight
      renderer.setSize(width, height)
      if (program) {
        program.uniforms.uResolution.value = [width, height]
      }
    }
    window.addEventListener('resize', resize)

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv
    }

    const toStops = (stops) =>
      stops.map((hex) => {
        const c = new Color(hex)
        return [c.r, c.g, c.b]
      })

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: toStops(colorStops) },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctn.appendChild(gl.canvas)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !animateId) {
          animateId = requestAnimationFrame(update)
        }
      },
      { rootMargin: '80px' },
    )
    observer.observe(ctn)

    const update = (t) => {
      animateId = 0
      if (!visible) return

      if (!reduceMotion) {
        animateId = requestAnimationFrame(update)
      }

      if (t - lastFrame < frameInterval) return
      lastFrame = t

      const current = propsRef.current
      const speed = current.speed ?? 1.0
      program.uniforms.uTime.value = reduceMotion ? 0.8 : t * 0.01 * speed * 0.1
      program.uniforms.uAmplitude.value = current.amplitude ?? 1.0
      program.uniforms.uBlend.value = current.blend ?? blend
      renderer.render({ scene: mesh })
    }

    resize()
    if (reduceMotion) {
      update(0)
    } else {
      animateId = requestAnimationFrame(update)
    }

    return () => {
      cancelAnimationFrame(animateId)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, blend])

  return <div ref={ctnDom} className="aurora-container" />
}
