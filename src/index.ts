import {
  Atomic,
  AtomicExporter,
  AtomicReducerFunc,
  REDUX_ATOMIC_ACTION,
  AtomicAction,
  AtomicActionCreator,
  AtomicDispatchFunc,
  AtomicActionList,
  AtomicDispatchList,
  AtomicPropList
} from "./types";
export * from "./types";

export function createAtomic<s, a, b, c, d, e, f, g>(
  initialState: s,
  name?: string
): Atomic<s, a, b, c, d, e, f, g> {
  const key = {};
  const reducerName = name || "anon";
  const exporter = createAtomicExporter<s, a, b, c, d, e, f, g>(key, reducerName);
  return {
    reducer: createAtomicReducer(initialState, key),
    createAction: createAtomicActionFunction(key, reducerName),
    key,
    name: reducerName,
    exporter: createObjectExporter(exporter)
  };
}

function createObjectExporter<s, a, b, c, d, e, f, g>(exporter: AtomicExporter<s, a, b, c, d, e, f, g>) {
  return function(obj: AtomicActionList<s, a, b, c, d, e, f, g>) {
    let newObj: AtomicDispatchList<s, a, b, c, d, e, f, g> = {};
    Object.keys(obj).forEach(key => {
      const func = obj[key];
      newObj[key] = exporter(func, key);
    });
    return newObj;
  };
}

function createAtomicAction<s>(
  key: object,
  func: AtomicReducerFunc<s>,
  reducerName: string,
  funcName?: string
): AtomicAction<s> {
  return {
    type: generateKey(reducerName, funcName),
    meta: {
      id: REDUX_ATOMIC_ACTION,
      key,
      change: func
    }
  };
}

export function createAtomicActionFunction<s>(key: object, reducerName: string): AtomicActionCreator<s> {
  return <s>(func: AtomicReducerFunc<s>, funcName?: string): AtomicAction<s> => {
    return createAtomicAction(key, func, reducerName, funcName);
  };
}

export function createAtomicReducer<s>(initialState: s, key: object) {
  return (state: s, action: AtomicAction<s>): s => {
    const thisState = state || initialState;
    return action.meta && action.meta.key === key && action.meta.id === REDUX_ATOMIC_ACTION
      ? action.meta.change(thisState)
      : thisState;
  };
}

export function createAtomicExporter<s, a, b, c, d, e, f, g>(key: object, reducerName: string) {
  return function wrapperMaker<s, p>(func: AtomicDispatchFunc<s, a, b, c, d, e, f, g>, funcName?: string) {
    return function(...args: AtomicPropList<a, b, c, d, e, f, g>): AtomicAction<s> {
      const funcReady = func(...args);
      return createAtomicAction(key, funcReady, reducerName, funcName);
    };
  };
}

export const generateKey = (identifier: string, funcName?: string): string => {
  return "ATOMIC_" + identifier + "_" + (funcName || "anon");
};
