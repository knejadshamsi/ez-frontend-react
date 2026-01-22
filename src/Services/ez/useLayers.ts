import { useEffect, useCallback } from 'react';
import { useServiceStore } from '~globalStores';
import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore, useDrawingStateStore } from '~store';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { useEZOutputMapStore } from '~stores/output';
import { useNotificationStore } from '~/Services/CustomNotification';
import { createEditablePolygonLayer } from './factories/createEditablePolygonLayer';
import { createZoneDisplayLayer } from './factories/createZoneDisplayLayer';
import { createSimulationAreaDisplayLayer } from './factories/createSimulationAreaDisplayLayer';
import { createEmissionsHeatmapLayer } from './factories/createEmissionsHeatmapLayer';
import { createEmissionsHexagonLayer } from './factories/createEmissionsHexagonLayer';
import { createPeopleResponseGridLayerForType } from './factories/createPeopleResponseGridLayer';
import { createTripLegsPathLayer } from './factories/createTripLegsPathLayer';
import { validatePolygon } from '~utils/polygonValidation';
import { coordsToGeoJSON } from '~utils/geoJson';
import { hexToRgb } from '~utils/colors';
import { selectEmissionsMapPoints, selectPeopleResponseMapPoints } from '~utils/mapDataSelectors';
import { mapZoneOpacityToAlpha, mapSimulationAreaOpacityToAlpha } from '~utils/opacityMapping';
import type { Coordinate, EZStateType } from './stores/types';

// Helper interface and function for polygon completion
interface PolygonCompletionConfig {
  coords: Coordinate[][];
  activeId: string;
  updateFn: (id: string, data: { coords: Coordinate[][] }) => void;
  useSimConstraints: boolean;
  shouldClearAfterSave: boolean;
  entityType: 'zone' | 'area';
}

const handlePolygonCompletion = (
  config: PolygonCompletionConfig,
  setNotification: (msg: string, type: 'error' | 'success') => void,
  setDrawToolGeoJson: (data: any) => void,
  setState: (state: EZStateType) => void,
  resetDrawingState: () => void,
  ezState: EZStateType
): void => {
  const { coords, activeId, updateFn, useSimConstraints, shouldClearAfterSave, entityType } = config;

  if (coords && coords[0] && coords[0].length >= 4) {
    const validation = validatePolygon(coords, useSimConstraints);

    if (!validation.isValid) {
      setNotification(validation.error!, 'error');
      setDrawToolGeoJson({ type: 'FeatureCollection', features: [] });
      return;
    }

    updateFn(activeId, { coords });

    // Reset scale to 100% when redrawing emission zone
    if (entityType === 'zone' && ezState === 'REDRAW_EM_ZONE') {
      const sessionZones = useEZSessionStore.getState().zones;
      const currentScale = sessionZones[activeId]?.scale || [100, 'center'];
      useEZSessionStore.getState().setZoneProperty(activeId, 'scale', [100, currentScale[1]]);
    }

    if (shouldClearAfterSave) {
      setDrawToolGeoJson({ type: 'FeatureCollection', features: [] });
    }

    setState('PARAMETER_SELECTION');
    resetDrawingState();
  }
};

