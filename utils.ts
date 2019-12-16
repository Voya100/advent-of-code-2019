export function sum<T>(
  objects: T[],
  valueFunction: (object: T, index?: number) => number
) {
  return objects.reduce(
    (sum, object, index) => sum + valueFunction(object, index),
    0
  );
}

export function multiply<T>(
  objects: T[],
  valueFunction: (object: T) => number
) {
  return objects.reduce((result, object) => result * valueFunction(object), 1);
}

export function min<T>(objects: T[], valueFunction: (object: T) => number) {
  return objects.reduce(
    (minObject, object) =>
      valueFunction(minObject) <= valueFunction(object) ? minObject : object,
    objects[0]
  );
}

export function max<T>(objects: T[], valueFunction: (object: T) => number) {
  return objects.reduce(
    (maxObject, object) =>
      valueFunction(maxObject) >= valueFunction(object) ? maxObject : object,
    objects[0]
  );
}
