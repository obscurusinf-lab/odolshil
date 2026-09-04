/**
 * Палитра «Гроссбух»: разлинованная бумага / графитовый переплёт.
 * Один акцент (тёплый кирпично-красный) держим только за просрочкой —
 * везде остальное нейтральный чёрно-белый ряд, как чернила на бумаге.
 */

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  accent: string;
  accentInk: string;
  overlay: string;
}

const light: Palette = {
  background: '#F2EFE9',
  surface: '#FBFAF7',
  surfaceRaised: '#FFFFFF',
  border: '#D9D3C7',
  ink: '#20211F',
  inkMuted: '#5B584E',
  inkFaint: '#948F80',
  accent: '#B23A2E',
  accentInk: '#FFFFFF',
  overlay: 'rgba(32,33,31,0.5)',
};

const dark: Palette = {
  background: '#15161A',
  surface: '#1D1F24',
  surfaceRaised: '#262931',
  border: '#33363E',
  ink: '#EDEBE4',
  inkMuted: '#A6A79F',
  inkFaint: '#6E7178',
  accent: '#E0574B',
  accentInk: '#1A0C0A',
  overlay: 'rgba(0,0,0,0.6)',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
