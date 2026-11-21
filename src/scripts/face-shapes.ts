/**
 * Geometria paramétrica dos formatos de rosto — sem dependências,
 * usada tanto pelo 3D (face-map-3d.ts) quanto pelo SVG estático do componente.
 *
 * Coordenadas "unitárias": y vai de 1 (topo da cabeça) a -1 (queixo).
 * Linhas de referência (terços faciais iguais): cabelo 0.62, sobrancelha 0.08,
 * base do nariz -0.46, queixo -1.
 */

export type ShapeKey = 'oval' | 'redondo' | 'quadrado' | 'coracao' | 'diamante' | 'triangular';

export interface ShapeParams {
  /** largura da testa */
  fw: number;
  /** largura das maçãs do rosto */
  cw: number;
  /** largura da mandíbula */
  jw: number;
  /** 0 = queixo reto e largo, 1 = queixo fino e pontudo */
  chin: number;
  /** comprimento do rosto (escala vertical) */
  len: number;
}

export const SHAPES: Record<ShapeKey, ShapeParams> = {
  oval: { fw: 0.92, cw: 1.0, jw: 0.8, chin: 0.62, len: 1.32 },
  redondo: { fw: 0.94, cw: 1.06, jw: 0.93, chin: 0.5, len: 1.12 },
  quadrado: { fw: 1.0, cw: 1.0, jw: 1.0, chin: 0, len: 1.18 },
  coracao: { fw: 1.06, cw: 0.98, jw: 0.7, chin: 0.92, len: 1.26 },
  diamante: { fw: 0.78, cw: 1.06, jw: 0.74, chin: 0.82, len: 1.3 },
  triangular: { fw: 0.8, cw: 0.92, jw: 1.0, chin: 0.25, len: 1.22 },
};

export const SHAPE_ORDER: ShapeKey[] = ['oval', 'redondo', 'quadrado', 'coracao', 'diamante', 'triangular'];

/** Escala horizontal aplicada à largura do perfil. */
export const X_SCALE = 0.8;

/** Alturas (unitárias) das barras de largura: testa, maçãs, mandíbula. */
export const WIDTH_MARKERS = { forehead: 0.35, cheek: -0.12, jaw: -0.62 } as const;

/** Alturas (unitárias) das linhas dos terços faciais. */
export const THIRDS = [0.62, 0.08, -0.46, -1] as const;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Meia-largura do rosto (antes de X_SCALE) na altura unitária y. */
export function widthAt(y: number, p: ShapeParams): number {
  if (y >= 0.45) {
    const t = (y - 0.45) / 0.55;
    return p.fw * Math.sqrt(Math.max(0, 1 - t * t));
  }
  if (y >= -0.12) return lerp(p.cw, p.fw, smooth((y + 0.12) / 0.57));
  // Metade inferior: superelipse (n alto = queixo reto, n baixo = queixo fino)
  // multiplicada por uma largura-base que vai das maçãs até a mandíbula.
  const s = clamp01((-0.12 - y) / 0.88);
  const n = lerp(6, 1.7, p.chin);
  const ellipse = (u: number) => Math.pow(Math.max(0, 1 - Math.pow(u, n)), 1 / n);
  const jawBase = p.jw / ellipse(JAW_S);
  const u = clamp01(s / JAW_S);
  const base = lerp(p.cw, jawBase, u * u * (2 - u) * 0.5 + u * 0.5);
  return base * ellipse(s);
}

/** Posição relativa (0 = maçãs, 1 = queixo) onde a largura da mandíbula é medida. */
const JAW_S = 0.57;

export function lerpParams(a: ShapeParams, b: ShapeParams, t: number): ShapeParams {
  return {
    fw: lerp(a.fw, b.fw, t),
    cw: lerp(a.cw, b.cw, t),
    jw: lerp(a.jw, b.jw, t),
    chin: lerp(a.chin, b.chin, t),
    len: lerp(a.len, b.len, t),
  };
}

/**
 * Caminho SVG do contorno frontal do rosto (da linha do cabelo ao queixo),
 * centralizado em (cx, cy) com a escala informada.
 */
export function contourPath(p: ShapeParams, scale = 40, cx = 50, cy = 50, steps = 48): string {
  const pts: [number, number][] = [];
  const top = 0.62;
  for (let i = 0; i <= steps; i++) {
    const y = lerp(top, -1, i / steps);
    pts.push([widthAt(y, p) * X_SCALE, y * p.len]);
  }
  const midY = ((top - 1) / 2) * p.len;
  const fmt = (x: number, y: number) => `${(cx + x * scale).toFixed(2)},${(cy - (y - midY) * scale).toFixed(2)}`;
  const right = pts.map(([x, y]) => fmt(x, y));
  const left = pts
    .slice()
    .reverse()
    .map(([x, y]) => fmt(-x, y));
  return `M${right.join('L')}L${left.join('L')}Z`;
}
