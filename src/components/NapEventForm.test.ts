import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NapEventForm } from './NapEventForm';

const state = vi.hoisted(() => ({ dateIndex: 0, endMinute: 32 }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: <T,>(initial: T | (() => T)) => {
      const result = actual.useState(initial);
      // Model the end input's existing minute-precision update while exercising
      // the real component's start initializer, duration display used by save validation.
      if (result[0] instanceof Date && state.dateIndex++ === 1) {
        return [new Date(2026, 9, 6, 10, state.endMinute, 0, 0), result[1]];
      }
      return result;
    },
  };
});

// Motion/portal behavior is unrelated to the time precision regression.
vi.mock('framer-motion', () => ({ motion: { div: 'div', button: 'button' } }));

afterEach(() => vi.useRealTimers());

describe('nap displayed minute precision', () => {
  it.each([1, 2])('shows %i full minutes when only the end input changes', (minutes) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 6, 10, 30, 42, 500));
    state.dateIndex = 0;
    state.endMinute = 30 + minutes;
    const markup = renderToStaticMarkup(createElement(NapEventForm, {
      onClose: () => {}, onBack: () => {}, onSave: () => {},
    }));
    expect(markup).toContain(`0h ${minutes}m`);
    expect(markup).toContain('value="10:30"');
    expect(markup).toContain(`value="10:${30 + minutes}"`);
    expect(markup).not.toContain('Set end time');
  });
});
