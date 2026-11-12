/** 読みはじめの案内を、はじめて開いたときに1度だけ見せるための記録 */
import { createPersistentStore, useStore } from '@/lib/persistentStore';

const store = createPersistentStore<{ seen: boolean }>('guide.v1', { seen: false });

export function useGuideSeen(): boolean {
  return useStore(store).seen;
}

export function markGuideSeen(): void {
  store.update((state) => (state.seen ? state : { seen: true }));
}
