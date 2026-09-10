import { expect, it } from 'vitest';
import { adjustSleepDuration } from './sleep';

it.each([
  [7, 0, -15, 405],
  [7, 45, 15, 480],
  [23, 45, 60, 1440],
  [0, 0, -15, 0],
])('adjusts %i:%i by %i minutes to %i', (hours, minutes, delta, expected) => {
  expect(adjustSleepDuration(hours, minutes, delta)).toBe(expected);
});
