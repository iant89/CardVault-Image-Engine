export interface Point { x: number; y: number }
export type Quad = readonly [Point, Point, Point, Point];
export interface CardProfile { name: string; aspectRatio: number; tolerance: number; targetWidth: number; targetHeight: number }
export const STANDARD_TRADING_CARD: CardProfile = Object.freeze({ name: 'standard-trading-card', aspectRatio: 0.714, tolerance: 0.12, targetWidth: 744, targetHeight: 1040 });
export interface CardGeometry { corners: Quad; homography: readonly number[]; rotation: number; width: number; height: number; confidence: number }
