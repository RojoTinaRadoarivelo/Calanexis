import { InternalServerErrorException } from '@nestjs/common';

export function assertSingle<T>(
  data: T | T[] | null | undefined,
  errorMessage = 'Invalid data type',
): T {
  if (!data) {
    throw new InternalServerErrorException(errorMessage);
  }

  if (Array.isArray(data)) {
    throw new InternalServerErrorException(
      `${errorMessage}: expected single object, received array`,
    );
  }

  return data;
}
