import { SchemaType, breederWrapper } from "../index";

/**
 * A type representing a unitary array of data.
 *
 * @param size - The length of this array
 * @param type - Another schema type which will be used for all children.
 * @param blend - If false (default) this array will be evolved as a whole, if true, sub-elements can evolve independently.
 */
export function array<T>(
  size: number = 10,
  type: SchemaType<T>,
  { blend = false } = {}
): SchemaType<Array<T>> {
  /**
   * A function to generate and randomly populate an array of the designated type.
   */
  const generate = () =>
    Array(size)
      .fill(0)
      .map(type.generate);

  return {
    type: "array",
    generate,

    /**
     * Function to allow breeding of two arrays.
     */
    breed: (val1: Array<T>, val2: Array<T>, mutationBoundary: number) =>
      breederWrapper(
        val1,
        val2,
        mutationBoundary,
        (vals, isRandom, valIndex) => {
          if (isRandom) {
            return generate();
          }

          /** If blending is active, allow each index to evolve individually. */
          if (blend) {
            return Array(size)
              .fill(0)
              .map((v, i) => {
                return type.breed(val1[i], val2[i], mutationBoundary);
              });
          } else {
            return vals[valIndex as number];
          }
        }
      )
  };
}
