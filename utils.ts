export function sum<T>(objects: T[], valueFunction: (object: T) => number) {
  return objects.reduce((sum, object) => sum + valueFunction(object), 0);
}
