const LIST_FORM_STATUS = {
  OPEN: 1,
  STOP: 2,
  CLOSE: 3,
} as const;
type ListFormStatus = typeof LIST_FORM_STATUS[keyof typeof LIST_FORM_STATUS];

const APPLY_STATUS = {
  STAY: 1,
  ALLOW: 2,
  DENY: 3,
} as const;
type ApplyStatus = typeof APPLY_STATUS[keyof typeof APPLY_STATUS];

export { LIST_FORM_STATUS, APPLY_STATUS };
export type { ListFormStatus, ApplyStatus };
export * from './types';
