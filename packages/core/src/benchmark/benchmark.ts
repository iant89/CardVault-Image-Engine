export interface BenchmarkOptions { iterations?:number; warmupIterations?:number; signal?:AbortSignal }
export interface BenchmarkResult { iterations:number; averageMs:number; medianMs:number; p95Ms:number; p99Ms:number; minMs:number; maxMs:number; throughputPerSecond:number; samplesMs:number[] }
/** Measures an asynchronous operation after warmup and reports latency distribution and throughput. */
export async function benchmark<T>(operation:()=>T|Promise<T>,options:BenchmarkOptions={}):Promise<BenchmarkResult>{
 const iterations=options.iterations??20,warmup=options.warmupIterations??2;
 if(!Number.isSafeInteger(iterations)||iterations<1)throw new RangeError('Iterations must be a positive integer');if(!Number.isSafeInteger(warmup)||warmup<0)throw new RangeError('Warmup iterations must be a non-negative integer');
 for(let i=0;i<warmup;i++){if(options.signal?.aborted)throw abortError();await operation();}
 const samples:number[]=[];
 for(let i=0;i<iterations;i++){if(options.signal?.aborted)throw abortError();const start=now();await operation();samples.push(now()-start);}
 const sorted=[...samples].sort((a,b)=>a-b),total=samples.reduce((a,b)=>a+b,0),elapsedSeconds=Math.max(total/1000,Number.EPSILON);
 return{iterations,averageMs:total/iterations,medianMs:quantile(sorted,.5),p95Ms:quantile(sorted,.95),p99Ms:quantile(sorted,.99),minMs:sorted[0]!,maxMs:sorted[sorted.length-1]!,throughputPerSecond:iterations/elapsedSeconds,samplesMs:samples};
}
function quantile(sorted:number[],q:number):number{const index=(sorted.length-1)*q,low=Math.floor(index),high=Math.ceil(index);return sorted[low]!+(sorted[high]!-sorted[low]!)*(index-low);}
function now():number{return typeof performance!=='undefined'?performance.now():Date.now();}
function abortError():Error{return new DOMException('Benchmark cancelled','AbortError');}
