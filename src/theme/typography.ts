import { Platform, TextStyle } from 'react-native';

/**
 * Системные шрифты — без загрузки лишних ассетов. Ledger-ощущение
 * держится на табличных цифрах для дат и сумм и на плотном трекинге
 * заголовков, а не на декоративной гарнитуре.
 */

const tabularNums: TextStyle = Platform.select({
  ios: { fontVariant: ['tabular-nums'] },
  android: { fontVariant: ['tabular-nums'] },
  default: {},
}) as TextStyle;

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TextStyle,
  heading: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
  } as TextStyle,
  bodyStrong: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
  } as TextStyle,
  numeric: {
    fontSize: 16,
    fontWeight: '600',
    ...tabularNums,
  } as TextStyle,
  numericLarge: {
    fontSize: 22,
    fontWeight: '700',
    ...tabularNums,
  } as TextStyle,
};
