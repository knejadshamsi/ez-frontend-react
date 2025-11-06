import { useState, useEffect, useCallback } from 'react';
import { useAPIPayloadStore } from '~store';
import { vehiclesToPolicy, policyToVehicles } from '../vehicleUtils';
import { Vehicle, UseSchedulerStateParams, UseSchedulerStateReturn } from '../types';

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 1, type: 'ev', blocks: [] },
  { id: 2, type: 'veh', blocks: [] },
  { id: 3, type: 'h_veh', blocks: [] }
];

export const useSchedulerState = ({ zoneId }: UseSchedulerStateParams): UseSchedulerStateReturn => {
  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const updateZone = useAPIPayloadStore(state => state.updateZone);

  // Get current zone's policies
  const apiZone = apiZones.find(z => z.id === zoneId);
  const currentPolicies = apiZone?.policies || [];

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (currentPolicies.length === 0) {
      return DEFAULT_VEHICLES;
    }
    return policyToVehicles(currentPolicies);
  });

  useEffect(() => {
    if (zoneId) {
      if (currentPolicies.length === 0) {
        setVehicles(DEFAULT_VEHICLES);
      } else {
        setVehicles(policyToVehicles(currentPolicies));
      }
    }
  }, [zoneId]);

  const syncVehiclesToPolicy = useCallback((updatedVehicles: Vehicle[]) => {
    if (zoneId) {
      updateZone(zoneId, { policies: vehiclesToPolicy(updatedVehicles) });
    }
  }, [zoneId, updateZone]);

  // Block update
  const updateBlock = useCallback((vehicleId: number, blockId: number, updates: any) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.id !== vehicleId) return vehicle;

        return {
          ...vehicle,
          blocks: vehicle.blocks.map(block => {
            if (block.id !== blockId) return block;
            return { ...block, ...updates };
          })
        };
      });

      syncVehiclesToPolicy(updatedVehicles);
      return updatedVehicles;
    });
  }, [syncVehiclesToPolicy]);

  // Block delete
  const deleteBlock = useCallback((vehicleId: number, blockId: number) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.id !== vehicleId) return vehicle;

        return {
          ...vehicle,
          blocks: vehicle.blocks.filter(block => block.id !== blockId)
        };
      });

      syncVehiclesToPolicy(updatedVehicles);
      return updatedVehicles;
    });
  }, [syncVehiclesToPolicy]);

  // Add new block
  const addBlock = useCallback((vehicleId: number, newBlock: any) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.id !== vehicleId) return vehicle;

        return {
          ...vehicle,
          blocks: [...vehicle.blocks, newBlock]
        };
      });

      syncVehiclesToPolicy(updatedVehicles);
      return updatedVehicles;
    });
  }, [syncVehiclesToPolicy]);

  return {
    vehicles,
    updateBlock,
    deleteBlock,
    addBlock,
    syncVehiclesToPolicy,
    setVehicles
  };
};
