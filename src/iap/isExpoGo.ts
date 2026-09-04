import Constants, { AppOwnership } from 'expo-constants';

/**
 * true только в приложении Expo Go (не в кастомном dev client и не в
 * релизной сборке) — там нативных модулей IAP/RuStore физически нет,
 * и вызов их JS-обёрток уронит экран вместо мягкого "недоступно".
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === AppOwnership.Expo;
}
