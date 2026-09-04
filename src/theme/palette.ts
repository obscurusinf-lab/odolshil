/**
 * Палитра «Серый гроссбух»: интерфейс — чистый нейтральный серый, без
 * тёплого бумажного оттенка. Цвет несёт только статус срока — просрочено
 * (danger, красный) и до срока (success, приглушённый зелёный). Кнопки,
 * ссылки, FAB — монохромные (ink/surface), никакого «брендового» акцента.
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
  /** Просрочка: заливка бейджа (одна на обе темы — самодостаточная плашка). */
  danger: string;
  /** Текст на заливке danger. */
  dangerInk: string;
  /** Просрочка в виде текста/рамки (не заливки) — контраст подобран под тему. */
  dangerText: string;
  /** До срока: заливка бейджа (одна на обе темы). */
  success: string;
  /** Текст на заливке success. */
  successInk: string;
  overlay: string;
}

const light: Palette = {
  background: '#F0F0F0',
  surface: '#FAFAFA',
  surfaceRaised: '#FFFFFF',
  border: '#DCDCDC',
  ink: '#1C1C1C',
  inkMuted: '#6C6C6C',
  inkFaint: '#9A9A9A',
  danger: '#A82A1E',
  dangerInk: '#FFEFE9',
  dangerText: '#B23A2E',
  success: '#5F7A68',
  successInk: '#EFF6EF',
  overlay: 'rgba(28,28,28,0.5)',
};

const dark: Palette = {
  background: '#17181A',
  surface: '#202224',
  surfaceRaised: '#2A2C2F',
  border: '#3A3C3F',
  ink: '#ECECEC',
  inkMuted: '#9B9C9E',
  inkFaint: '#6B6C6E',
  danger: '#A82A1E',
  dangerInk: '#FFEFE9',
  dangerText: '#E0574B',
  success: '#5F7A68',
  successInk: '#EFF6EF',
  overlay: 'rgba(0,0,0,0.6)',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
