import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  DirectionalLight,
  MeshStandardMaterial,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineDashedMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import {
  SHAPES,
  THIRDS,
  WIDTH_MARKERS,
  X_SCALE,
  lerp,
  lerpParams,
  widthAt,
  type ShapeKey,
  type ShapeParams,
} from './face-shapes';

const GOLD = new Color('#D4A853');
const GOLD_LIGHT = new Color('#E8C17A');
const DEPTH = 0.95;

export interface FaceMapController {
  setShape(shape: ShapeKey): void;
  /** Formato personalizado (ex.: resultado da análise da foto). */
  setParams(params: ShapeParams): void;
  destroy(): void;
}

interface Options {
  shape: ShapeKey;
  reducedMotion: boolean;
  onReady?: () => void;
}

const gauss = (d2: number) => Math.exp(-d2);

/** Relevo dos traços (nariz, olhos, boca, queixo) somado à profundidade frontal. */
function features(xu: number, y: number): number {
  const ax = Math.abs(xu);
  let b = 0;
  // nariz: cresce da raiz (entre os olhos) até a ponta e cai na base
  const noseRamp = Math.min(1, Math.max(0, (0.05 - y) / 0.47));
  const noseCut = Math.min(1, Math.max(0, (y + 0.5) / 0.06));
  b += 0.26 * gauss((xu / (0.06 + 0.06 * noseRamp)) ** 2) * noseRamp ** 1.3 * noseCut;
  // asas do nariz
  b += 0.05 * gauss((ax - 0.1) ** 2 / 0.003 + (y + 0.44) ** 2 / 0.003);
  // órbitas dos olhos
  b -= 0.12 * gauss((ax - 0.36) ** 2 / 0.016 + (y + 0.02) ** 2 / 0.007);
  // globo ocular
  b += 0.04 * gauss((ax - 0.36) ** 2 / 0.004 + (y + 0.03) ** 2 / 0.002);
  // sobrancelhas
  b += 0.06 * gauss((ax - 0.34) ** 2 / 0.03 + (y - 0.1) ** 2 / 0.002);
  // maçãs do rosto
  b += 0.04 * gauss((ax - 0.5) ** 2 / 0.02 + (y + 0.2) ** 2 / 0.01);
  // lábios
  b += 0.06 * gauss(xu ** 2 / 0.035 + (y + 0.63) ** 2 / 0.002);
  b += 0.05 * gauss(xu ** 2 / 0.03 + (y + 0.71) ** 2 / 0.0018);
  b -= 0.03 * gauss(xu ** 2 / 0.05 + (y + 0.67) ** 2 / 0.0004);
  // queixo
  b += 0.04 * gauss(xu ** 2 / 0.03 + (y + 0.88) ** 2 / 0.006);
  return b;
}

const LIGHT = { x: 0.45, y: 0.55, z: 0.7 };

/**
 * Cor por vértice com iluminação "assada" (blending aditivo — escuro = transparente):
 * a frente do rosto brilha mais e o relevo (nariz, olhos, boca) aparece pelo sombreamento.
 */
function shade(geo: BufferGeometry, base: Float32Array) {
  geo.computeVertexNormals();
  const n = geo.attributes.normal.array as Float32Array;
  let attr = geo.getAttribute('color') as BufferAttribute | undefined;
  if (!attr) {
    attr = new BufferAttribute(new Float32Array(base.length), 3);
    geo.setAttribute('color', attr);
  }
  const colors = attr.array as Float32Array;
  const len = Math.hypot(LIGHT.x, LIGHT.y, LIGHT.z);
  for (let i = 0; i < base.length; i += 3) {
    const ang = Math.atan2(base[i + 2], base[i]);
    const front = ((Math.sin(ang) + 1) / 2) ** 2;
    const diffuse = Math.max(0, (n[i] * LIGHT.x + n[i + 1] * LIGHT.y + n[i + 2] * LIGHT.z) / len);
    const k = (0.05 + 0.95 * front) * (0.25 + 0.95 * diffuse ** 1.5);
    colors[i] = GOLD.r * k;
    colors[i + 1] = GOLD.g * k;
    colors[i + 2] = GOLD.b * k;
  }
  attr.needsUpdate = true;
}

/** Guarda as direções da esfera-base para recalcular a cabeça a cada morph. */
function makeHead(segments: number) {
  const geo = new SphereGeometry(1, segments, segments);
  const base = (geo.attributes.position.array as Float32Array).slice();
  return { geo, base };
}

