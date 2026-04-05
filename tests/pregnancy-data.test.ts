import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  pregnancyData,
  getWeekData,
  getCurrentWeek,
  getDaysRemaining,
  getProgressPercent,
} from '../lib/pregnancy-data';

describe('pregnancyData array', () => {
  it('should contain exactly 42 entries (weeks 1 to 42)', () => {
    expect(pregnancyData).toHaveLength(42);
  });

  it('should have all 40 standard pregnancy weeks', () => {
    for (let week = 1; week <= 40; week++) {
      const entry = pregnancyData.find((d) => d.week === week);
      expect(entry, `Week ${week} should exist`).toBeDefined();
    }
  });

  it('should have weeks 41 and 42 for post-term', () => {
    const week41 = pregnancyData.find((d) => d.week === 41);
    const week42 = pregnancyData.find((d) => d.week === 42);
    expect(week41).toBeDefined();
    expect(week42).toBeDefined();
  });

  it('each entry should have required fields', () => {
    pregnancyData.forEach((entry) => {
      expect(entry.week).toBeGreaterThanOrEqual(1);
      expect(entry.fruit).toBeTruthy();
      expect(entry.fruitEmoji).toBeTruthy();
      expect(entry.babyDevelopment).toBeTruthy();
      expect(entry.momTips).toBeTruthy();
      expect([1, 2, 3]).toContain(entry.trimester);
    });
  });

  it('trimester 1 should be weeks 1-12', () => {
    const t1 = pregnancyData.filter((d) => d.trimester === 1);
    t1.forEach((d) => expect(d.week).toBeLessThanOrEqual(12));
  });

  it('trimester 2 should be weeks 13-27', () => {
    const t2 = pregnancyData.filter((d) => d.trimester === 2);
    t2.forEach((d) => {
      expect(d.week).toBeGreaterThanOrEqual(13);
      expect(d.week).toBeLessThanOrEqual(27);
    });
  });

  it('trimester 3 should be weeks 28+', () => {
    const t3 = pregnancyData.filter((d) => d.trimester === 3);
    t3.forEach((d) => expect(d.week).toBeGreaterThanOrEqual(28));
  });
});

describe('getWeekData', () => {
  it('should return data for week 1', () => {
    const data = getWeekData(1);
    expect(data.week).toBe(1);
    expect(data.trimester).toBe(1);
  });

  it('should return data for week 20 (mid-pregnancy)', () => {
    const data = getWeekData(20);
    expect(data.week).toBe(20);
    expect(data.fruit).toBeTruthy();
  });

  it('should return data for week 40', () => {
    const data = getWeekData(40);
    expect(data.week).toBe(40);
    expect(data.weightG).toBe(3500);
  });

  it('should fallback to week 40 for invalid week', () => {
    const data = getWeekData(999);
    expect(data.week).toBe(40);
  });

  it('should return correct fruit emoji for week 7 (myrtille)', () => {
    const data = getWeekData(7);
    expect(data.fruitEmoji).toBe('🫐');
  });
});

describe('getCurrentWeek', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 40 when due date is today', () => {
    const now = new Date();
    const result = getCurrentWeek(now);
    // Due today = week 40 (or close to it)
    expect(result).toBeGreaterThanOrEqual(39);
    expect(result).toBeLessThanOrEqual(42);
  });

  it('should return 20 when due date is 20 weeks away (mid-pregnancy)', () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T12:00:00Z');
    vi.setSystemTime(now);
    // 20 weeks remaining = week 20
    const dueDate = new Date('2025-05-21T12:00:00Z'); // ~20 weeks later
    const result = getCurrentWeek(dueDate);
    expect(result).toBeGreaterThanOrEqual(19);
    expect(result).toBeLessThanOrEqual(21);
  });

  it('should return week 1 at the very beginning of pregnancy', () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T12:00:00Z');
    vi.setSystemTime(now);
    // ~39 weeks away = week 1
    const dueDate = new Date('2025-10-01T12:00:00Z'); // ~39 weeks later
    const result = getCurrentWeek(dueDate);
    expect(result).toBe(1); // clamped to minimum 1
  });

  it('should return 42 (max) when overdue by several weeks', () => {
    vi.useFakeTimers();
    const now = new Date('2025-06-01T12:00:00Z');
    vi.setSystemTime(now);
    // Due date was 3 months ago = way past 42 weeks
    const dueDate = new Date('2025-03-01T12:00:00Z');
    const result = getCurrentWeek(dueDate);
    expect(result).toBe(42); // clamped to maximum 42
  });

  it('should clamp to minimum 1 for very distant future due dates', () => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 5);
    const result = getCurrentWeek(farFuture);
    expect(result).toBe(1);
  });
});

describe('getDaysRemaining', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 0 when due date is in the past', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    const result = getDaysRemaining(past);
    expect(result).toBe(0);
  });

  it('should return approximately 280 days at the start of pregnancy', () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(now);
    const dueDate = new Date('2025-10-08T00:00:00Z'); // ~280 days
    const result = getDaysRemaining(dueDate);
    expect(result).toBeGreaterThanOrEqual(278);
    expect(result).toBeLessThanOrEqual(282);
  });

  it('should return approximately 7 days when 1 week remains', () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(now);
    const dueDate = new Date('2025-01-08T00:00:00Z');
    const result = getDaysRemaining(dueDate);
    expect(result).toBe(7);
  });

  it('should return 0 for a past due date', () => {
    vi.useFakeTimers();
    const now = new Date('2025-06-01T00:00:00Z');
    vi.setSystemTime(now);
    const dueDate = new Date('2025-01-01T00:00:00Z');
    const result = getDaysRemaining(dueDate);
    expect(result).toBe(0);
  });
});

describe('getProgressPercent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 50% at week 20', () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T12:00:00Z');
    vi.setSystemTime(now);
    // 20 weeks remaining → week 20 → 50%
    const dueDate = new Date('2025-05-21T12:00:00Z');
    const result = getProgressPercent(dueDate);
    expect(result).toBeGreaterThanOrEqual(48);
    expect(result).toBeLessThanOrEqual(52);
  });

  it('should return 100% when at or past due date', () => {
    vi.useFakeTimers();
    const now = new Date('2025-06-01T00:00:00Z');
    vi.setSystemTime(now);
    const dueDate = new Date('2025-03-01T00:00:00Z'); // past due
    const result = getProgressPercent(dueDate);
    expect(result).toBe(100);
  });

  it('should return a value between 0 and 100', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 100);
    const result = getProgressPercent(dueDate);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
