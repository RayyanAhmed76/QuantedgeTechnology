import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import "./PrismaticBurst.css";

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* Optimized: mediump, fewer noise octaves, 22 march steps, skip bend when distort=0 */
const fragmentShader = `#version 300 es
precision mediump float;
precision mediump int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
    p = floor(p);
    return fract(52.9829189 * fract(dot(p, vec2(0.065, 0.005))));
}

float layeredNoise(vec2 fragPx){
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    mat2 R = mat2(0.8, -0.5, 0.5, 0.8);
    vec2 q = R * p;
    return 0.55 * hash21(q) + 0.30 * hash21(q * 2.0 + 17.0) + 0.15 * hash21(q * 4.0 + 47.0);
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset){
    float focal = res.y;
    return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
    vec2 toC = frag - 0.5 * res - offset;
    float r = length(toC) / (0.5 * min(res.x, res.y));
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * (3.0 - 2.0 * x);
    return clamp(pow(q * 0.5, 1.35), 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
    return texture(uGradient, vec2(clamp(t, 0.0, 1.0), 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

void main(){
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * uSpeed;
    float jitterAmp = 0.08 * clamp(uNoiseAmount, 0.0, 1.0);
    vec3 dir = rayDir(frag, uResolution, uOffset);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);
    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

    mat3 rotMat = mat3(1.0);
    if(uAnimType == 1){
      vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
      rotMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
    } else if(uAnimType == 2){
      vec2 m = uMouse * 2.0 - 1.0;
      rotMat = rotY(m.x * 0.6) * rotX(m.y * 0.6);
    }

    for (int i = 0; i < 22; ++i) {
        vec3 P = marchT * dir;
        P.z -= 2.0;
        float rad = length(P);
        vec3 Pl = P * (10.0 / max(rad, 1e-6));

        if(uAnimType == 0){
            Pl.xz *= M2;
        } else {
            Pl = rotMat * Pl;
        }

        float stepLen = min(rad - 0.3, n * jitterAmp) + 0.12;
        vec3 Pb = Pl;

        if (amp > 0.001) {
            float grow = smoothstep(0.35, 3.0, marchT);
            float a1 = amp * grow * (
                0.8 * sin(Pl.x * 0.55 + t * 0.6) +
                0.7 * sin(Pl.y * 0.50 - t * 0.5)
            );
            Pb.xz = rot2(Pb.xz, a1);
        }

        float rayPattern = smoothstep(
            0.5, 0.7,
            sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
            sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
        );

        if (uRayCount > 0) {
            float ang = atan(Pb.y, Pb.x);
            float comb = pow(0.5 + 0.5 * cos(float(uRayCount) * ang), 3.0);
            rayPattern *= smoothstep(0.15, 0.95, comb);
        }

        float saw = fract(marchT * 0.25);
        float tRay = saw * saw * (3.0 - 2.0 * saw);
        vec3 spectral = (uColorCount > 0)
            ? 2.0 * sampleGradient(tRay)
            : 1.0 + vec3(cos(marchT * 3.0), cos(marchT * 3.0 + 1.0), cos(marchT * 3.0 + 2.0));

        col += (0.05 / (0.4 + stepLen)) * smoothstep(5.0, 0.0, rad) * spectral * rayPattern;
        marchT += stepLen;
    }

    col *= edgeFade(frag, uResolution, uOffset);
    col *= uIntensity;
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToRgb01(hex) {
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const intVal = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(intVal)) return [1, 1, 1];
  return [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ];
}

function toPx(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const num = parseFloat(String(v).trim().replace("px", ""));
  return Number.isNaN(num) ? 0 : num;
}

export default function PrismaticBurst({
  intensity = 2,
  speed = 0.5,
  animationType = "rotate3d",
  colors,
  distort = 0,
  paused = false,
  offset = { x: 0, y: 0 },
  hoverDampness = 0,
  rayCount,
  mixBlendMode = "normal",
  lightMode = false,
  renderScale = 0.55,
  maxFps = 30,
}) {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseTargetRef = useRef([0.5, 0.5]);
  const mouseSmoothRef = useRef([0.5, 0.5]);
  const pausedRef = useRef(paused);
  const gradTexRef = useRef(null);
  const hoverDampRef = useRef(hoverDampness);
  const isVisibleRef = useRef(true);
  const meshRef = useRef(null);
  const propsRef = useRef({
    intensity,
    speed,
    animationType,
    colors,
    distort,
    offset,
    rayCount,
    lightMode,
  });

  propsRef.current = {
    intensity,
    speed,
    animationType,
    colors,
    distort,
    offset,
    rayCount,
    lightMode,
  };

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    hoverDampRef.current = hoverDampness;
  }, [hoverDampness]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scale = Math.min(1, Math.max(0.35, renderScale));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25) * scale;
    const renderer = new Renderer({
      dpr,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;

    const gl = renderer.gl;
    gl.canvas.style.position = "absolute";
    gl.canvas.style.inset = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    // Avoid expensive CSS mix-blend when possible
    const blend =
      lightMode || !mixBlendMode || mixBlendMode === "none"
        ? "normal"
        : mixBlendMode;
    gl.canvas.style.mixBlendMode = blend === "normal" ? "" : blend;
    container.appendChild(gl.canvas);

    const white = new Uint8Array([255, 255, 255, 255]);
    const gradientTex = new Texture(gl, {
      image: white,
      width: 1,
      height: 1,
      generateMipmaps: false,
      flipY: false,
    });
    gradientTex.minFilter = gl.LINEAR;
    gradientTex.magFilter = gl.LINEAR;
    gradientTex.wrapS = gl.CLAMP_TO_EDGE;
    gradientTex.wrapT = gl.CLAMP_TO_EDGE;
    gradTexRef.current = gradientTex;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uAnimType: { value: 1 },
        uMouse: { value: [0.5, 0.5] },
        uColorCount: { value: 0 },
        uDistort: { value: distort },
        uOffset: { value: [0, 0] },
        uGradient: { value: gradientTex },
        uNoiseAmount: { value: 0.45 },
        uRayCount: { value: 0 },
      },
    });
    programRef.current = program;

    const triangle = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry: triangle, program });
    meshRef.current = mesh;

    const applyUniforms = () => {
      const p = propsRef.current;
      program.uniforms.uIntensity.value = p.intensity ?? 1;
      program.uniforms.uSpeed.value = p.speed ?? 1;
      const animTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };
      program.uniforms.uAnimType.value =
        animTypeMap[p.animationType ?? "rotate"] ?? 0;
      program.uniforms.uDistort.value =
        typeof p.distort === "number" ? p.distort : 0;
      program.uniforms.uOffset.value = [toPx(p.offset?.x), toPx(p.offset?.y)];
      program.uniforms.uRayCount.value = Math.max(
        0,
        Math.floor(p.rayCount ?? 0),
      );

      let count = 0;
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        const capped = p.colors.slice(0, 64);
        count = capped.length;
        const data = new Uint8Array(count * 4);
        for (let i = 0; i < count; i++) {
          const [r, g, b] = hexToRgb01(capped[i]);
          data[i * 4] = Math.round(r * 255);
          data[i * 4 + 1] = Math.round(g * 255);
          data[i * 4 + 2] = Math.round(b * 255);
          data[i * 4 + 3] = 255;
        }
        gradientTex.image = data;
        gradientTex.width = count;
        gradientTex.height = 1;
        gradientTex.needsUpdate = true;
      }
      program.uniforms.uColorCount.value = count;
    };

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      // Cap pixel count for very large screens
      const maxW = 1100;
      const maxH = 700;
      const fit = Math.min(1, maxW / w, maxH / h);
      renderer.dpr = dpr * fit;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
      ];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);
    resize();
    applyUniforms();

    const needsHover = animationType === "hover";
    const onPointer = (e) => {
      if (!needsHover) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
      mouseTargetRef.current = [
        Math.min(Math.max(x, 0), 1),
        Math.min(Math.max(y, 0), 1),
      ];
    };
    if (needsHover) {
      container.addEventListener("pointermove", onPointer, { passive: true });
    }

    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            isVisibleRef.current = entries[0].isIntersecting;
          }
        },
        { root: null, threshold: 0.05 },
      );
      io.observe(container);
    }

    let raf = 0;
    let last = performance.now();
    let accumTime = 0;
    let running = true;
    const frameInterval = 1000 / Math.max(12, Math.min(60, maxFps));
    let lastDraw = 0;

    const update = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(update);

      const visible = isVisibleRef.current && !document.hidden;
      if (!visible || pausedRef.current) {
        last = now;
        return;
      }

      const dt = Math.max(0, now - last) * 0.001;
      last = now;
      accumTime += dt;

      if (now - lastDraw < frameInterval) return;
      lastDraw = now;

      if (needsHover) {
        const tau = 0.02 + Math.max(0, Math.min(1, hoverDampRef.current)) * 0.5;
        const alpha = 1 - Math.exp(-dt / tau);
        const tgt = mouseTargetRef.current;
        const sm = mouseSmoothRef.current;
        sm[0] += (tgt[0] - sm[0]) * alpha;
        sm[1] += (tgt[1] - sm[1]) * alpha;
        program.uniforms.uMouse.value = sm;
      }

      program.uniforms.uTime.value = accumTime;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (needsHover) {
        container.removeEventListener("pointermove", onPointer);
      }
      ro.disconnect();
      window.removeEventListener("resize", resize);
      io?.disconnect();
      try {
        container.removeChild(gl.canvas);
      } catch {
        /* already removed */
      }
      programRef.current = null;
      rendererRef.current = null;
      gradTexRef.current = null;
      meshRef.current = null;
    };
    }, [renderScale, maxFps, animationType]);

  useEffect(() => {
    const canvas = rendererRef.current?.gl?.canvas;
    if (!canvas) return;
    const blend =
      lightMode || !mixBlendMode || mixBlendMode === "none"
        ? "normal"
        : mixBlendMode;
    canvas.style.mixBlendMode = blend === "normal" ? "" : blend;
  }, [mixBlendMode, lightMode]);

  useEffect(() => {
    const program = programRef.current;
    const renderer = rendererRef.current;
    const gradTex = gradTexRef.current;
    if (!program || !renderer || !gradTex) return;

    program.uniforms.uIntensity.value = intensity ?? 1;
    program.uniforms.uSpeed.value = speed ?? 1;
    const animTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };
    program.uniforms.uAnimType.value =
      animTypeMap[animationType ?? "rotate"] ?? 0;
    program.uniforms.uDistort.value =
      typeof distort === "number" ? distort : 0;
    program.uniforms.uOffset.value = [toPx(offset?.x), toPx(offset?.y)];
    program.uniforms.uRayCount.value = Math.max(0, Math.floor(rayCount ?? 0));

    let count = 0;
    if (Array.isArray(colors) && colors.length > 0) {
      const gl = renderer.gl;
      const capped = colors.slice(0, 64);
      count = capped.length;
      const data = new Uint8Array(count * 4);
      for (let i = 0; i < count; i++) {
        const [r, g, b] = hexToRgb01(capped[i]);
        data[i * 4] = Math.round(r * 255);
        data[i * 4 + 1] = Math.round(g * 255);
        data[i * 4 + 2] = Math.round(b * 255);
        data[i * 4 + 3] = 255;
      }
      gradTex.image = data;
      gradTex.width = count;
      gradTex.height = 1;
      gradTex.minFilter = gl.LINEAR;
      gradTex.magFilter = gl.LINEAR;
      gradTex.needsUpdate = true;
    }
    program.uniforms.uColorCount.value = count;
  }, [
    intensity,
    speed,
    animationType,
    colors,
    distort,
    offset,
    rayCount,
    lightMode,
  ]);

  return <div className="prismatic-burst-container" ref={containerRef} />;
}