function deformHead(geo: BufferGeometry, base: Float32Array, p: ShapeParams) {
  const pos = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < base.length; i += 3) {
    const bx = base[i];
    const by = base[i + 1];
    const bz = base[i + 2];
    const ang = Math.atan2(bz, bx);
    const w = widthAt(by, p);
    const xu = Math.cos(ang) * w;
    const front = Math.max(0, Math.sin(ang)) ** 2;
    pos[i] = xu * X_SCALE;
    pos[i + 1] = by * p.len;
    pos[i + 2] = Math.sin(ang) * w * DEPTH + features(xu, by) * front;
  }
  geo.attributes.position.needsUpdate = true;
}

function makeNeck(): Points {
  const pts: number[] = [];
  const cols: number[] = [];
  const rings = 22;
  const around = 40;
  for (let r = 0; r < rings; r++) {
    const t = r / (rings - 1);
    const y = lerp(-0.95, -2.1, t);
    const radius = 0.3 + 0.06 * t * t;
    for (let a = 0; a < around; a++) {
      const ang = (a / around) * Math.PI * 2;
      pts.push(Math.cos(ang) * radius, y, Math.sin(ang) * radius * 0.92 - 0.18);
      const k = (1 - t) ** 1.8 * (0.25 + 0.5 * ((Math.sin(ang) + 1) / 2));
      cols.push(GOLD.r * k, GOLD.g * k, GOLD.b * k);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3));
  geo.setAttribute('color', new BufferAttribute(new Float32Array(cols), 3));
  return new Points(
    geo,
    new PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false })
  );
}

function lineGeo(count: number) {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  return geo;
}

