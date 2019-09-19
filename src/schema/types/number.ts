import { SchemaType, breederWrapper } from "..";

/**
 * A type for an ordinary number.
 */
export function number({ min = 0, max = 1 } = {}): SchemaType<number> {
  /** Function to generate a random number. */
  const generate = () => Math.random() * (max - min) + min;
  return {
    type: "number",
    generate,
    /** A breeding function to breed two numbers. */
    breed: (val1: number, val2: number, mutationBoundary: number) =>
      breederWrapper(
        val1,
        val2,
        mutationBoundary,
        (vals, isRandom, valIndex) => {
          if (isRandom) {
            return generate();
          }
          return vals[valIndex as number];
        }
      )
  };
}
