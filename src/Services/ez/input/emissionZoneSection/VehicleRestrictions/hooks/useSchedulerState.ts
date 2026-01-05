import { useState, useEffect, useCallback } from 'react';
import { useAPIPayloadStore } from '~store';
import { vehiclesToPolicy, policyToVehicles } from '../vehicleUtils';
import { Vehicle, UseSchedulerStateParams, UseSchedulerStateReturn } from '../types';
import { VehicleTypeId, VEHICLE_TYPE_IDS } from '~ez/stores/types';

export const useSchedulerState = ({ zoneId }: UseSchedulerStateParams): UseSchedulerStateReturn => {
  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const updateZone = useAPIPayloadStore(state => state.updateZone);

  // Get current zone's policies
  const apiZone = apiZones.find(z => z.id === zoneId);
  const currentPolicies = apiZone?.policies || [];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (zoneId) {
      const defaultVehicles: Vehicle[] = VEHICLE_TYPE_IDS.map(type => ({
        type,
        blocks: []
      }));

      setVehicles(
        currentPolicies.length === 0
          ? defaultVehicles
          : policyToVehicles(currentPolicies)
      );
    }
  }, [zoneId, currentPolicies]);

  const syncVehiclesToPolicy = useCallback((updatedVehicles: Vehicle[]) => {
    if (zoneId) {
      updateZone(zoneId, { policies: vehiclesToPolicy(updatedVehicles) });
    }
  }, [zoneId, updateZone]);

  // Block update
  const updateBlock = useCallback((vehicleType: VehicleTypeId, blockId: number, updates: any) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.type !== vehicleType) return vehicle;

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
  const deleteBlock = useCallback((vehicleType: VehicleTypeId, blockId: number) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.type !== vehicleType) return vehicle;

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
  const addBlock = useCallback((vehicleType: VehicleTypeId, newBlock: any) => {
    setVehicles(prevVehicles => {
      const updatedVehicles = prevVehicles.map(vehicle => {
        if (vehicle.type !== vehicleType) return vehicle;

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
