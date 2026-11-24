import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {detectCardCandidates} from './cardDetector.js';
describe('card candidate extraction',()=>{
 it('finds and ranks card-like connected regions',()=>{const w=100,h=100,data=new Uint8Array(w*h);for(let y=10;y<80;y++)for(let x=20;x<70;x++)data[y*w+x]=255;for(let y=5;y<25;y++)for(let x=75;x<95;x++)data[y*w+x]=255;const candidates=detectCardCandidates(new ImageBuffer(w,h,data,'GRAY'));expect(candidates.length).toBe(2);expect(candidates[0]!.bounds).toEqual({x:20,y:10,width:50,height:70});expect(candidates[0]!.confidence).toBeGreaterThan(candidates[1]!.confidence);expect(candidates[0]!.corners).toHaveLength(4);});
 it('rejects invalid mask format',()=>{expect(()=>detectCardCandidates(new ImageBuffer(2,2,new Uint8Array(12),'RGB'))).toThrow();});
});
