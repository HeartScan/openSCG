declare module 'cubic-spline' {
  class Spline {
    constructor(xs: number[], ys: number[]);
    at(x: number): number;
  }
  export default Spline;
}
