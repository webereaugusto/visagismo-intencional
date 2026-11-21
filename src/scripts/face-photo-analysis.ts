/**
 * Análise do formato do rosto a partir de uma foto — roda 100% no navegador.
 * A imagem nunca é enviada a servidor algum: o MediaPipe (WASM + modelo) é servido
 * pelo próprio site em /mediapipe/ e processa a foto localmente.
 */
import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { SHAPES, SHAPE_ORDER, type ShapeKey, type ShapeParams } from './face-shapes';

const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/face_landmarker.task';
const MAX_SIDE = 1280;

/** Índices da malha facial do MediaPipe (468 pontos + íris). */
const LM = {
  top: 10,
  chin: 152,
  glabella: 9,
  subnasal: 2,
  noseTip: 1,
  eyeOuterR: 33,
  eyeOuterL: 263,
  foreheadR: 54,
  foreheadL: 284,
  cheekR: 234,
  cheekL: 454,
  jawR: 172,
  jawL: 397,
  chinR: 148,
  chinL: 377,
} as const;

/** Contorno do rosto (silhueta da malha), em ordem. */
const SILHOUETTE = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
  136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

type Pt = { x: number; y: number };

export interface Ratios {
  /** testa / maçãs */
  f: number;
  /** mandíbula / maçãs */
  j: number;
  /** comprimento / maçãs */
  l: number;
  /** largura do queixo / mandíbula */
  t: number;
}

export interface ShapeScore {
  shape: ShapeKey;
  pct: number;
}

export interface AnalysisResult {
  ratios: Ratios;
  scores: ShapeScore[];
  best: ShapeKey;
  /** Parâmetros 3D personalizados (mistura ponderada dos formatos). */
  params: ShapeParams;
  /**
   * Terços médio e inferior, em % da distância sobrancelhas→queixo.
   * O superior depende da linha do cabelo, que a malha facial não alcança com precisão.
   */
  thirds: [number, number];
  warnings: string[];
  /** Pontos em pixels da imagem analisada. */
  points: Pt[];
}

/** Erro com mensagem amigável para mostrar ao visitante. */
export class AnalysisError extends Error {
  override name = 'AnalysisError';
}

/* ------------------------------------------------------------------ */
/* Carregamento do modelo                                              */
/* ------------------------------------------------------------------ */

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

export function loadAnalyzer(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 3,
      });
    })();
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

/* ------------------------------------------------------------------ */
/* Imagem                                                              */
/* ------------------------------------------------------------------ */

