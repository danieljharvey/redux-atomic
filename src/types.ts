export type StandardAction = {
  type: string;
  payload?: any;
  error?: any;
};

export type AtomicReducerFunc<s, t = s> = (state: s) => s | t;

export type AtomicReducer<s, t = s> = (
  state: s,
  action: AtomicAction<s, t>
) => s | t;

export type AtomicListener<s, t = s> = (
  state: s,
  action: StandardAction
) => s | t;

export type AtomicListenerObj<s, t = s> = {
  type: string;
  func: AtomicListener<s, t>;
};

export interface AtomicAction<s, t = s> {
  type: string;
  payload: any[];
}

export type GenericActionFunc<s, t = s> = (
  ...a: any[]
) => AtomicReducerFunc<s, t>;

export type GenericActionDescriber<s, t = s> = {
  name: string;
  func: GenericActionFunc<s, t>;
};

export type AtomicFunctionList<s, t = s> = {
  [key: string]: GenericActionFunc<s, t>;
};

export type AtomicListenerList<s, t = s> = {
  [key: string]: AtomicListener<s, t>;
};
