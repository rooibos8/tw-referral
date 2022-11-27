import { atom } from 'recoil';

export type UiState = {
  isLoading: boolean;
};

const UI_DEFAULT_STATE = {
  isLoading: false,
} as const;

const uiState = atom<UiState>({
  key: 'ui',
  default: UI_DEFAULT_STATE,
});

export { uiState };
