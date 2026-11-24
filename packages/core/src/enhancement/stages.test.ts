import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {ImagePipeline} from '../core/ImagePipeline.js';
import {OtsuThresholdStage,ClaheStage,SauvolaThresholdStage} from './stages.js';
describe('enhancement stage adapters',()=>{
 it('composes threshold and contrast stages in the pipeline',async()=>{const data=new Uint8Array(16*16);for(let i=0;i<data.length;i++)data[i]=i%2?220:30;const result=await new ImagePipeline([new ClaheStage({tileSize:8}),new OtsuThresholdStage()]).process(new ImageBuffer(16,16,data,'GRAY'));expect(result.success).toBe(true);expect(result.alignedColor.format).toBe('GRAY');expect(result.stages.map(s=>s.name)).toEqual(['clahe-contrast','otsu-threshold']);});
 it('supports disabling a stage',async()=>{const stage=new SauvolaThresholdStage();stage.enabled=false;const image=new ImageBuffer(16,16,new Uint8Array(256).fill(110),'GRAY');const result=await new ImagePipeline([stage]).process(image);expect(result.stages).toHaveLength(0);expect([...result.alignedColor.data]).toEqual([...image.data]);});
});
