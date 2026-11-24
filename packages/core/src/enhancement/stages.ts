import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
import { clahe,type ClaheOptions } from './clahe.js';
import { adaptiveMeanThreshold,otsuThreshold,type ThresholdResult } from './threshold.js';
import { niblackThreshold,sauvolaThreshold,type LocalThresholdOptions } from './localThreshold.js';
export class ClaheStage implements ProcessingStage {enabled=true;readonly name='clahe-contrast';constructor(readonly options:ClaheOptions={}){}process(image:ImageBuffer,_context:ProcessingContext){return clahe(image,this.options);}}
export class OtsuThresholdStage implements ProcessingStage {enabled=true;readonly name='otsu-threshold';lastThreshold?:number;process(image:ImageBuffer,_context:ProcessingContext){const result:ThresholdResult=otsuThreshold(image);this.lastThreshold=result.threshold;return result.image;}}
export class AdaptiveMeanThresholdStage implements ProcessingStage {enabled=true;readonly name='adaptive-mean-threshold';constructor(readonly windowSize=15,readonly offset=7){}process(image:ImageBuffer,_context:ProcessingContext){return adaptiveMeanThreshold(image,this.windowSize,this.offset);}}
export class NiblackThresholdStage implements ProcessingStage {enabled=true;readonly name='niblack-threshold';constructor(readonly options:LocalThresholdOptions={}){}process(image:ImageBuffer,_context:ProcessingContext){return niblackThreshold(image,this.options);}}
export class SauvolaThresholdStage implements ProcessingStage {enabled=true;readonly name='sauvola-threshold';constructor(readonly options:LocalThresholdOptions={}){}process(image:ImageBuffer,_context:ProcessingContext){return sauvolaThreshold(image,this.options);}}
