import { describe, expect, it } from 'vitest';
import { ImageBuffer } from '../image/ImageBuffer.js';
import { computeHomography, orderCorners, perspectiveWarp } from './perspective.js';
describe('perspective geometry', () => {
  it('orders arbitrary corner input clockwise from top left', () => { expect(orderCorners([{x:8,y:9},{x:1,y:1},{x:9,y:1},{x:1,y:9}])).toEqual([{x:1,y:1},{x:9,y:1},{x:8,y:9},{x:1,y:9}]); });
  it('maps a rectangular card and preserves pixels for an identity warp', () => { const corners=orderCorners([{x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2}]); const matrix=computeHomography(corners,3,3); expect(matrix.slice(0,8)).toEqual(expect.arrayContaining([expect.any(Number)])); const image=new ImageBuffer(3,3,new Uint8Array(Array.from({length:9},(_,i)=>i*20)),'GRAY'); expect([...perspectiveWarp(image,corners,3,3).data]).toEqual([...image.data]); });
  it('rejects degenerate points', () => { expect(() => orderCorners([{x:0,y:0},{x:0,y:0},{x:2,y:2},{x:3,y:3}])).toThrow(); });
});
