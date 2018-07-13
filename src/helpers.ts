import {
  GenericActionDescriber,
  AtomicListenerList,
  AtomicListenerObj,
  AtomicListener,
  AtomicFunctionList,
  GenericActionFunc,
  AtomicReducerFunc
} from "./types";

export const parseActionKeyFromType = (reducerName: string, actionType: string): string => {
  return actionType.includes(reducerName + "_") ? actionType.substr(actionType.lastIndexOf("_") + 1) : "";
};

export const funcExistsInReducer = <s, t>(
  reducerFuncs: GenericActionDescriber<s, t>[],
  actionName: string
): boolean => reducerFuncs.filter(x => x.name === actionName).length > 0;

export const warning = (string: string) => {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    throw string;
  } else if (
    typeof console !== "undefined" &&
    typeof console.error === "function" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.error(string);
  }
};

export const generateKey = (reducerName: string, actionName: string): string =>
  reducerName + "_" + actionName;

export const cleanParams = (params: any[] | any): any[] => (Array.isArray(params) ? params : [params]);

export const stripUndefined = (list: any[]): any[] =>
  list.reduce((acc, val) => {
    return val !== undefined ? [...acc, val] : [...acc];
  }, []);

export const saveListenerFuncs = <s, t>(listeners: AtomicListenerList<s, t>): AtomicListenerObj<s, t>[] =>
  Object.keys(listeners).map(
    (key: string): AtomicListenerObj<s, t> => {
      const listener: AtomicListener<s, t> = listeners[key];
      return { type: key, func: listener };
    }
  );

export const saveReducerFuncs = <s, t>(
  reducerName: string,
  reducers: AtomicFunctionList<s, t>
): GenericActionDescriber<s, t>[] => {
  const reducersArray = Object.keys(reducers);
  return reducersArray
    .map((key: string) => ({ name: key, func: reducers[key] }))
    .reduce((acc: GenericActionDescriber<s, t>[], reducer: GenericActionDescriber<s, t>, index: number) => {
      const reducerFunc = getFunction<s, t>(reducerName, reducer, index, reducersArray.length);
      const funcName = checkFunctionName<s, t>(reducerName, reducer, index, reducersArray.length);
      return reducerFunc && funcName ? [...acc, reducer] : acc;
    }, []);
};

const getFunction = <s, t>(
  reducerName: string,
  reducer: GenericActionDescriber<s, t>,
  index: number,
  length: number
): GenericActionFunc<s, t> | false => {
  if (typeof reducer === "object" && typeof reducer.func === "function") {
    return reducer.func;
  } else {
    warning(
      `Redux Atomic: Error in createAtomic for ${reducerName}! Item ${index +
        1}/${length} is not a valid function. Please pass in functions in the form: '{ functionName: function, functionName2: function2 }'`
    );
    return false;
  }
};

const checkFunctionName = <s, t>(
  reducerName: string,
  reducer: GenericActionDescriber<s, t>,
  index: number,
  length: number
): string => {
  if (!reducer.name || reducer.name.length < 1) {
    warning(
      `Redux Atomic: Error in createAtomic for ${reducerName}! Could not ascertain name of function ${index +
        1}/${length}. Please pass the name in the form '{functionName: function}'`
    );
    return "";
  } else {
    return reducer.name;
  }
};

export const checkActionNameExists = <s, t>(
  reducerName: string,
  reducerFuncs: GenericActionDescriber<s, t>[],
  funcName: string
): boolean => {
  if (!isActionNameFound<s, t>(reducerFuncs, funcName)) {
    warning(
      `Redux Atomic: Error in wrap for ${reducerName}! Could not wrap function ${funcName} as it has not been passed to createAtomic();`
    );
    return false;
  }
  return true;
};

const isActionNameFound = <s, t>(reducerFuncs: GenericActionDescriber<s, t>[], funcName: string): boolean =>
  reducerFuncs.some(reducer => reducer.name === funcName);

export const getActionName = (reducerName: string, actionName: string): string | false => {
  if (actionName && String(actionName) === actionName && actionName.length > 0) {
    return actionName;
  }
  warning(
    `Redux Atomic: Error in wrap for ${reducerName}! actionName must be a valid string of 1 character or more`
  );
  return false;
};

export const isFunctionValid = <s, t>(
  reducer: GenericActionDescriber<s, t>,
  params: any[]
): AtomicReducerFunc<s, t> | false =>
  typeof reducer.func === "function" ? reducer.func.apply(void 0, params) : false;

export const getActionNames = <s, t>(
  reducerName: string,
  reducerFuncs: GenericActionDescriber<s, t>[],
  listenerFuncs: AtomicListenerObj<s, t>[]
): string[] => {
  const reducerTypes = reducerFuncs.map(reducer => generateKey(reducerName, reducer.name));
  const listenerTypes = Object.values(listenerFuncs).map(listener => listener.type);
  return reducerTypes.concat(listenerTypes);
};
