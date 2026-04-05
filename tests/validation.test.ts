import { describe, it, expect } from 'vitest';
import {
  validateWeight,
  validateNote,
  validateName,
  validateEmail,
  validateDate,
  validateSeverity,
  assertValid,
} from '../lib/validation';

describe('validateWeight', () => {
  it('should accept valid weight within range (30-200 kg)', () => {
    expect(validateWeight(60).valid).toBe(true);
    expect(validateWeight(30).valid).toBe(true);
    expect(validateWeight(200).valid).toBe(true);
    expect(validateWeight(75.5).valid).toBe(true);
  });

  it('should reject weight below 30 kg', () => {
    const result = validateWeight(20);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject weight above 200 kg', () => {
    const result = validateWeight(250);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject weight of exactly 29 kg', () => {
    expect(validateWeight(29).valid).toBe(false);
  });

  it('should reject weight of exactly 201 kg', () => {
    expect(validateWeight(201).valid).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateWeight(NaN).valid).toBe(false);
  });
});

describe('validateNote', () => {
  it('should accept valid note under 500 chars', () => {
    expect(validateNote('Petit passage').valid).toBe(true);
    expect(validateNote('A'.repeat(500)).valid).toBe(true);
  });

  it('should reject note over 500 chars', () => {
    const result = validateNote('A'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should accept undefined note (optional)', () => {
    expect(validateNote(undefined).valid).toBe(true);
    expect(validateNote(null).valid).toBe(true);
  });

  it('should accept empty string', () => {
    expect(validateNote('').valid).toBe(true);
  });
});

describe('validateName', () => {
  it('should accept valid name under 100 chars', () => {
    expect(validateName('Marie').valid).toBe(true);
    expect(validateName('A'.repeat(100)).valid).toBe(true);
  });

  it('should reject name over 100 chars', () => {
    const result = validateName('A'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should accept undefined/null name (optional)', () => {
    expect(validateName(undefined).valid).toBe(true);
    expect(validateName(null).valid).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('mama@mamatrack.fr').valid).toBe(true);
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('not-an-email').valid).toBe(false);
    expect(validateEmail('missing@').valid).toBe(false);
    expect(validateEmail('@nodomain.com').valid).toBe(false);
  });

  it('should reject empty email', () => {
    expect(validateEmail('').valid).toBe(false);
  });
});

describe('validateDate', () => {
  it('should accept valid YYYY-MM-DD date', () => {
    expect(validateDate('2025-06-15').valid).toBe(true);
    expect(validateDate('2024-01-01').valid).toBe(true);
  });

  it('should reject invalid format', () => {
    expect(validateDate('15/06/2025').valid).toBe(false);
    expect(validateDate('2025-6-5').valid).toBe(false);
    expect(validateDate('').valid).toBe(false);
  });

  it('should reject invalid date values', () => {
    expect(validateDate('2025-13-01').valid).toBe(false); // month 13
  });
});

describe('validateSeverity', () => {
  it('should accept severity between 1 and 10', () => {
    expect(validateSeverity(1).valid).toBe(true);
    expect(validateSeverity(5).valid).toBe(true);
    expect(validateSeverity(10).valid).toBe(true);
  });

  it('should reject severity below 1', () => {
    expect(validateSeverity(0).valid).toBe(false);
    expect(validateSeverity(-1).valid).toBe(false);
  });

  it('should reject severity above 10', () => {
    expect(validateSeverity(11).valid).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateSeverity(NaN).valid).toBe(false);
  });
});

describe('assertValid', () => {
  it('should not throw for valid result', () => {
    expect(() => assertValid({ valid: true })).not.toThrow();
  });

  it('should throw for invalid result with error message', () => {
    expect(() => assertValid({ valid: false, error: 'Test error' })).toThrow('Test error');
  });

  it('should throw with default message when no error provided', () => {
    expect(() => assertValid({ valid: false })).toThrow();
  });
});
