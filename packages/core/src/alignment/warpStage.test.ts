import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {ImagePipeline} from '../core/ImagePipeline.js';
import {PerspectiveWarpStage} from './warpStage.js';
describe('perspective warp pipeline stage',()=>{
 it('warps using target profile dimensions',async()=>{const image=new ImageBuffer(16,16,new Uint8Array(256).fill(100),'GRAY');const stage=new PerspectiveWarpStage({corners:[{x:0,y:0},{x:15,y:0},{x:15,y:15},{x:0,y:15}],width:16,height:16});const result=await new ImagePipeline([stage]).process(image);expect(result.alignedColor.width).toBe(16);expect(result.stages[0]!.name).toBe('perspective-warp');});
 it('requires output dimensions or profile',()=>{expect(()=>new PerspectiveWarpStage({corners:[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]})).toThrow();});
});
