![Logo](https://user-images.githubusercontent.com/17712692/65209372-ef214d80-da65-11e9-9461-e10ff2c5a1e6.png)

# Open Genetic
## Disclaimer

This package is currently a work in progress, but please feel free to contribute or experiment!

## Description

Open Genetic is a flexible library for implementing genetic algorithms. It allows you to specify an arbitrarily complicated data schema and evolve it based on your fitness criteria.

## Quick Start

First, install and import open-genetic.

```bash
npm install --save open-genetic
```

```javascript
const Genetic, {types, evaluators} = require("open-genetic");
```

> Note: open-genetic also has full typescript bindings.

We're going to create a (trivially) simple algorithm that learns to create objects with a given age, in this case 25. This example is **far too simple** to require a genetic algorithm, but it's a nice way to introduce the API.

```javascript
const genetic = new Genetic(
  {
    age: types.number({ min: 5, max: 25 })
  },
  async object => {
    return evaluators.number(object.age).isCloseTo(22);
  },
  {
    size: 3000
  }
);
```

We'll explain each step from above in more detail later on, but here's a quick overview.

1. We pass in a schema describing the shape of our data.
2. We pass in an (async) function that will evaluate a given object that is generated.
3. We pass in some options, including the size of an individual population.

We could then run this using the following.

```javascript
// This runs 1000 generations.
genetic.step(1000);
```

Running the evolution is asynchronous, so we can instead use:

```javascript
genetic.step(1000).then(() => {
  console.log(genetic.getCurrentBest());
});
```

Let's take a step back and look at some of the concepts we went over before.

### Schemas & Types

When you use Genetic, you need to pass in a schema, a description of the shape of the data you'd like to create.

This schema is an object of property names mapped to types. These types, also a part of open-genetic, let the algorithm understand:

- How to generate random instances of the property.
- How to generate mutations.
- How to breed the property.

Currently, these types are:

- number
- array
- object

To generate a schema,

```javascript
{
  propertyName: types.number({
    /*options*/
  });
}
```

Each type has different options, which we'll cover now.

#### Number

Use this type to represent an arbitrary number for evolution.

```javascript
types.number({
  // The minimum number for random generation.
  min: 5,
  // The maximum number for random generation.
  min: 5
});
```

#### Array

Use this type to group a set of (unnamed) properties into an array, and evolve it as a whole.

```javascript
types.array(
  // The size of the array
  size,
  // The type of the array.
  // Example: types.number() or type.array(...)
  type,

  {
    // If false, this array will evolve as a whole.
    // That is, when breeding, it is possible to pass
    // parent A's or parent B's array to a child,
    // but not a combination of the two.
    //
    // If true, this can occur.
    blend: false
  }
);
```

#### Object

Use this type to group a set of named properties into an object, and evolve it as a whole.

```javascript
types.object(
  // The schema for this object.
  // This is just like a root level schema,
  // You can nest as much as you'd like.
  schema,
  {
    // If false, this object will evolve as a whole.
    // That is, when breeding, it is possible to pass
    // parent A's or parent B's object to a child,
    // but not a combination of the two.
    //
    // If true, this can occur.
    blend: false
  }
);
```

### Evaluating Fitness

You can provide any asynchronous function to evaluate a given object.

It does not matter how low or high the fitnesses you provide are, as long as **higher fitness means a better object**.

Note that this is asynchronous. This gives you extreme flexibility in evaluating an object. Some examples:

- Pass the data to a remote server to do something with it.
- Test the object against a large set of sample data.
- Run simulations using the object.

It's up to you.

To give you a hand with some common use cases, we've created a few (sub) evaluators that you can use as part of your evaluator.

```javascript
const Genetic, {types, evaluators} = require("open-genetic")

...
...
...
async function myEvaluatorFunction(object){
    let totalFitness = 0;

    // object's properties depend on your schema, let's assume these are present.
    const {age, testScores} = object;

    // Perhaps you want a number to be close to a given value.
    totalFitness += evaluators.number(age).isCloseTo(25);

    totalFitness += evaluators.array(testScores).averageIsCloseTo(85);
}
```

Remember that to open-genetic, a higher fitness is better. If you have multiple criteria, use coefficients to weight them per your importance.

## Example of More Complicated Use

The example we used was rather trivial, but there are of course more complicated use cases.

For example, maybe we set up the following schema for a race car and driver. (fragment shown)

```javascript
    {
        car: types.object({
            topSpeed: types.number({min: 0, max: 100}),
            weight: types.number({min: 100, max: 400}),

            touchiness: types.number(),
            ...etc
        }, {blend: true}),
        driver: types.object({
            agression: types.number({min: 0, max: 5}),
            ...etc
        }, {blend: true})
    }
```

In our evaluation function, we could run a simulation that uses the above criteria to drive a lap and time the result.

Using (and improving) this library allows you to focus on your domain specific evaluation functions, while abstracting away the genetic algo.

## Developing

1. Clone this repository and run npm install.
2. Checkout a new feature branch.
3. Run `npm run build-dev` to continuously compile.
4. Add new code in the `./src` directory.
5. Commit and push your branch when ready.
6. Create a pull request.

## Todo

In no particular order, the following is necessary going forward.

- Unit testing
- Better tracking of previous generations, characteristics that get promoted.
- More sophisticated selection for object promotion, choose some wildcards, etc.
- Visualization
- More evaluators
- More schema types
