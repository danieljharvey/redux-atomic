# Redux Atomic

## "Give Those Typing Hands A Break" or "It's Basically Mapping Functions Over A Reducer" or "Now You Must Rewrite All Your Code Like This"

### What?

Here is a library for helping you type less by replacing separate actions/reducers in Redux with combined functions that map over a piece of state to change it.

### Like magic?

Nah, it's still doing the normal redux stuff under the hood, and you can name the actions so you can see what's going on in dev tools.

### How?

```npm install redux-atomic```

For code examples see below...

### Why though? 

Redux is pretty great. It does two things really well.

a) Keeps all state in an auditable place
b) Allows that centralised state to be modified in a consistent auditable fashion
c) Allows a single action to be fired that can make changes across many reducers

In my (by no means comprehensive) experience I have found that in most apps, there is a lot of call for a) and b) and only occasional need for c). Although a few one-to-many action-to-state-change situations happen, most action-to-state-change relations are one-to-one and don't need wrapping into global actions.

And that's great, because writing separate sets of functions for actions and reducers is the major cause of boilerplate RSI in Redux. Most of the time, why bother?

Let's look at boilerplate code:

```typescript

const MAKE_THE_NUMBER_BIGGER = "someSortOf.NameSpace.MAKE_THE_NUMBER_BIGGER"
const MAKE_THE_NUMBER_SMALLER = "someSortOf.NameSpace.MAKE_THE_NUMBER_SMALLER"

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

const initialState: StateType = 0

function numberReducer(state: number, action: NumberBiggener | NumberSmallener ): number {
  switch (action.type) {
      case MAKE_THE_NUMBER_BIGGER:
        return state + action.payload.howMuch
    
    case MAKE_THE_NUMBER_SMALLER:
        return state + action.payload.howMuch
    
    default:
        return state;
  }
}

export numberReducer;
export actions = {
    numberBiggener,
    numberSmallener
}

```

I'm trying to be fair and not make some exagerated stuff, and typings do make stuff more verbose, but there's a very minimal actions/reducer set that makes a number go up and down. They'd be used elsewhere something like this:

```typescript

import { actions } from 'boilerplateReducerLand'

dispatch(actions.numberBiggener(1))
dispatch(actions.numberSmallener(1))

```

Oh, and at some point imported into `combineReducers` or similar...

```typescript

import { numberReducer } from 'boilerplateReducerLand'

const appReducers = combineReducers({
    numbers: numberReducer,
    otherStuff: otherStuffReducer
})

```

That's great, but what if it was MUCH SMALLER?

```typescript
import { createReducer } from 'redux-atomic'

const initialState: number = 0;

const { reducer, wrap } = createReducer(initialState)

const numberBiggener = (howMuch: number) => (state: number): number => state + howMuch

const numberSmallener = (howMuch: number) => (state: number): number => state - howMuch

export numberReducer = reducer

// OK, this could be nicer, but bear with me
export actions = {
    numberBiggener: wrap(numberBiggener),
    numberSmallener: wrap(numberSmallener),
}

```

Everything else is the same. The exported actions can be dispatched like normal, and the reducer can be combined like any other. The state isn't held in any particularly magical way, so is accessed like any other.

Seems fine? Sure.