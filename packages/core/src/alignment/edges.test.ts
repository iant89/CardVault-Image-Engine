import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {sobelEdges} from './edges.js';
describe('Sobel edge detection',()=>{
 it('detects a strong step boundary as binary edges',()=>{const width=8,height=8,data=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=4;x<width;x++)data[y*width+x]=255;const result=sobelEdges(new ImageBuffer(width,height,data,'GRAY'));expect([...result.data].some(v=>v===255)).toBe(true);expect([...new Set(result.data)].every(v=>v===0||v===255)).toBe(true);});
 it('validates its threshold and preserves input',()=>{const input=new ImageBuffer(3,3,new Uint8Array(9).fill(20),'GRAY');expect(()=>sobelEdges(input,{threshold:256})).toThrow();expect(input.data[4]).toBe(20);});
});
