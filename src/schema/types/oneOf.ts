import { SchemaType, breederWrapper } from "..";

/**
 * A type for an ordinary number.
 */
export function oneOf({ items = [] } = {}): SchemaType<"oneOf"> {
  /** Function to generate a random number. */
  const generate = () =>
    items[Math.floor(Math.random() * Math.floor(items.length))];

  return {
    type: "number",
    generate,
    /** A breeding function to breed two numbers. */
    breed: (val1: "oneOf", val2: "oneOf", mutationBoundary: number) =>
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
