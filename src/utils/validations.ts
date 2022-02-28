export function numberOrDefault(x: any, d: number) {
  return isNaN(Number(x)) ? d : x as number;
}

export function isNumber(x): x is number {
  return !isNaN(Number(x));
}

export function isString(s): s is string {
  return s !== undefined && s !== null && s !== "";
}

export function toNumber(x) {
  return isNumber(x) ? Number(x) : 0;
}