export function initFaceMap(canvas: HTMLCanvasElement, opts: Options): FaceMapController {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 8.2);

  const head = new Group();
  head.position.y = 0.4;
  scene.add(head);

  // Superfície sólida escura e metálica (dá volume e revela o relevo) + nuvem de pontos dourada
  scene.add(new AmbientLight(0xffffff, 0.25));
  const key = new DirectionalLight(GOLD_LIGHT, 2.4);
  key.position.set(4, 2.5, 3);
  scene.add(key);
  const rim = new DirectionalLight(GOLD, 2.2);
  rim.position.set(-3.5, 1.5, -2.5);
  scene.add(rim);

  const pointHead = makeHead(96);
  const solid = new Mesh(
    pointHead.geo,
    new MeshStandardMaterial({
      color: 0x2a2114,
      metalness: 0.65,
      roughness: 0.42,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
  );
  head.add(solid);

  const points = new Points(
    pointHead.geo,
    new PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  );
  head.add(points);

  const wireHead = makeHead(36);
  const wire = new Mesh(
    wireHead.geo,
    new MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0.05, blending: AdditiveBlending, depthWrite: false })
  );
  head.add(wire);
  head.add(makeNeck());

  // Camada de análise: contorno, barras de largura, terços, eixo e scanner
  const analysis = new Group();
  head.add(analysis);

  const CONTOUR_STEPS = 72;
  const contour = new LineLoop(
    lineGeo(CONTOUR_STEPS * 2 + 2),
    new LineBasicMaterial({ color: GOLD_LIGHT, transparent: true, opacity: 0.95, depthTest: false })
  );
  analysis.add(contour);

  const bars = new LineSegments(
    lineGeo(3 * 6),
    new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthTest: false })
  );
  analysis.add(bars);

  const thirds = new LineSegments(
    lineGeo(THIRDS.length * 2 + 2),
    new LineDashedMaterial({ color: GOLD, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.5, depthTest: false })
  );
  analysis.add(thirds);

  const SCAN_STEPS = 64;
  const scan = new LineLoop(
    lineGeo(SCAN_STEPS),
    new LineBasicMaterial({ color: GOLD_LIGHT, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false })
  );
  head.add(scan);

  function updateAnalysis(p: ShapeParams) {
    // contorno frontal (plano z=0)
    const c = contour.geometry.attributes.position.array as Float32Array;
    let k = 0;
    for (let i = 0; i <= CONTOUR_STEPS; i++) {
      const y = lerp(0.62, -1, i / CONTOUR_STEPS);
      c[k++] = widthAt(y, p) * X_SCALE + 0.015;
      c[k++] = y * p.len;
      c[k++] = 0;
    }
    for (let i = CONTOUR_STEPS; i >= 0; i--) {
      const y = lerp(0.62, -1, i / CONTOUR_STEPS);
      c[k++] = -(widthAt(y, p) * X_SCALE + 0.015);
      c[k++] = y * p.len;
      c[k++] = 0;
    }
    contour.geometry.attributes.position.needsUpdate = true;

    // barras: testa, maçãs e mandíbula, com marcações nas pontas
    const b = bars.geometry.attributes.position.array as Float32Array;
    k = 0;
    for (const yu of [WIDTH_MARKERS.forehead, WIDTH_MARKERS.cheek, WIDTH_MARKERS.jaw]) {
      const x = widthAt(yu, p) * X_SCALE + 0.015;
      const y = yu * p.len;
      const tick = 0.05;
      b.set([-x, y, 0, x, y, 0, -x, y - tick, 0, -x, y + tick, 0, x, y - tick, 0, x, y + tick, 0], k);
      k += 18;
    }
    bars.geometry.attributes.position.needsUpdate = true;

    // terços faciais + eixo de simetria
    const t = thirds.geometry.attributes.position.array as Float32Array;
    k = 0;
    const half = 1.15;
    for (const yu of THIRDS) {
      t.set([-half, yu * p.len, 0, half, yu * p.len, 0], k);
      k += 6;
    }
    t.set([0, 0.75 * p.len, 0, 0, -1.08 * p.len, 0], k);
    thirds.geometry.attributes.position.needsUpdate = true;
    thirds.computeLineDistances();

    for (const obj of [contour, bars, thirds]) obj.geometry.computeBoundingSphere();
  }

  function updateScan(p: ShapeParams, time: number) {
    const yu = Math.sin(time * 0.6) * 0.8 - 0.15;
    const w = widthAt(yu, p) + 0.04;
    const s = scan.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < SCAN_STEPS; i++) {
      const a = (i / SCAN_STEPS) * Math.PI * 2;
      s[i * 3] = Math.cos(a) * w * X_SCALE;
      s[i * 3 + 1] = yu * p.len;
      s[i * 3 + 2] = Math.sin(a) * w * DEPTH;
    }
    scan.geometry.attributes.position.needsUpdate = true;
    scan.geometry.computeBoundingSphere();
  }

  let current: ShapeParams = { ...SHAPES[opts.shape] };
  let target: ShapeParams = { ...SHAPES[opts.shape] };
  let dirty = true;

  function applyShape(p: ShapeParams) {
    deformHead(pointHead.geo, pointHead.base, p);
    shade(pointHead.geo, pointHead.base);
    deformHead(wireHead.geo, wireHead.base, p);
    pointHead.geo.computeBoundingSphere();
    wireHead.geo.computeBoundingSphere();
    updateAnalysis(p);
  }

  // Interação: arrastar gira a cabeça; ao soltar ela volta devagar
  let userYaw = 0;
  let userPitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    userYaw = Math.max(-1.4, Math.min(1.4, userYaw + (e.clientX - lastX) * 0.01));
    userPitch = Math.max(-0.35, Math.min(0.35, userPitch + (e.clientY - lastY) * 0.005));
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // Só renderiza quando visível
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  io.observe(canvas);
  const onVisibility = () => {
    if (!document.hidden) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  let raf = 0;
  let last = performance.now();
  let readyFired = false;

  function frame(now: number) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (dirty) {
      const rate = opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
      current = lerpParams(current, target, rate);
      const diff =
        Math.abs(current.fw - target.fw) +
        Math.abs(current.cw - target.cw) +
        Math.abs(current.jw - target.jw) +
        Math.abs(current.chin - target.chin) +
        Math.abs(current.len - target.len);
      if (diff < 0.001) {
        current = { ...target };
        dirty = false;
      }
      applyShape(current);
    }

    if (!dragging) {
      userYaw *= 1 - Math.min(1, dt * 1.2);
      userPitch *= 1 - Math.min(1, dt * 1.2);
    }
    const sway = opts.reducedMotion ? 0.35 : 0.3 + Math.sin(now / 1000 * 0.45) * 0.55;
    head.rotation.y = sway + userYaw;
    head.rotation.x = 0.06 + userPitch;

    scan.visible = !opts.reducedMotion;
    if (scan.visible) updateScan(current, now / 1000);

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      opts.onReady?.();
    }

    const animating = dirty || dragging || !opts.reducedMotion || Math.abs(userYaw) > 0.001;
    if (animating) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  canvas.addEventListener('pointerdown', start);
  start();

  return {
    setShape(shape) {
      target = { ...SHAPES[shape] };
      dirty = true;
      start();
    },
    setParams(params) {
      target = { ...params };
      dirty = true;
      start();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((obj) => {
        const o = obj as Mesh;
        o.geometry?.dispose();
        const m = o.material as MeshBasicMaterial | MeshBasicMaterial[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose();
      });
      renderer.dispose();
    },
  };
}
