import { SchemaType, Schema, types } from "./schema";
import { Evaluator } from "./evaluators";
export * from "./schema";
export * from "./evaluators";

export default class Genetic {
  private populations: (object[])[] = [];
  private evaluator: Evaluator;
  private root: SchemaType<object>;
  private options: {
    size: number;
    mutationRate: number;
    promotionPercentile: number;
  };

  constructor(
    schema: Schema,
    evaluator: Evaluator,
    { size = 100, mutationRate = 0.05, promotionPercentile = 0.05 } = {}
  ) {
    this.evaluator = evaluator;
    this.root = types.object(schema);
    this.options = { size, mutationRate, promotionPercentile };

    /**
     * Generate the initial population.
     */
    this.populations.push(
      Array(size)
        .fill(0)
        .map(this.root.generate)
    );
  }

  /** Evaluate the current population, and return a sorted set of object and their fitnesses.*/
  async evaluate(): Promise<[object, number][]> {
    const evals: [object, number][] = [];
    for (let obj of this.populations[0]) {
      evals.push([obj, await this.evaluator(obj, {})]);
    }
    return evals.sort((a, b) => b[1] - a[1]);
  }

  /** Consume a (sorted) set of objects and their fitnesses (likely from evaluate)
   *  and extract a of parents. */
  select(population: [object, number][]): object[] {
    const { size, promotionPercentile } = this.options;
    const cutoffIndex = Number((size * promotionPercentile).toFixed(0));
    if (cutoffIndex > 1) {
      return population.slice(0, cutoffIndex).map(([object]) => object);
    } else {
      throw new Error("Sample too small or promotion percentile too low.");
    }
  }

  /**
   * Step forward n generations.
   */
  async step(generations = 1) {
    for (let i = 0; i < generations; i++) {
      // Evaluate the current population.
      const evaluated = await this.evaluate();
      // Select some 'parents' from the evaluated pool.
      const selected = this.select(evaluated);
      // We'll add new children to this.
      const newPopulation = [];

      /** A helper function to get an arbitrary parent index from the selected pool. */
      const getParentIndex = () =>
        Number((Math.random() * (selected.length - 1)).toFixed(0));

      /** Generate new population. */

      for (let i = 0; i < this.options.size; i++) {
        /**
         * Get 2 parents to breed from the selected pool.
         * Make sure the same parent isn't chosen twice.
         */

        const parent1Index: number = getParentIndex();
        let parent2Index: number = parent1Index;
        while (parent2Index === parent1Index) {
          parent2Index = getParentIndex();
        }

        /** This value is used by breeder functions to determine which parent/random to use. */
        /** If mutation rate is 0.05, this will be 0.95 */
        const mutationBoundary = 1 - this.options.mutationRate;
        newPopulation.push(
          this.root.breed(
            selected[parent1Index],
            selected[parent2Index],
            mutationBoundary
          )
        );
      }

      /** We add it to the beginning of populations. This may be inefficient, but is alright for now and lets us see change over time. */
      /**TODO: Add more robust history tracking. */
      this.populations = [newPopulation, ...this.populations];
    }
  }

  /** Getters and Setters */

  getPopulations() {
    return this.populations;
  }
 
  async getCurrentBest() {
    return this.select(await this.evaluate());
  }
}
