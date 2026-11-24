import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {ImagePipeline} from './ImagePipeline.js';
import {GrayscaleStage} from '../enhancement/processors.js';
describe('pipeline observability',()=>{
 it('describes enabled stages and reports stage lifecycle with dimensions',async()=>{const pipeline=new ImagePipeline([new GrayscaleStage()],{backend:'CPU'});const events:{phase:string}[]=[];const image=new ImageBuffer(16,16,new Uint8Array(16*16*3),'RGB');const result=await pipeline.process(image,{onProgress:p=>events.push({phase:p.phase})});expect(pipeline.describe().stages).toEqual([{name:'grayscale',enabled:true}]);expect(events.map(e=>e.phase)).toEqual(['start','complete']);expect(result.stages[0]!.metadata).toMatchObject({inputWidth:16,outputWidth:16,backend:'CPU'});});
 it('returns cancellation as a processing error',async()=>{const controller=new AbortController();controller.abort();const image=new ImageBuffer(16,16,new Uint8Array(256),'GRAY');const result=await new ImagePipeline([]).process(image,{signal:controller.signal});expect(result.success).toBe(false);expect(result.status).toBe('PROCESSING_ERROR');});
});
