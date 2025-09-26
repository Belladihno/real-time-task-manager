import { hash, compare } from "bcrypt";
import { createHmac, createHash } from "crypto";

export const doHash = (value: any, saltvalue: any): Promise<string> => {
  const result = hash(value, saltvalue);
  return result;
};

export const doHashValidation = (
  value: any,
  saltvalue: any
): Promise<boolean> => {
  const result = compare(value, saltvalue);
  return result;
};

export const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const compareTokens = (plainToken: string, hashedToken: string): boolean => {
  const hashedPlainToken = hashToken(plainToken);
  return hashedPlainToken === hashedToken;
};