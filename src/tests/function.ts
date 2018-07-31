export function niceFunction() {
  return "nice";
}

export const ohNo = () => () => {
  return "what";
};

export const takesAStringAndNumber = (a: string, b: number) => () => "yeah";
