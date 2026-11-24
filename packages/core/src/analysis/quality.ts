import type { QualityMetrics } from '../core/types.js';
import { ImageBuffer } from '../image/ImageBuffer.js';
/** Deterministic, dependency-free quality indicators normalized to 0..1. */
export function analyzeQuality(image: ImageBuffer): QualityMetrics {
  const gray = new Float64Array(image.width * image.height); const hist = new Uint32Array(256); let sum = 0, clipped = 0;
  for (let p = 0; p < gray.length; p++) { const i = p * image.channels; const v = image.format === 'GRAY' ? image.data[i]! : Math.round(.2126 * image.data[i]! + .7152 * image.data[i + 1]! + .0722 * image.data[i + 2]!); gray[p] = v; hist[v] = hist[v]! + 1; sum += v; if (v >= 250) clipped++; }
  const mean = sum / gray.length; let variance = 0, lapSum = 0, lapSq = 0, n = 0;
  for (let y = 1; y < image.height - 1; y++) for (let x = 1; x < image.width - 1; x++) { const i = y * image.width + x; const lap = gray[i - image.width]! + gray[i + image.width]! + gray[i - 1]! + gray[i + 1]! - 4 * gray[i]!; lapSum += lap; lapSq += lap * lap; n++; }
  for (const v of gray) variance += (v - mean) ** 2;
  const lapVar = n ? Math.max(0, lapSq / n - (lapSum / n) ** 2) : 0;
  const blur = clamp(lapVar / 1200); const exposure = clamp(1 - Math.abs(mean - 127.5) / 127.5); const contrast = clamp(Math.sqrt(variance / gray.length) / 64); const glare = clamp(1 - clipped / gray.length); const overall = .35 * blur + .25 * exposure + .2 * contrast + .2 * glare;
  return { blur, exposure, contrast, glare, alignment: 0, overall };
}
function clamp(v: number): number { return Math.max(0, Math.min(1, v)); }
