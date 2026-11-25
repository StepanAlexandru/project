import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}