export function useLayers() {
  const activeService = useServiceStore((state) => state.activeService);

  // EZ state subscriptions
  const ezState = useEZServiceStore((state) => state.state);
  const setState = useEZServiceStore((state) => state.setState);
  const drawToolGeoJson = useDrawToolStore((state) => state.drawToolGeoJson);
  const setDrawToolGeoJson = useDrawToolStore((state) => state.setDrawToolGeoJson);
  const activeZone = useEZSessionStore((state) => state.activeZone);
  const activeCustomArea = useEZSessionStore((state) => state.activeCustomArea);
  const sessionZones = useEZSessionStore((state) => state.zones);
  const sessionCustomAreas = useEZSessionStore((state) => state.customAreas);
  const sessionScaledAreas = useEZSessionStore((state) => state.scaledAreas);
  const simulationAreaDisplay = useEZSessionStore((state) => state.simulationAreaDisplay);
  const apiZones = useAPIPayloadStore((state) => state.payload.zones);
  const customSimulationAreas = useAPIPayloadStore((state) => state.payload.customSimulationAreas);
  const scaledSimulationAreas = useAPIPayloadStore((state) => state.payload.scaledSimulationAreas);
  const updateZone = useAPIPayloadStore((state) => state.updateZone);
  const updateCustomSimulationArea = useAPIPayloadStore((state) => state.updateCustomSimulationArea);

  // Output map data
  const emissionsMapData = useEZOutputMapStore((state) => state.emissionsMapData);
  const peopleResponseMapData = useEZOutputMapStore((state) => state.peopleResponseMapData);
  const tripLegsMapData = useEZOutputMapStore((state) => state.tripLegsMapData);

  // Output filter settings
  const isEmissionsMapVisible = useEZOutputFiltersStore((state) => state.isEmissionsMapVisible);
  const isPeopleResponseMapVisible = useEZOutputFiltersStore((state) => state.isPeopleResponseMapVisible);
  const isTripLegsMapVisible = useEZOutputFiltersStore((state) => state.isTripLegsMapVisible);
  const selectedVisualizationType = useEZOutputFiltersStore((state) => state.selectedVisualizationType);
  const selectedPollutantType = useEZOutputFiltersStore((state) => state.selectedPollutantType);
  const selectedResponseLayerView = useEZOutputFiltersStore((state) => state.selectedResponseLayerView);
  const selectedBehavioralResponseType = useEZOutputFiltersStore((state) => state.selectedBehavioralResponseType);
  const visibleTripLegIds = useEZOutputFiltersStore((state) => state.visibleTripLegIds);
  const inputZoneLayerOpacity = useEZOutputFiltersStore((state) => state.inputZoneLayerOpacity);
  const inputSimulationAreaLayerOpacity = useEZOutputFiltersStore((state) => state.inputSimulationAreaLayerOpacity);

  // Drawing state
  const visibleZoneIds = useDrawingStateStore((state) => state.visibleZoneIds);
  const visibleAreaIds = useDrawingStateStore((state) => state.visibleAreaIds);
  const hideAllZones = useDrawingStateStore((state) => state.hideAllZones);
  const hideAllAreas = useDrawingStateStore((state) => state.hideAllAreas);
  const setOtherLayersExpanded = useDrawingStateStore((state) => state.setOtherLayersExpanded);
  const resetDrawingState = useDrawingStateStore((state) => state.reset);

  const setNotification = useNotificationStore((state) => state.setNotification);

  // Helper: Check if in any polygon mode
  const isPolygonMode =
    ezState === 'DRAW_EM_ZONE' ||
    ezState === 'DRAW_SIM_AREA' ||
    ezState === 'EDIT_EM_ZONE' ||
    ezState === 'EDIT_SIM_AREA' ||
    ezState === 'REDRAW_EM_ZONE';

  // Initialize drawToolGeoJson when entering DRAW or EDIT mode
  useEffect(() => {
    if (activeService !== 'EZ') return;

    // Clear for DRAW and REDRAW modes (blank canvas for drawing)
    if (ezState === 'DRAW_EM_ZONE' || ezState === 'DRAW_SIM_AREA' || ezState === 'REDRAW_EM_ZONE') {
      setDrawToolGeoJson({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }

    // Initialize for EDIT modes
    if (ezState === 'EDIT_EM_ZONE' && activeZone) {
      const zone = apiZones.find(z => z.id === activeZone);
      if (zone?.coords) {
        setDrawToolGeoJson(coordsToGeoJSON(zone.coords));
      }
    } else if (ezState === 'EDIT_SIM_AREA' && activeCustomArea) {
      const area = customSimulationAreas.find(a => a.id === activeCustomArea);
      if (area?.coords) {
        setDrawToolGeoJson(coordsToGeoJSON(area.coords));
      }
    }
  }, [ezState, activeService, activeZone, activeCustomArea, apiZones, customSimulationAreas, setDrawToolGeoJson]);

  // Initialize layer visibility when entering any polygon mode (EXACT same behavior for draw/edit)
  useEffect(() => {
    if (activeService !== 'EZ') return;

    if (isPolygonMode) {
      console.log('[useLayers] Entering polygon mode - hiding all layers');
      hideAllZones();
      hideAllAreas();
      setOtherLayersExpanded(false);
    }
  }, [ezState, activeService, isPolygonMode, hideAllZones, hideAllAreas, setOtherLayersExpanded]);

  // Consolidated edit handler for both zones and areas (handles DRAW and EDIT modes)
  const handlePolygonEdit = useCallback(({ updatedData, editType, editContext }: any) => {
    if (!updatedData || !updatedData.features) {
      return;
    }

    // Always update the temporary draw tool state
    setDrawToolGeoJson(updatedData);

    // Handle polygon completion (DrawPolygonMode - drawing new)
    if (editType === 'addFeature' && updatedData.features.length > 0) {
      const feature = updatedData.features[0];

      if (feature?.geometry?.type === 'Polygon') {
        const coords = feature.geometry.coordinates as Coordinate[][];

        // Determine mode from ezState
        const isZoneMode = ezState === 'DRAW_EM_ZONE' || ezState === 'EDIT_EM_ZONE' || ezState === 'REDRAW_EM_ZONE';
        const activeId = isZoneMode ? activeZone : activeCustomArea;

        if (!activeId) return;

        handlePolygonCompletion(
          {
            coords,
            activeId,
            updateFn: isZoneMode ? updateZone : updateCustomSimulationArea,
            useSimConstraints: !isZoneMode, // Areas use stricter constraints
            shouldClearAfterSave: !isZoneMode, // Only areas clear GeoJSON after save
            entityType: isZoneMode ? 'zone' : 'area'
          },
          setNotification,
          setDrawToolGeoJson,
          setState,
          resetDrawingState,
          ezState
        );
      }
    }

    // Handle vertex modifications (drawToolGeoJson updated in real time)
    if (editType === 'updateFeature' || editType === 'movePosition') {
      // Real-time update already handled by setDrawToolGeoJson above
    }
  }, [
    activeZone,
    activeCustomArea,
    updateZone,
    updateCustomSimulationArea,
    setState,
    setDrawToolGeoJson,
    resetDrawingState,
    setNotification,
    ezState
  ]);

  // Create unified polygon layer for all 4 states (DRAW_EM_ZONE, EDIT_EM_ZONE, DRAW_SIM_AREA, EDIT_SIM_AREA)
  const editablePolygonLayer = (() => {
    if (activeService !== 'EZ') return null;

    // DRAW_EM_ZONE: Drawing new emission zone
    if (ezState === 'DRAW_EM_ZONE') {
      return createEditablePolygonLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handlePolygonEdit,
        mode: 'draw',
        color: [255, 0, 0],  // Red
        type: 'zone'
      });
    }

    // REDRAW_EM_ZONE: Redrawing existing emission zone
    if (ezState === 'REDRAW_EM_ZONE' && activeZone) {
      const zone = apiZones.find(z => z.id === activeZone);
      if (!zone) {
        console.error('[useLayers] Cannot redraw zone - zone not found:', activeZone);
        return null;
      }

      const sessionData = sessionZones[zone.id];
      const colorRGB = hexToRgb(sessionData?.color || '#FF0000');

      return createEditablePolygonLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handlePolygonEdit,
        mode: 'draw',
        color: colorRGB,
        type: 'zone'
      });
    }

    // EDIT_EM_ZONE: Editing existing emission zone
    if (ezState === 'EDIT_EM_ZONE' && activeZone) {
      const zone = apiZones.find(z => z.id === activeZone);
      if (!zone?.coords) {
        console.error('[useLayers] Cannot edit zone - no coords found:', activeZone);
        return null;
      }

      const sessionData = sessionZones[zone.id];
      const colorRGB = hexToRgb(sessionData?.color || '#FF0000');

      return createEditablePolygonLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handlePolygonEdit,
        mode: 'modify',
        color: colorRGB,
        type: 'zone'
      });
    }

    // DRAW_SIM_AREA: Drawing new simulation area
    if (ezState === 'DRAW_SIM_AREA') {
      return createEditablePolygonLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handlePolygonEdit,
        mode: 'draw',
        color: [0, 188, 212],  // Cyan
        type: 'area'
      });
    }

    // EDIT_SIM_AREA: Editing existing simulation area
    if (ezState === 'EDIT_SIM_AREA' && activeCustomArea) {
      const area = customSimulationAreas.find(a => a.id === activeCustomArea);
      if (!area?.coords) {
        console.error('[useLayers] Cannot edit area - no coords found:', activeCustomArea);
        return null;
      }

      const sessionData = sessionCustomAreas[area.id];
      const colorRGB = hexToRgb(sessionData?.color || '#00BCD4');

      return createEditablePolygonLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handlePolygonEdit,
        mode: 'modify',
        color: colorRGB,
        type: 'area'
      });
    }

    return null;
  })();

  // Only show display layers in PARAMETER_SELECTION mode
  // In polygon modes, use drawingLayers instead (which respect visibility toggles)
  const shouldShowDisplayLayers = ezState === 'PARAMETER_SELECTION';

  const displayLayer = shouldShowDisplayLayers && activeService === 'EZ'
    ? createZoneDisplayLayer({
        zones: apiZones
          .filter(zone => {
            const sessionData = sessionZones[zone.id];
            return zone.coords && sessionData && !sessionData.hidden;
          })
          .map(zone => ({
            coords: zone.coords!,
            color: sessionZones[zone.id].color
          }))
      })
    : null;

  const simulationAreaDisplayLayer = shouldShowDisplayLayers && activeService === 'EZ'
    ? createSimulationAreaDisplayLayer({
        areas: [
          ...customSimulationAreas
            .filter(area => area.coords !== null)
            .map(area => {
              const sessionData = sessionCustomAreas[area.id];
              return {
                coords: area.coords!,
                color: sessionData?.color || '#00BCD4',
                type: 'custom' as const
              };
            }),
          ...scaledSimulationAreas
            .filter(area => area.coords && area.coords.length > 0)
            .map(area => {
              const sessionData = sessionScaledAreas[area.id];
              return {
                coords: area.coords,
                color: sessionData?.color || '#1A16E2',
                type: 'scaled' as const
              };
            })
        ],
        borderStyle: simulationAreaDisplay.borderStyle,
        fillOpacity: simulationAreaDisplay.fillOpacity
      })
    : null;

  const createDrawingModeDisplayLayers = (
    mode: 'zone' | 'area',
    activeZone: string | null,
    activeArea: string | null
  ) => {
    const filteredZones = apiZones.filter(zone => {
      if (mode === 'zone' && zone.id === activeZone) return false;
      if (!zone.coords) return false;
      const sessionData = sessionZones[zone.id];
      if (!sessionData || sessionData.hidden) return false;
      return visibleZoneIds.has(zone.id);
    });

    const filteredCustomAreas = customSimulationAreas.filter(area => {
      if (mode === 'area' && area.id === activeArea) return false;
      if (!area.coords) return false;
      return visibleAreaIds.has(area.id);
    });

    const filteredScaledAreas = scaledSimulationAreas.filter(area => {
      const zone = apiZones.find(z => z.id === area.zoneId);
      if (!zone) return false;
      const sessionData = sessionZones[area.zoneId];
      if (!sessionData || sessionData.hidden) return false;
      return area.coords && area.coords.length > 0 && visibleZoneIds.has(area.zoneId);
    });

    return {
      zoneLayer: filteredZones.length > 0
        ? createZoneDisplayLayer({
            zones: filteredZones.map(zone => ({
              coords: zone.coords!,
              color: sessionZones[zone.id].color
            }))
          })
        : null,

      areaLayer: (filteredCustomAreas.length > 0 || filteredScaledAreas.length > 0)
        ? createSimulationAreaDisplayLayer({
            areas: [
              ...filteredCustomAreas.map(area => {
                const sessionData = sessionCustomAreas[area.id];
                return {
                  coords: area.coords!,
                  color: sessionData?.color || '#00BCD4',
                  type: 'custom' as const
                };
              }),
              ...filteredScaledAreas.map(area => {
                const sessionData = sessionScaledAreas[area.id];
                return {
                  coords: area.coords,
                  color: sessionData?.color || '#1A16E2',
                  type: 'scaled' as const
                };
              })
            ],
            borderStyle: simulationAreaDisplay.borderStyle,
            fillOpacity: simulationAreaDisplay.fillOpacity
          })
        : null
    };
  };

  const drawingLayers = isPolygonMode
    ? createDrawingModeDisplayLayers(
        (ezState === 'DRAW_EM_ZONE' || ezState === 'EDIT_EM_ZONE' || ezState === 'REDRAW_EM_ZONE') ? 'zone' : 'area',
        activeZone,
        activeCustomArea
      )
    : { zoneLayer: null, areaLayer: null };

  // Create output layers
  const isResultView = ezState === 'RESULT_VIEW' && activeService === 'EZ';

  const emissionsOutputLayer = isResultView && isEmissionsMapVisible && emissionsMapData
    ? (() => {
        const points = selectEmissionsMapPoints(emissionsMapData, selectedPollutantType);
        if (points.length === 0) return null;
        return selectedVisualizationType === 'heatmap'
          ? createEmissionsHeatmapLayer({ data: points })
          : createEmissionsHexagonLayer({ data: points });
      })()
    : null;

  const peopleResponseOutputLayer = isResultView && isPeopleResponseMapVisible && peopleResponseMapData
    ? (() => {
        const points = selectPeopleResponseMapPoints(peopleResponseMapData, selectedResponseLayerView, selectedBehavioralResponseType);
        if (points.length === 0) return null;
        return createPeopleResponseGridLayerForType(points, selectedBehavioralResponseType);
      })()
    : null;

  const tripLegsOutputLayer = isResultView && isTripLegsMapVisible && tripLegsMapData.length > 0
    ? (() => {
        const visiblePaths = tripLegsMapData.filter(path => visibleTripLegIds.has(path.id));
        if (visiblePaths.length === 0) return null;
        return createTripLegsPathLayer({ data: visiblePaths });
      })()
    : null;

  const outputZoneDisplayLayer = isResultView && inputZoneLayerOpacity !== 'hidden'
    ? (() => {
        const alphaValue = mapZoneOpacityToAlpha(inputZoneLayerOpacity);
        if (alphaValue === null) return null;

        const filteredZones = apiZones
          .filter(zone => {
            const sessionData = sessionZones[zone.id];
            return zone.coords && sessionData && !sessionData.hidden;
          })
          .map(zone => ({
            coords: zone.coords!,
            color: sessionZones[zone.id].color
          }));

        if (filteredZones.length === 0) return null;

        return createZoneDisplayLayer({
          zones: filteredZones,
          fillOpacityOverride: alphaValue
        });
      })()
    : null;

  const outputSimulationAreaDisplayLayer = isResultView && inputSimulationAreaLayerOpacity !== 'hidden'
    ? (() => {
        const alphaValue = mapSimulationAreaOpacityToAlpha(
          inputSimulationAreaLayerOpacity,
          simulationAreaDisplay.fillOpacity || 51
        );
        if (alphaValue === null) return null;

        const filteredAreas = [
          ...customSimulationAreas
            .filter(area => area.coords !== null)
            .map(area => {
              const sessionData = sessionCustomAreas[area.id];
              return {
                coords: area.coords!,
                color: sessionData?.color || '#00BCD4',
                type: 'custom' as const
              };
            }),
          ...scaledSimulationAreas
            .filter(area => area.coords && area.coords.length > 0)
            .map(area => {
              const sessionData = sessionScaledAreas[area.id];
              return {
                coords: area.coords,
                color: sessionData?.color || '#1A16E2',
                type: 'scaled' as const
              };
            })
        ];

        if (filteredAreas.length === 0) return null;

        return createSimulationAreaDisplayLayer({
          areas: filteredAreas,
          borderStyle: simulationAreaDisplay.borderStyle,
          fillOpacity: alphaValue
        });
      })()
    : null;

  return [
    outputSimulationAreaDisplayLayer,
    outputZoneDisplayLayer,
    drawingLayers.areaLayer,
    simulationAreaDisplayLayer,
    drawingLayers.zoneLayer,
    displayLayer,
    emissionsOutputLayer,
    peopleResponseOutputLayer,
    tripLegsOutputLayer,
    editablePolygonLayer
  ].filter(Boolean);
}
