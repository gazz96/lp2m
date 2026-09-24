import type { InjectionKey, Ref } from 'vue'

export type TrackTableVariant = 'default' | 'compact'

/** Diteruskan `TrackTable` → `TrackRow` agar `TrackRow` tidak perlu prop per-baris. */
export const trackRowKey: InjectionKey<Ref<TrackTableVariant>> = Symbol('trackRowVariant')
