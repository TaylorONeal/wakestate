// Public support contact. Intentionally empty until the publisher's real support
// address is set at store setup. While empty, the About screen hides the feedback section.
export const SUPPORT_EMAIL = '';
export const FEEDBACK_MAILTO = SUPPORT_EMAIL
  ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('WakeState feedback')}`
  : null;
