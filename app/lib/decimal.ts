/** Prisma 8 contract Decimal fields accept string values at write time. */
export function dec(value: number | string) {
  return String(value);
}
