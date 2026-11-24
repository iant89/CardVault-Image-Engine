import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {morphology} from './morphology.js';
describe('binary morphology',()=>{
 it('dilation expands foreground and erosion contracts it',()=>{const data=new Uint8Array(25);data[12]=255;const input=new ImageBuffer(5,5,data,'GRAY');const expanded=morphology(input,{operation:'dilate'});expect([...expanded.data].filter(v=>v===255)).toHaveLength(9);const contracted=morphology(expanded,{operation:'erode'});expect([...contracted.data].filter(v=>v===255)).toHaveLength(1);});
 it('validates binary image format and radius',()=>{expect(()=>morphology(new ImageBuffer(1,1,new Uint8Array(3),'RGB'))).toThrow();expect(()=>morphology(new ImageBuffer(1,1,new Uint8Array(1),'GRAY'),{radius:0})).toThrow();});
});
