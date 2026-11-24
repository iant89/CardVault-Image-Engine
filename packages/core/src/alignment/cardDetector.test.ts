import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {detectCardCandidates} from './cardDetector.js';
describe('card candidate extraction',()=>{
 it('finds and ranks card-like connected regions',()=>{const w=100,h=100,data=new Uint8Array(w*h);for(let y=10;y<80;y++)for(let x=20;x<70;x++)data[y*w+x]=255;for(let y=5;y<25;y++)for(let x=75;x<95;x++)data[y*w+x]=255;const candidates=detectCardCandidates(new ImageBuffer(w,h,data,'GRAY'));expect(candidates.length).toBe(2);expect(candidates[0]!.bounds).toEqual({x:20,y:10,width:50,height:70});expect(candidates[0]!.confidence).toBeGreaterThan(candidates[1]!.confidence);expect(candidates[0]!.corners).toHaveLength(4);});
 it('estimates skewed quadrilateral corners rather than returning only its axis-aligned bounds',()=>{const w=100,h=100,data=new Uint8Array(w*h),polygon=[{x:20,y:10},{x:75,y:20},{x:65,y:80},{x:10,y:70}];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i]!,b=polygon[j]!;if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}if(inside)data[y*w+x]=255;}const candidate=detectCardCandidates(new ImageBuffer(w,h,data,'GRAY'))[0]!;expect(candidate.corners[1]!.y).toBeGreaterThan(candidate.corners[0]!.y);expect(candidate.corners[3]!.y).toBeGreaterThan(candidate.corners[0]!.y);});
 it('rejects invalid mask format',()=>{expect(()=>detectCardCandidates(new ImageBuffer(2,2,new Uint8Array(12),'RGB'))).toThrow();});
});
