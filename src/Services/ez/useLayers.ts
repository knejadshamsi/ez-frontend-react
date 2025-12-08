import { useEffect, useCallback } from 'react';
import { useServiceStore } from '~globalStores';
import { useEZServiceStore, useAPIPayloadStore, useDrawToolStore } from '~store';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { useEZOutputMapStore, getEmissionsPointsForPollutant, getPeopleResponsePoints } from '~stores/output';
import { createEditableZoneLayer } from './factories/createEditableZoneLayer';
import { createEditableSimulationAreaLayer } from './factories/createEditableSimulationAreaLayer';
import { createZoneDisplayLayer } from './factories/createZoneDisplayLayer';
import { createSimulationAreaDisplayLayer } from './factories/createSimulationAreaDisplayLayer';
import { createEmissionsHeatmapLayer } from './factories/createEmissionsHeatmapLayer';
import { createEmissionsHexagonLayer } from './factories/createEmissionsHexagonLayer';
import { createPeopleResponseGridLayerForType } from './factories/createPeopleResponseGridLayer';
import { createTripLegsPathLayer } from './factories/createTripLegsPathLayer';

export function useLayers() {
  const activeService = useServiceStore((state) => state.activeService);

  // EZ state subscriptions
  const ezState = useEZServiceStore((state) => state.state);
  const setState = useEZServiceStore((state) => state.setState);
  const drawToolGeoJson = useDrawToolStore((state) => state.drawToolGeoJson);
  const setDrawToolGeoJson = useDrawToolStore.getState().setDrawToolGeoJson;
  const activeZone = useEZSessionStore((state) => state.activeZone);
  const activeCustomArea = useEZSessionStore((state) => state.activeCustomArea);
  const sessionZones = useEZSessionStore((state) => state.zones);
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

  // Reset drawToolGeoJson when entering drawing mode
  useEffect(() => {
    if ((ezState === 'EMISSION_ZONE_SELECTION' || ezState === 'SIMULATION_AREA_SELECTION') && activeService === 'EZ') {
      console.log('[useLayers] Entering drawing mode - resetting drawToolGeoJson');
      setDrawToolGeoJson({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [ezState, activeService, setDrawToolGeoJson]);

  // Edit handler for emission zones
  const handleEdit = useCallback(({ updatedData, editType, editContext }: any) => {
    if (!updatedData || !updatedData.features) {
      console.warn('[Editable Layer] Edit event has no features:', { editType, updatedData });
      return;
    }

    console.log('[Editable Layer] Edit event:', editType, {
      featuresCount: updatedData.features.length,
      editContext
    });

    setDrawToolGeoJson(updatedData);

    if (editType === 'addFeature' && updatedData.features.length > 0) {
      const feature = updatedData.features[0];

      if (feature?.geometry?.type === 'Polygon' && activeZone) {
        const coords = feature.geometry.coordinates;

        if (coords && coords[0] && coords[0].length >= 4) {
          console.log('[Editable Layer] Polygon complete!', {
            rings: coords.length,
            outerRingPoints: coords[0].length,
            coords
          });

          updateZone(activeZone, { coords });
          setState('PARAMETER_SELECTION');

          console.log('[Editable Layer] Zone saved! Switched to PARAMETER_SELECTION');
        } else {
          console.warn('[Editable Layer] Polygon incomplete - need at least 3 points');
        }
      }
    }
  }, [activeZone, updateZone, setState, setDrawToolGeoJson]);

  // Edit handler for simulation areas
  const handleSimulationAreaEdit = useCallback(({ updatedData, editType, editContext }: any) => {
    if (!updatedData || !updatedData.features) {
      console.warn('[Simulation Area Layer] Edit event has no features:', { editType, updatedData });
      return;
    }

    console.log('[Simulation Area Layer] Edit event:', editType, {
      featuresCount: updatedData.features.length,
      editContext
    });

    setDrawToolGeoJson(updatedData);

    if (editType === 'addFeature' && updatedData.features.length > 0) {
      const feature = updatedData.features[0];

      if (feature?.geometry?.type === 'Polygon' && activeCustomArea) {
        const coords = feature.geometry.coordinates;

        if (coords && coords[0] && coords[0].length >= 4) {
          console.log('[Simulation Area Layer] Polygon complete!', {
            rings: coords.length,
            outerRingPoints: coords[0].length,
            coords
          });

          updateCustomSimulationArea(activeCustomArea, { coords });

          setDrawToolGeoJson({
            type: 'FeatureCollection',
            features: []
          });
          setState('PARAMETER_SELECTION');

          console.log('[Simulation Area Layer] Custom area saved! Switched to PARAMETER_SELECTION');
        } else {
          console.warn('[Simulation Area Layer] Polygon incomplete - need at least 3 points');
        }
      }
    }
  }, [activeCustomArea, updateCustomSimulationArea, setState, setDrawToolGeoJson]);

  // Create input layers
  const editableLayer = ezState === 'EMISSION_ZONE_SELECTION' && activeService === 'EZ'
    ? createEditableZoneLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handleEdit
      })
    : null;

  const simulationAreaEditableLayer = ezState === 'SIMULATION_AREA_SELECTION' && activeService === 'EZ'
    ? createEditableSimulationAreaLayer({
        geoJsonData: drawToolGeoJson,
        onEdit: handleSimulationAreaEdit
      })
    : null;

  const displayLayer = ezState === 'PARAMETER_SELECTION' && activeService === 'EZ'
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

  const simulationAreaDisplayLayer = ezState === 'PARAMETER_SELECTION' && activeService === 'EZ'
    ? createSimulationAreaDisplayLayer({
        areas: [
          ...customSimulationAreas
            .filter(area => area.coords !== null)
            .map(area => ({
              coords: area.coords!,
              color: area.color,
              type: 'custom' as const
            })),
          ...scaledSimulationAreas
            .filter(area => area.coords && area.coords.length > 0)
            .map(area => ({
              coords: area.coords,
              color: area.color,
              type: 'scaled' as const
            }))
        ]
      })
    : null;

  // Create output layers
  const isResultView = ezState === 'RESULT_VIEW' && activeService === 'EZ';

  const emissionsOutputLayer = isResultView && isEmissionsMapVisible && emissionsMapData
    ? (() => {
        const points = getEmissionsPointsForPollutant(emissionsMapData, selectedPollutantType);
        if (points.length === 0) return null;
        return selectedVisualizationType === 'heatmap'
          ? createEmissionsHeatmapLayer({ data: points })
          : createEmissionsHexagonLayer({ data: points });
      })()
    : null;

  const peopleResponseOutputLayer = isResultView && isPeopleResponseMapVisible && peopleResponseMapData
    ? (() => {
        const points = getPeopleResponsePoints(peopleResponseMapData, selectedResponseLayerView, selectedBehavioralResponseType);
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

  return [
    editableLayer,
    simulationAreaEditableLayer,
    simulationAreaDisplayLayer,
    displayLayer,
    emissionsOutputLayer,
    peopleResponseOutputLayer,
    tripLegsOutputLayer
  ];
}
