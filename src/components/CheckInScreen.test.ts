// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { clear } from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns';
import * as storage from '@/lib/storage';
import { CheckInScreen } from './CheckInScreen';

vi.mock('uuid', async (original) => {
  const actual = await original<typeof import('uuid')>();
  return { ...actual, v4: vi.fn(actual.v4) };
});
vi.mock('sonner', () => ({ toast: { info: vi.fn(), warning: vi.fn(), error: vi.fn(), success: vi.fn() } }));

const draftKey = 'wakestate_checkin_draft_v2';
const draft = {
  dateTime: '2026-10-01T12:30:00.000Z',
  narcolepsyDomains: { sleepPressure: 3, microsleeps: 2, sleepInertia: 5, cognitive: 4, effort: 1 },
  overlappingDomains: { anxiety: 1, mood: 1, digestive: 1, thermo: 1, motor: 1, emotional: 1, sensory: 1 },
  activeTags: ['nap'], note: 'Synthetic save regression', overlappingExpanded: false,
};
let root: Root;
let container: HTMLDivElement;
const onSave = vi.fn();
const onNavigate = vi.fn();

function saveButton() {
  return Array.from(container.querySelectorAll('button')).find(button =>
    /Save Check-In|Saving|Check-In Saved/.test(button.textContent ?? '')
  )!;
}

async function clickSave() {
  await act(async () => {
    saveButton().click();
    // Queue a read behind the real write transaction, then flush React updates.
    await storage.getCheckIns();
  });
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.clearAllMocks();
  await clear();
  localStorage.clear();
  localStorage.setItem(draftKey, JSON.stringify(draft));
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(createElement(CheckInScreen, {
    onEventClick: vi.fn(), onSave, onNavigateToTrends: onNavigate, onBack: vi.fn(),
  })));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('check-in save recovery through the real form', () => {
  it('recovers from record creation failure and retries the unchanged restored draft', async () => {
    vi.mocked(uuidv4).mockImplementationOnce(() => { throw new Error('Random source unavailable'); });
    await clickSave();
    expect(saveButton().disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Could not save');
    expect(toast.success).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(await storage.getCheckIns()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(draft);

    await clickSave();
    const entries = await storage.getCheckIns();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      narcolepsyDomains: draft.narcolepsyDomains, tags: draft.activeTags, note: draft.note,
      localDate: format(new Date(draft.dateTime), 'yyyy-MM-dd'),
      localTime: format(new Date(draft.dateTime), 'HH:mm'),
    });
    expect(localStorage.getItem(draftKey)).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('keeps the draft and exposes an inline retryable error if storage rejects the write', async () => {
    vi.spyOn(storage, 'saveCheckIn').mockRejectedValueOnce(new DOMException('Quota exceeded', 'QuotaExceededError'));
    await clickSave();
    expect(saveButton().disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Could not save');
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(draft);
    expect(toast.success).not.toHaveBeenCalled();
    await clickSave();
    expect(await storage.getCheckIns()).toHaveLength(1);
  });

  it('finishes a committed save even if optional vibration throws', async () => {
    vi.stubGlobal('navigator', { vibrate: () => { throw new Error('Haptics unavailable'); } });
    await clickSave();
    expect(await storage.getCheckIns()).toHaveLength(1);
    expect(localStorage.getItem(draftKey)).toBeNull();
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('prevents another save during confirmation and permits a new save after Undo', async () => {
    await clickSave();
    expect(saveButton().disabled).toBe(true);
    await clickSave();
    expect(await storage.getCheckIns()).toHaveLength(1);
    const options = vi.mocked(toast.success).mock.calls[0][1]!;
    const action = options.action;
    if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('Expected an Undo action');
    await act(async () => { await action.onClick({} as React.MouseEvent<HTMLButtonElement>); });
    expect(await storage.getCheckIns()).toEqual([]);
    expect(saveButton().disabled).toBe(false);
    await clickSave();
    expect(await storage.getCheckIns()).toHaveLength(1);
  });

  it('ignores repeated taps while a write is pending', async () => {
    const actualSave = storage.saveCheckIn;
    let finishWrite: () => void;
    const pending = new Promise<void>(resolve => { finishWrite = resolve; });
    const save = vi.spyOn(storage, 'saveCheckIn').mockImplementation(async entry => {
      await pending;
      await actualSave(entry);
    });
    await act(async () => { saveButton().click(); saveButton().click(); });
    expect(save).toHaveBeenCalledTimes(1);
    expect(saveButton().disabled).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(draft);
    await act(async () => {
      finishWrite();
      await save.mock.results[0].value;
    });
    expect(await storage.getCheckIns()).toHaveLength(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
