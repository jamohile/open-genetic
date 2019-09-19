import { Schema, SchemaType, breederWrapper } from "../index";

/**
 * A type representing a unitary object of data.
 *
 * @param schema - A schema of property names and coresponding types.
 * @param blend - If false (default) this object will be evolved as a whole, if true, sub-properties can evolve independently.
 */
export function object(
  schema: Schema,
  { blend = false } = {}
): SchemaType<object> {
  /** Function to generate a new instance of this type.
   * Using the provided schema, will generate a child one property at a time.
   **/
  const generate = () => {
    const object: any = {};
    for (let prop in schema) {
      object[prop] = schema[prop].generate();
    }
    return object;
  };

  return {
    type: "object",
    generate,

    /** Function to allow breeding of two objects. */
    breed: (val1: any, val2: any, mutationBoundary: number) =>
      breederWrapper(
        val1,
        val2,
        mutationBoundary,
        (vals, isRandom, valIndex) => {
          if (isRandom) {
            return generate();
          }

          /**
           * If blending is active, sub-properties can evolve individually.
           * We will construct a child allowing each property to evolve independently.
           * Note: This also allows random sub-props.
           */
          if (blend) {
            const obj: any = {};
            for (let prop in schema) {
              obj[prop] = schema[prop].breed(
                vals[0][prop],
                vals[1][prop],
                mutationBoundary
              );
            }
            return obj;
          } else {
            /**If blending is disabled, just choose one of the parents. */
            return vals[valIndex as number];
          }
        }
      )
  };
}
