import type { ImageBuffer } from '../image/ImageBuffer.js';
import type { CardGeometry } from '../geometry/types.js';
export type ProcessingStatus = 'SUCCESS' | 'CARD_NOT_FOUND' | 'LOW_CONFIDENCE' | 'INVALID_IMAGE' | 'IMAGE_TOO_LARGE' | 'IMAGE_TOO_SMALL' | 'PROCESSING_ERROR';
export type StageName = string;
export interface StageRecord { name: StageName; durationMs: number; input: ImageBuffer; output: ImageBuffer; metadata?: Readonly<Record<string, unknown>> }
export interface ProcessingContext { debug: boolean; signal?: AbortSignal; metadata: Record<string, unknown> }
export interface ProcessingStage { readonly name: StageName; enabled?: boolean; process(image: ImageBuffer, context: ProcessingContext): ImageBuffer | Promise<ImageBuffer> }
export interface QualityMetrics { blur: number; exposure: number; contrast: number; glare: number; alignment: number; overall: number }
export interface ProcessingResult { success: boolean; status: ProcessingStatus; original: ImageBuffer; alignedColor: ImageBuffer; enhancedColor: ImageBuffer; grayscale?: ImageBuffer; binary?: ImageBuffer; geometry?: CardGeometry; stages: StageRecord[]; quality: QualityMetrics; metrics: { totalTimeMs: number; backend: string }; warnings: string[]; errors: string[] }
