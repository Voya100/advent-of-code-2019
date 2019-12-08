export function sum<T>(objects: T[], valueFunction: (object: T) => number) {
  return objects.reduce((sum, object) => sum + valueFunction(object), 0);
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
