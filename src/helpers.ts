import { GenericActionDescriber } from "./types";

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
