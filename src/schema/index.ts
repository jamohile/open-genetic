export * from "./types";
/**
 * Type definitions for breeding functions.
 * This family of functions helps take in values from two parents, and breed them in various ways.
 */

/**
 * This is the type that gets exposed to other parts of the code. This is the effective API for breeders.
 * @param val1 - The value of the first breedable parent.
 * @param val2 - The value of the second breedable parent.
 */
type exposedBreeder<T> = (val1: T, val2: T, mutationBoundary: number) => T;

/**
 * These are internal APIs for breeder functions.
 * They are used and called only by other schema management functions.
 *
 * breeder is the function a specific schematype will declare to make it breedable,
 * breederWrapper is a helper function to use while making schematypes.
 *
 */
type breeder<T> = (vals: T[], isRandom: boolean, valIndex?: number) => T;
type breederWrapper<T> = (
  val1: T,
  val2: T,
  mutationBoundary: number,
  breeder: breeder<T>
) => T;

/**
 * A Schema is an object containing names, and multiple SchemaTypes.
 * This allows open-genetic to understand the type of data being evolved,
 * to correctly generate random data and apply breeding rules.
 */
export type Schema = {
  [key: string]: SchemaType<any>;
};

/**
 * The type of a property within a schema.
 */
export interface SchemaType<T> {
  /** Useful for debugging, just the name of the schema type. */
  type: string;
  /** A function that generates a random instance of this type. */
  generate: () => T;
  /** A function that consumes a set of 'parents' of this type, and outputs a child */
  breed: exposedBreeder<T>;
}

/**
 * A wrapper function to help develop new schema types.
 * Calculates which parent to use (or whether to randomly generate) for child, and passes this to a custom breeder function.
 * @param val1
 * @param val2
 * @param mutationBoundary
 * @param func
 */
export function breederWrapper<T>(
  val1: T,
  val2: T,
  mutationBoundary: number,
  breeder: breeder<T>
): T {
  /**
   * Calculates a number 0 < x < 1,
   * uses it to select whether to use parent 1, parent 2, or a random child.
   */
  const chance = Math.random();
  if (chance <= mutationBoundary / 2) {
    return breeder([val1, val2], false, 0);
  } else if (chance <= mutationBoundary) {
    return breeder([val1, val2], false, 1);
  } else {
    return breeder([val1, val2], true);
  }
}