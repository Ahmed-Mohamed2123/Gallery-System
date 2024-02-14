import { randomBytes } from "crypto";

export function generateRandomFilename(): string {
  const randomNumber: number = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  const randomText: string = randomBytes(3).toString("hex");

  return `${randomNumber}_${randomText}`;
}