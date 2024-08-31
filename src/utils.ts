export function getTrimmed<T>(obj: T): T {
  if (typeof obj === "string") {
    return obj.trim() as T;
  } else if (obj instanceof Array) {
    return obj.map(getTrimmed) as T;
  } else if (typeof obj === "object" && obj !== null) {
    const trimmedObj: any = {};
    for (const key in obj) {
      trimmedObj[key] = getTrimmed(obj[key]);
    }
    return trimmedObj;
  }

  return obj;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isValidPassword(password: string) {
  return password.length >= 8;
}
