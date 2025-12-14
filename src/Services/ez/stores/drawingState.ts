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

export const useDrawingStateStore = create<DrawingStateStore>((set) => ({
  ...createInitialState(),

  toggleZoneVisibility: (zoneId: string) =>
    set((state) => {
      const newVisibleIds = new Set(state.visibleZoneIds);
      if (newVisibleIds.has(zoneId)) {
        newVisibleIds.delete(zoneId);
      } else {
        newVisibleIds.add(zoneId);
      }
      return { visibleZoneIds: newVisibleIds };
    }),

  showAllZones: (zoneIds: string[]) =>
    set({ visibleZoneIds: new Set(zoneIds) }),

  hideAllZones: () =>
    set({ visibleZoneIds: new Set<string>() }),

  toggleAreaVisibility: (areaId: string) =>
    set((state) => {
      const newVisibleIds = new Set(state.visibleAreaIds);
      if (newVisibleIds.has(areaId)) {
        newVisibleIds.delete(areaId);
      } else {
        newVisibleIds.add(areaId);
      }
      return { visibleAreaIds: newVisibleIds };
    }),

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
