import type { ProcessingResult } from './types.js';
import type { ImageBuffer } from '../image/ImageBuffer.js';
import type { CardGeometry } from '../geometry/types.js';
/** Stable, model-agnostic handoff contract for downstream computer-vision consumers. */
export interface StandardizedCardImage {
  contractVersion:'1.0';
  image:ImageBuffer;
  width:number;
  height:number;
  format:ImageBuffer['format'];
  geometry?:CardGeometry;
  grayscale?:ImageBuffer;
  binary?:ImageBuffer;
  quality:ProcessingResult['quality'];
  warnings:readonly string[];
}
/** Maps a successful pipeline result into the stable pixel/metadata contract. */
export function toStandardizedCardImage(result:ProcessingResult):StandardizedCardImage{
 if(!result.success)throw new Error(`Cannot create standardized image from unsuccessful result (${result.status})`);
 const standardized:StandardizedCardImage={contractVersion:'1.0',image:result.alignedColor,width:result.alignedColor.width,height:result.alignedColor.height,format:result.alignedColor.format,quality:result.quality,warnings:[...result.warnings]};
 if(result.geometry)standardized.geometry=result.geometry;
 const grayscale=result.grayscale??result.stages.find(stage=>stage.name==='grayscale')?.output;if(grayscale)standardized.grayscale=grayscale;
 const binary=result.binary??result.stages.find(stage=>stage.name.includes('threshold'))?.output;if(binary)standardized.binary=binary;
 return standardized;
}
