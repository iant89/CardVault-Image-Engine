import { analyzeQuality } from './quality.js';
import { ImageBuffer } from '../image/ImageBuffer.js';
export interface QualityReport { scores:{blur:number;sharpness:number;exposure:number;contrast:number;glare:number;overall:number}; warnings:string[] }
export interface QualityThresholds { minSharpness?:number; minExposure?:number; minContrast?:number; minGlareScore?:number }
/** Produces normalized 0..1 quality indicators and actionable capture warnings. */
export function analyzeImageQuality(image:ImageBuffer,thresholds:QualityThresholds={}):QualityReport{
 const minSharpness=thresholds.minSharpness??0.25,minExposure=thresholds.minExposure??0.35,minContrast=thresholds.minContrast??0.2,minGlare=thresholds.minGlareScore??0.75;
 for(const value of [minSharpness,minExposure,minContrast,minGlare])if(!Number.isFinite(value)||value<0||value>1)throw new RangeError('Quality thresholds must be in the range 0..1');
 const metrics=analyzeQuality(image),sharpness=metrics.blur,warnings:string[]=[];
 if(sharpness<minSharpness)warnings.push('IMAGE_BLUR: image sharpness is below the recommended threshold');
 if(metrics.exposure<minExposure)warnings.push('EXPOSURE: image may be too dark or too bright');
 if(metrics.contrast<minContrast)warnings.push('LOW_CONTRAST: image contrast is low');
 if(metrics.glare<minGlare)warnings.push('GLARE: clipped highlights may obscure card details');
 return {scores:{blur:1-sharpness,sharpness,exposure:metrics.exposure,contrast:metrics.contrast,glare:metrics.glare,overall:metrics.overall},warnings};
}
