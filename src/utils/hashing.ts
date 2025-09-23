import { hash, compare } from "bcrypt";

export const doHash = (value: any, saltvalue: any) => {
  const result = hash(value, saltvalue);
  return result;
};

export const doHashValidation = (value: any, saltvalue: any) => {
  const result = compare(value, saltvalue);
  return result;
};
