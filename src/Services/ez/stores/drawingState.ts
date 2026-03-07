import { create } from 'zustand';

// === DRAWING STATE TYPES ===

export interface DrawingStateStore {

  visibleZoneIds: Set<string>;
  visibleAreaIds: Set<string>;

  isOtherLayersExpanded: boolean;

  toggleZoneVisibility: (zoneId: string) => void;
  showAllZones: (zoneIds: string[]) => void;
  hideAllZones: () => void;

  toggleAreaVisibility: (areaId: string) => void;
  showAllAreas: (areaIds: string[]) => void;
  hideAllAreas: () => void;

  setOtherLayersExpanded: (expanded: boolean) => void;

  reset: () => void;
}

// === DRAWING STATE STORE ===

const createInitialState = () => ({
  visibleZoneIds: new Set<string>(),
  visibleAreaIds: new Set<string>(),
  isOtherLayersExpanded: false,
});

const toggleId = (ids: Set<string>, id: string): Set<string> => {
  const next = new Set(ids);
  if (next.has(id)) { next.delete(id); } else { next.add(id); }
  return next;
};

export const useDrawingStateStore = create<DrawingStateStore>((set) => ({
  ...createInitialState(),

  toggleZoneVisibility: (zoneId: string) =>
    set((state) => ({ visibleZoneIds: toggleId(state.visibleZoneIds, zoneId) })),

  showAllZones: (zoneIds: string[]) =>
    set({ visibleZoneIds: new Set(zoneIds) }),

  hideAllZones: () =>
    set({ visibleZoneIds: new Set<string>() }),

  toggleAreaVisibility: (areaId: string) =>
    set((state) => ({ visibleAreaIds: toggleId(state.visibleAreaIds, areaId) })),

  showAllAreas: (areaIds: string[]) =>
    set({ visibleAreaIds: new Set(areaIds) }),

  hideAllAreas: () =>
    set({ visibleAreaIds: new Set<string>() }),

  setOtherLayersExpanded: (expanded: boolean) =>
    set({ isOtherLayersExpanded: expanded }),

  reset: () => {
    set(createInitialState());
  },
}));
