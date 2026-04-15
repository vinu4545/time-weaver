export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Set) {
    return new Set(Array.from(obj).map(item => deepClone(item))) as any;
  }

  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [deepClone(key), deepClone(value)])
    ) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

export function deepEquals(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null) {
    return false;
  }

  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  if (obj1 instanceof Array && obj2 instanceof Array) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEquals(item, obj2[index]));
  }

  if (obj1 instanceof Set && obj2 instanceof Set) {
    if (obj1.size !== obj2.size) {
      return false;
    }
    for (const item of obj1) {
      if (!obj2.has(item)) {
        return false;
      }
    }
    return true;
  }

  if (obj1 instanceof Map && obj2 instanceof Map) {
    if (obj1.size !== obj2.size) {
      return false;
    }
    for (const [key, value] of obj1) {
      if (!obj2.has(key) || !deepEquals(value, obj2.get(key))) {
        return false;
      }
    }
    return true;
  }

  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.every(key => deepEquals(obj1[key], obj2[key]));
  }

  return false;
}
