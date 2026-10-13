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

function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  return act(async () => root.render(createElement(CheckInScreen, {
    onEventClick: vi.fn(), onSave, onNavigateToTrends: onNavigate, onBack: vi.fn(),
  })));
}

// The app unmounts this screen when the post-save navigation switches tabs.
async function navigateAway() {
  await act(async () => root.unmount());
  container.remove();
}

function sliders() {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="range"]'));
}

function scores() {
  return sliders().map(slider => Number(slider.value));
}

async function setScore(index: number, value: number) {
  const slider = sliders()[index];
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(slider, String(value));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function toggleTag(label: string) {
  const chip = Array.from(container.querySelectorAll('button')).find(button => button.textContent === label)!;
  await act(async () => { chip.click(); });
}

function noteField() {
  return container.querySelector('textarea');
}

// The note field swaps in after the "Add note" button's short exit animation.
async function shownNote() {
  for (let attempt = 0; attempt < 40 && !noteField(); attempt++) {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 25)); });
  }
  return noteField()?.value;
}

async function clickUndo(saveIndex = 0) {
  const action = vi.mocked(toast.success).mock.calls[saveIndex][1]!.action;
  if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('Expected an Undo action');
  await act(async () => { await action.onClick({} as React.MouseEvent<HTMLButtonElement>); });
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
  await mount();
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

describe('Undo gives the entered values back', () => {
  // What the person had on the form when they saved: the restored draft plus
  // two edits made on screen (effort 1 to 4, and the "stress" tag).
  const entered = {
    ...draft,
    narcolepsyDomains: { ...draft.narcolepsyDomains, effort: 4 },
    activeTags: ['nap', 'stress'],
  };
  const enteredScores = [3, 2, 5, 4, 4];
  const blankScores = [1, 1, 1, 1, 1];

  async function enterAndSave() {
    await setScore(4, 4);
    await toggleTag('stress');
    expect(scores()).toEqual(enteredScores);
    await clickSave();
    expect(await storage.getCheckIns()).toHaveLength(1);
    // The form is cleared for the next entry once the save commits.
    expect(scores()).toEqual(blankScores);
    expect(noteField()).toBeNull();
    expect(localStorage.getItem(draftKey)).toBeNull();
  }

  it('puts the saved scores, tags, note and time back on the form and in the draft', async () => {
    await enterAndSave();
    await clickUndo();
    expect(await storage.getCheckIns()).toEqual([]);
    expect(scores()).toEqual(enteredScores);
    expect(await shownNote()).toBe(entered.note);
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(entered);

    // Saving again writes what was entered, not a default record.
    await clickSave();
    const entries = await storage.getCheckIns();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      narcolepsyDomains: entered.narcolepsyDomains, tags: entered.activeTags, note: entered.note,
      localDate: format(new Date(entered.dateTime), 'yyyy-MM-dd'),
      localTime: format(new Date(entered.dateTime), 'HH:mm'),
    });
  });

  it('leaves the form cleared and the record in the journal when Undo fails', async () => {
    await enterAndSave();
    vi.spyOn(storage, 'deleteCheckIn').mockRejectedValueOnce(new Error('Storage unavailable'));
    await clickUndo();
    expect(toast.error).toHaveBeenCalledWith('Could not undo. Your saved check-in is still in the journal.');
    expect(await storage.getCheckIns()).toHaveLength(1);
    expect(scores()).toEqual(blankScores);
    expect(noteField()).toBeNull();
    expect(localStorage.getItem(draftKey)).toBeNull();
  });

  it('keeps the values as the draft when Undo is tapped after the screen navigated away', async () => {
    await enterAndSave();
    await navigateAway();
    await clickUndo();
    expect(await storage.getCheckIns()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(entered);

    // Returning to the check-in screen recovers them through the draft path.
    vi.mocked(toast.info).mockClear();
    await mount();
    expect(toast.info).toHaveBeenCalledWith('Draft restored', expect.anything());
    expect(scores()).toEqual(enteredScores);
    expect(await shownNote()).toBe(entered.note);
  });

  it('restores into the form on screen when Undo comes from an earlier visit to it', async () => {
    await enterAndSave();
    await navigateAway();
    await mount();
    expect(scores()).toEqual(blankScores);
    await clickUndo();
    expect(await storage.getCheckIns()).toEqual([]);
    expect(scores()).toEqual(enteredScores);
    expect(await shownNote()).toBe(entered.note);
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(entered);
  });

  it('ignores a second Undo tap so later edits are not overwritten', async () => {
    const remove = vi.spyOn(storage, 'deleteCheckIn');
    await enterAndSave();
    await clickUndo();
    await setScore(0, 5);
    await clickUndo();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(scores()).toEqual([5, 2, 5, 4, 4]);
  });

  it('keeps nothing behind when the Undo window passes unused', async () => {
    await enterAndSave();
    expect(vi.mocked(toast.success).mock.calls[0][1]).toMatchObject({ duration: 5000 });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 1700)); });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(await storage.getCheckIns()).toHaveLength(1);
    expect(scores()).toEqual(blankScores);
    expect(localStorage.getItem(draftKey)).toBeNull();
  });
});
