/** Evaluators are functions that determine the fitness of a given object. */
export type Evaluator = (object: object, info: object) => Promise<number>;

/**
 * Some common evaluator functions to help reduce boilerplate.
 */

const number = (x: number) => ({
  isCloseTo: (target: number, cutoff = 100000) => {
    const diff = Math.abs(x - target);
    if (!diff || 1 / diff > cutoff) {
      return cutoff;
    }
    return 1 / diff;
  }
});

const array = (arr: Array<any>) => ({
  averageIsCloseTo: (target: number) => {
    const average = arr.reduce((p, c) => p + c, 0) / arr.length;
    return number(average).isCloseTo(target);
  }
});

export const evaluators = {
  number,
  array
};