/** Lê o arquivo, respeita a orientação EXIF e reduz para no máximo 1280px. */
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  if (!file.type.startsWith('image/')) throw new AnalysisError('Escolha um arquivo de imagem (JPG, PNG ou HEIC convertido).');
  let source: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    source = bmp;
    w = bmp.width;
    h = bmp.height;
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      source = img;
      w = img.naturalWidth;
      h = img.naturalHeight;
    } catch {
      throw new AnalysisError('Não conseguimos abrir essa imagem. Tente uma foto em JPG ou PNG.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ('close' in source && typeof source.close === 'function') source.close();
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Medidas e classificação                                             */
/* ------------------------------------------------------------------ */

/**
 * Médias das proporções medidas pelo MediaPipe num conjunto de rostos de referência.
 * Os protótipos de cada formato são desvios a partir dessa média.
 */
// Calibrado com 19 fotos frontais (média medida pelo MediaPipe). Um rosto "médio" cai em oval.
const MEAN: Ratios = { f: 0.855, j: 0.795, l: 1.21, t: 0.218 };
const SIGMA: Ratios = { f: 0.025, j: 0.025, l: 0.06, t: 0.01 };

const PROTOTYPES: Record<ShapeKey, Ratios> = {
  oval: { f: MEAN.f, j: MEAN.j - 0.02, l: MEAN.l + 0.08, t: MEAN.t - 0.005 },
  redondo: { f: MEAN.f + 0.01, j: MEAN.j + 0.03, l: MEAN.l - 0.12, t: MEAN.t + 0.008 },
  quadrado: { f: MEAN.f + 0.04, j: MEAN.j + 0.05, l: MEAN.l - 0.06, t: MEAN.t + 0.012 },
  coracao: { f: MEAN.f + 0.05, j: MEAN.j - 0.04, l: MEAN.l, t: MEAN.t - 0.012 },
  diamante: { f: MEAN.f - 0.05, j: MEAN.j - 0.04, l: MEAN.l + 0.04, t: MEAN.t - 0.01 },
  triangular: { f: MEAN.f - 0.05, j: MEAN.j + 0.05, l: MEAN.l - 0.03, t: MEAN.t + 0.01 },
};

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Sistema de coordenadas do rosto: u = direção entre os olhos, v = eixo vertical do rosto. */
function faceFrame(p: Pt[]) {
  const a = p[LM.eyeOuterR];
  const b = p[LM.eyeOuterL];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  let u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  if (u.x < 0) u = { x: -u.x, y: -u.y };
  const v = { x: -u.y, y: u.x };
  const origin = { x: (p[LM.cheekR].x + p[LM.cheekL].x) / 2, y: (p[LM.cheekR].y + p[LM.cheekL].y) / 2 };
  const toFace = (q: Pt) => ({
    a: (q.x - origin.x) * u.x + (q.y - origin.y) * u.y,
    b: (q.x - origin.x) * v.x + (q.y - origin.y) * v.y,
  });
  const toImg = (a: number, bb: number): Pt => ({ x: origin.x + a * u.x + bb * v.x, y: origin.y + a * u.y + bb * v.y });
  return { u, v, origin, toFace, toImg, roll: Math.atan2(u.y, u.x) };
}

/** Largura medida na direção horizontal do rosto (ignora a inclinação da cabeça). */
function widthAlong(p: Pt[], i: number, j: number, frame: ReturnType<typeof faceFrame>) {
  return Math.abs(frame.toFace(p[i]).a - frame.toFace(p[j]).a);
}

export function measure(points: Pt[]) {
  const frame = faceFrame(points);
  const F = widthAlong(points, LM.foreheadR, LM.foreheadL, frame);
  const C = widthAlong(points, LM.cheekR, LM.cheekL, frame);
  const J = widthAlong(points, LM.jawR, LM.jawL, frame);
  const T = widthAlong(points, LM.chinR, LM.chinL, frame);
  const topB = frame.toFace(points[LM.top]).b;
  const chinB = frame.toFace(points[LM.chin]).b;
  const L = Math.abs(chinB - topB);
  const ratios: Ratios = { f: F / C, j: J / C, l: L / C, t: T / J };
  return { frame, ratios, C, topB, chinB };
}

function classify(r: Ratios): ShapeScore[] {
  const raw = SHAPE_ORDER.map((shape) => {
    const p = PROTOTYPES[shape];
    const d2 =
      ((r.f - p.f) / SIGMA.f) ** 2 + ((r.j - p.j) / SIGMA.j) ** 2 + ((r.l - p.l) / SIGMA.l) ** 2 + ((r.t - p.t) / SIGMA.t) ** 2;
    return { shape, w: Math.exp(-d2 / 6) };
  });
  const total = raw.reduce((s, x) => s + x.w, 0) || 1;
  const scores = raw.map((x) => ({ shape: x.shape, pct: (x.w / total) * 100 }));
  scores.sort((a, b) => b.pct - a.pct);
  // arredonda mantendo soma 100
  let acc = 0;
  return scores.map((s, i) => {
    const pct = i === scores.length - 1 ? 100 - acc : Math.round(s.pct);
    acc += pct;
    return { shape: s.shape, pct: Math.max(0, pct) };
  });
}

function blendParams(scores: ShapeScore[]): ShapeParams {
  const weights = scores.map((s) => (s.pct / 100) ** 2);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const out: ShapeParams = { fw: 0, cw: 0, jw: 0, chin: 0, len: 0 };
  scores.forEach((s, i) => {
    const w = weights[i] / total;
    const p = SHAPES[s.shape];
    out.fw += p.fw * w;
    out.cw += p.cw * w;
    out.jw += p.jw * w;
    out.chin += p.chin * w;
    out.len += p.len * w;
  });
  return out;
}

const faceArea = (lms: NormalizedLandmark[]) => {
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const l of lms) {
    minX = Math.min(minX, l.x);
    maxX = Math.max(maxX, l.x);
    minY = Math.min(minY, l.y);
    maxY = Math.max(maxY, l.y);
  }
  return (maxX - minX) * (maxY - minY);
};

/** Detecta o rosto no canvas e devolve só as medidas (usado também na calibração). */
export async function detectPoints(canvas: HTMLCanvasElement): Promise<{ points: Pt[]; faces: number }> {
  const landmarker = await loadAnalyzer();
  const res = landmarker.detect(canvas);
  const faces = res.faceLandmarks ?? [];
  if (!faces.length) {
    throw new AnalysisError('Não encontramos um rosto na foto. Use uma foto de frente, bem iluminada e com o rosto inteiro visível.');
  }
  const main = faces.reduce((a, b) => (faceArea(b) > faceArea(a) ? b : a));
  return { points: main.map((l) => ({ x: l.x * canvas.width, y: l.y * canvas.height })), faces: faces.length };
}

export async function analyzeCanvas(canvas: HTMLCanvasElement): Promise<AnalysisResult> {
  const { points, faces } = await detectPoints(canvas);
  const { frame, ratios, C, chinB } = measure(points);

  const warnings: string[] = [];
  if (faces > 1) warnings.push('Encontramos mais de um rosto — analisamos o maior.');
  const nose = frame.toFace(points[LM.noseTip]).a;
  if (Math.abs(nose) / C > 0.07) warnings.push('O rosto parece um pouco virado de lado; uma foto bem de frente deixa a leitura mais precisa.');
  if (Math.abs(frame.roll) > (20 * Math.PI) / 180) warnings.push('A cabeça está inclinada — compensamos, mas o ideal é manter o rosto reto.');
  if (C < Math.min(canvas.width, canvas.height) * 0.18) warnings.push('O rosto ocupa pouco espaço na foto; aproxime a câmera para mais precisão.');

  const scores = classify(ratios);

  const brow = frame.toFace(points[LM.glabella]).b;
  const base = frame.toFace(points[LM.subnasal]).b;
  const mid = Math.round(((base - brow) / (chinB - brow)) * 100);
  const thirds: [number, number] = [mid, 100 - mid];

  return { ratios, scores, best: scores[0].shape, params: blendParams(scores), thirds, warnings, points };
}

/* ------------------------------------------------------------------ */
/* Desenho do resultado sobre a foto                                   */
/* ------------------------------------------------------------------ */

export function drawOverlay(target: HTMLCanvasElement, photo: HTMLCanvasElement, result: AnalysisResult) {
  const p = result.points;
  const { frame, C, topB, chinB } = measure(p);

  // Recorta em volta do rosto (com margem) para o resultado ficar focado
  const xs = p.map((q) => q.x);
  const ys = p.map((q) => q.y);
  const faceW = Math.max(...xs) - Math.min(...xs);
  const faceH = Math.max(...ys) - Math.min(...ys);
  const side = Math.max(faceW, faceH) * 1.6;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const sx = Math.max(0, Math.min(photo.width - Math.min(side, photo.width), cx - side / 2));
  const sy = Math.max(0, Math.min(photo.height - Math.min(side, photo.height), cy - side / 2));
  const sw = Math.min(side, photo.width);
  const sh = Math.min(side, photo.height);

  const out = 900;
  const scale = out / Math.max(sw, sh);
  target.width = Math.round(sw * scale);
  target.height = Math.round(sh * scale);
  const ctx = target.getContext('2d')!;
  ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, target.width, target.height);
  ctx.fillStyle = 'rgba(10,10,10,0.35)';
  ctx.fillRect(0, 0, target.width, target.height);

  const T = (q: Pt): Pt => ({ x: (q.x - sx) * scale, y: (q.y - sy) * scale });
  const lw = Math.max(2, target.width / 320);
  const gold = '#D4A853';
  const goldLight = '#E8C17A';

  // malha de pontos
  ctx.fillStyle = 'rgba(232,193,122,0.45)';
  for (const q of p) {
    const t = T(q);
    ctx.beginPath();
    ctx.arc(t.x, t.y, lw * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // contorno
  ctx.strokeStyle = goldLight;
  ctx.lineWidth = lw * 1.2;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(212,168,83,0.8)';
  ctx.shadowBlur = lw * 4;
  ctx.beginPath();
  SILHOUETTE.forEach((i, k) => {
    const t = T(p[i]);
    if (k === 0) ctx.moveTo(t.x, t.y);
    else ctx.lineTo(t.x, t.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  const line = (a: Pt, b: Pt) => {
    const ta = T(a);
    const tb = T(b);
    ctx.beginPath();
    ctx.moveTo(ta.x, ta.y);
    ctx.lineTo(tb.x, tb.y);
    ctx.stroke();
  };

  // terços e eixo (tracejados)
  ctx.setLineDash([lw * 4, lw * 3]);
  ctx.strokeStyle = 'rgba(212,168,83,0.85)';
  ctx.lineWidth = lw * 0.8;
  const hair = topB - (chinB - topB) * 0.04;
  const thirdsB = [hair, frame.toFace(p[LM.glabella]).b, frame.toFace(p[LM.subnasal]).b, chinB];
  const half = C * 0.62;
  for (const b of thirdsB) line(frame.toImg(-half, b), frame.toImg(half, b));
  line(frame.toImg(0, hair - C * 0.08), frame.toImg(0, chinB + C * 0.08));
  ctx.setLineDash([]);

  // barras de largura com rótulos
  ctx.font = `600 ${Math.round(lw * 6)}px Outfit, sans-serif`;
  ctx.textBaseline = 'middle';
  const bars: [number, number, string][] = [
    [LM.foreheadR, LM.foreheadL, 'Testa'],
    [LM.cheekR, LM.cheekL, 'Maçãs'],
    [LM.jawR, LM.jawL, 'Mandíbula'],
  ];
  for (const [i, j, label] of bars) {
    const fa = frame.toFace(p[i]);
    const fb = frame.toFace(p[j]);
    const b = (fa.b + fb.b) / 2;
    const left = frame.toImg(Math.min(fa.a, fb.a), b);
    const right = frame.toImg(Math.max(fa.a, fb.a), b);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lw;
    line(left, right);
    const tick = C * 0.03;
    for (const end of [left, right]) {
      const e = frame.toFace(end);
      line(frame.toImg(e.a, e.b - tick), frame.toImg(e.a, e.b + tick));
    }
    const tr = T(right);
    const text = label;
    const pad = lw * 2;
    const tw = ctx.measureText(text).width;
    const bx = Math.min(target.width - tw - pad * 3, tr.x + pad * 2);
    ctx.fillStyle = 'rgba(10,10,10,0.75)';
    ctx.fillRect(bx - pad, tr.y - lw * 5, tw + pad * 2, lw * 10);
    ctx.fillStyle = gold;
    ctx.fillText(text, bx, tr.y);
  }
}
