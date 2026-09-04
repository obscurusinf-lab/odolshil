import { getSetting, setSetting } from '@/db/settings';

const KEY = 'purchased';

export async function isPurchased(): Promise<boolean> {
  return (await getSetting(KEY)) === '1';
}

export async function setPurchased(value: boolean): Promise<void> {
  await setSetting(KEY, value ? '1' : '0');
}
