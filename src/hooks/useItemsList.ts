import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { listActive, listArchive } from '@/db/items';
import { Direction, Item } from '@/db/types';

export function useActiveItems(direction: Direction) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await listActive(direction);
    setItems(data);
    setLoading(false);
  }, [direction]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { items, loading, refresh };
}

export function useArchiveItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await listArchive();
    setItems(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { items, loading, refresh };
}
