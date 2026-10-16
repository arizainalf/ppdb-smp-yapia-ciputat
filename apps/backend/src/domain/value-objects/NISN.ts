import { ValidationError } from '../errors/DomainError.js';

export class NISN {
  private readonly value: string;

  constructor(value: string) {
    if (!NISN.isValid(value)) {
      throw new ValidationError('NISN harus terdiri dari tepat 10 digit numerik.');
    }
    this.value = value;
  }

  public static isValid(nisn: string): boolean {
    return /^[0-9]{10}$/.test(nisn);
  }

  public getValue(): string {
    return this.value;
  }
}
