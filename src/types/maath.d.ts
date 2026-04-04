declare module 'maath/random/dist/maath-random.esm' {
    export function inSphere(buffer: Float32Array, options?: { radius?: number }): Float32Array;
    export function inCircle(buffer: Float32Array, options?: { radius?: number }): Float32Array;
    const random: any;
    export default random;
}
