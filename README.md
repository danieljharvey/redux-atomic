# Redux Atomic <img src="https://travis-ci.org/danieljharvey/redux-atomic.svg?branch=master" alt="build:started">

## "Give Those Typing Hands A Break"

### What?

Here is a library for helping you type less by replacing separate actions/reducers in Redux with functions that take a piece of state and return a new one.

### Like magic?

Nah, nothing magic is going on, making your reducer this way means we can autocreate typed action creators, thus saving you typing out loads of code that adds little value.

### How?

Check out the [example app](https://github.com/danieljharvey/redux-atomic-example)!

Or alteratively dive right in, and install it from your favourite terminal with `npm install redux-atomic`

Then type something like this into a text editor or similar:

```typescript
// niceReducer.ts

import { createReducer } from 'redux-atomic'

const initialState: number = 0;

const inc = (howMuch: number) => (state: number): number => state + howMuch

const dec = (howMuch: number) => (state: number): number => state - howMuch

const { reducer, wrap } = createReducer("niceReducer", initialState, [inc, dec])

export numberReducer = reducer

export actions = {
    inc: wrap(inc),
    dec: wrap(dec),
}
```

This reducer can then be connected to others however you like to do that...

```typescript
// store.ts

import { numberReducer } from "niceReducer";
import { someOtherTerribleReducer } from "awfulFile";

const appReducers = combineReducers({
  numbers: numberReducer,
  otherStuff: someOtherTerribleReducer
});
```

And the actions can be connected to a component something like this...

```typescript
// connectorComponent.ts

import { actions } from 'niceReducer'

const mapDispatchToProps = (dispatch) => {
    inc: dispatch(actions.inc),
    dec: dispatch(actions.dec)
}
```

### Why though?

I mean, really, why anything?

But sure, why this? Am I supposed to rewrite my whole app now?

Let's look at a code example for a basic reducer with actions in the full-fat Redux style.

```typescript
const MAKE_THE_NUMBER_BIGGER = "someSortOf.NameSpace.MAKE_THE_NUMBER_BIGGER"
const MAKE_THE_NUMBER_SMALLER = "someSortOf.NameSpace.MAKE_THE_NUMBER_SMALLER"
const CHANGE_THE_NAME = "someSortOf.NameSpace.CHANGE_THE_NAME"

interface NumberBiggener {
    type: typeof MAKE_THE_NUMBER_BIGGER
    payload: {
        howMuch: number
    }
}

const numberBiggener = (howMuch: number) => ({
    type: MAKE_THE_NUMBER_BIGGER,
    payload: {
        howMuch
    }
})

interface NumberSmallener {
    type: typeof MAKE_THE_NUMBER_SMALLER
    payload: {
        howMuch: number
    }
}

const numberSmallener = (howMuch: number) => ({
    type: MAKE_THE_NUMBER_SMALLER,
    payload: {
        howMuch
    }
})

interface NameChanger {
    type: typeof CHANGE_THE_NAME,
    payload: {
        title: string
    }
}

const nameChanged = (title: string) => ({
    type: CHANGE_THE_NAME,
    payload: {
        title
    }
})

interface NiceState {
    title: string
    number: number
}

const initialState: NiceState = {
    title: "",
    number: 0
}

function numberReducer(state: NiceState, action: NumberBiggener | NumberSmallener ): NiceState {
  switch (action.type) {
      case MAKE_THE_NUMBER_BIGGER:
        return {
            ...state,
            number: state.number + action.payload.howMuch
        }

    case MAKE_THE_NUMBER_SMALLER:
        return {
            ...state,
            number: state.number - action.payload.howMuch
        }

    case CHANGE_THE_NAME:
        return {
            ...state,
            title: action.payload.title
        }

    default:
        return state;
  }
}

export numberReducer;
export actions = {
    numberBiggener,
    numberSmallener,
    nameChanger
}
```

I'm trying to be fair and not make some exagerated stuff, and typings do make stuff more verbose, but that's still at lot of stuff. With a few more actions you'd be irresponsible not to move the action creators and reducer into separate folders, and then all the constants need exporting/importing etc etc.

### Surely working in this way ties each action to each reducer?

Yes true. It's not to say that having one action that affects multiple reducers is not useful, but is quite rare - Redux Atomic's aim is to make the 90% case of 1-1 action-reducer relationships easier to do.

### Can I still view these actions in Redux Dev Tools etc?

Yeah sure, the auto generated actions have the format:

```typescript
{
    type: `reducerName_actionName`,
    payload: ["list", "of", "called", "args"]
}
```

Therefore in a reducer called `niceReducer`, with a function like:

```typescript
const newTitle = (newTitle: string) => (state: State): State => {
  return {
    ...state,
    title: newTitle
  };
};
```

...called like this:

```typescript
dispatch(newTitle("hello"));
```

Would produce an action like

```typescript
{
    type: 'niceReducer_newTitle',
    payload: ["hello"]
}
```

This would then be picked up by the `newTitle` function passed into the reducer.

### API reference

#### `createAtomic(reducerName, initialState, reducers)`

##### Parameters:

`reducerName` is the name of your reducer - it must be unique across the application.

`initialState` is the starting data state of your reducer.

`reducers` is how you provide your functionality to Redux Atomic. Pass them in as an array of reducer functions, or an array of objects in this format: `{name: 'niceFunction', func: niceFunction}`.

##### Returns:

`reducer` - your reducer function to connect with `combineReducers` etc, that can be passed actions in the regular `(state, action) => state` type manner.

`wrap` - function for wrapping your reducer functions and auto-creating actions. See below for usage.

`actionTypes` - an array of strings with the type of each action that your reducer responds to - mostly provided for debugging purposes, ie

```typescript
const { actionTypes } = createAtomic("hello", state, [great, job, nice, functions]);
// actionTypes == ['hello_great', 'hello_job', 'hello_nice', 'hello_functions']
```

#### `wrap(reducerFunction, actionName)`

##### Parameters:

`reducerFunction` is the reducer action you wish to wrap and turn into a dispatchable action. It must take some number of parameters, and returns a function which turns state into new state.

`actionName` is optional - you will only need to provide it if the function is a const function imported from another file so we cannot work it out automatically. It should match the name you passed to `createAtomic`, and will throw an error if not.

##### Returns:

A dispatchable action for your function, which expects the same parameters as your reducer function.

### Errors you may see and what they are

#### `Redux Atomic: Error in wrap for niceReducer! niceFunction cannot be found. Did you remember to pass it to 'createAtomic()'?`

You have tried to wrap a function that has not been passed to the reducer. Make sure your function is passed to the 'reducers' array in createAtomic()

#### `Redux Atomic: Error in createAtomic for niceReducer! Item 2/4 is not a valid function. Please pass in an array of functions or objects in the form: '{name: 'niceFunction', func: 'niceFunction'}'`

You have passed something which is not a function to createAtomic().

#### `Redux Atomic: Error in createAtomic for niceReducer! Could not ascertain name of function 2/4. If it has been imported from another file please try using a 'function' instead of a 'const', or explicitly pass the name in the form '{name: 'niceFunction', func: 'niceFunction'}'`;

Similar to above. Valid data shapes are

```typescript
const reducerFunctions = [myNiceFunction, otherFunction, greatJob];
const { reducer } = createAtomic("yeah", initialState, reducerFunctions);
```

or

```typescript
const objectShapedReducerFunctions = [
  { name: "myNiceFunction", func: myNiceFunction },
  { name: "otherFunction", func: otherFunction },
  { name: "greatJob", func: greatJob }
];

const { reducer } = createAtomic("yeah2", initialState, objectShapedReducerFunctions);
```

The array shape will work for types of `Function` or anonymous lambda functions declared in the same file. If you have imported anonymous functions from another file, JS loses the name in transit and thus it must be specified.

#### `Redux Atomic: Error in createAtomic for niceReducer! A reducer with this name already exists!`

As Redux Atomic creates regular Flux actions under the hood, having two reducers with the same names means they will both pick up some of the same functions and things can quickly get messy and quite confusing. This error will be thrown if you try and do this.

#### `Redux Atomic: Error in wrap for niceReducer! Could not wrap function greatFunction as it has not been passed to createAtomic();`;

This is to make sure we don't end up with names not matching between passing to createAtomic() and wrap(). If this occurs - check you've sent the function you intend to wrap and any passed names match.

### Anything else?

Building your reducers in this way means you can have multiple instances of them that don't interact with one another, so long as they are given different names and each set of actions are exported with the matching `wrap()` function.

### Testing

As these are just functions, testing them is pretty straightforward. Jest tests for the above look something like this:

```typescript
const initialState = {
  title: "Yeah",
  number: 100
};

describe("Redux atomic is OK", () => {
  it("Increments like a professional", () => {
    expect(increment(10)(initialState)).toEqual({ title: "Yeah", number: 110 });
  });
  it("Decrements like a professional", () => {
    expect(decrement(10)(initialState)).toEqual({ title: "Yeah", number: 90 });
  });
  it("Renames in an efficient and timely manner", () => {
    expect(rename("Relatable pop culture reference")(initialState)).toEqual({
      title: "Relatable pop culture reference",
      number: 100
    });
  });
});
```

Testing the outcome of a series of actions is as simple as composing them together (using Ramda's compose here but hopefully you get the idea):

```typescript
import { compose } from "ramda";

const initialState = { title: "blah", number: 0 };
const bunchOfActions = compose(
  increment(10),
  decrement(20),
  rename("Dog")
);
const expected = { title: "Dog", number: -10 };

expect(bunchOfActions(initialState)).toEqual(expected);
```

Seems fine? Sure. Most things are.

### Thanks

Thanks to the creators and maintainers of [Redux](https://github.com/reduxjs/redux/), for making a simple sane solution for state management. Thanks [Riku](https://github.com/rikukissa) and [David](https://github.com/ds300) for knowing facts about these sort of things which I stole and used to make the thing better.
