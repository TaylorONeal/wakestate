// Public support contact (Purafield Studio LLC). Shared by the About screen feedback
// link, privacy.html and the store listing. If this changes, update public/privacy.html too.
// Clear it to hide the About screen feedback section.
export const SUPPORT_EMAIL = 'purafieldstudio@gmail.com';
export const FEEDBACK_MAILTO = SUPPORT_EMAIL
  ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('WakeState feedback')}`
  : null;
