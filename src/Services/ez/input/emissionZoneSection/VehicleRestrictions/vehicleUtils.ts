import { Vehicle, TimeBlock, TimeRange, VehicleTypeId, VEHICLE_TYPES } from './types';
import { Policy, PolicyTier } from '~stores/types';

export interface PolicyItem {
  vehicleType: VehicleTypeId;
  policyValues: 'free' | 'banned' | number[];
  operatingHours: [string, string];
}

export { VEHICLE_TYPES };

const policyToItem = (policy: Policy): PolicyItem => {
  const policyValues = policy.tier === 1 ? 'free' as const
    : policy.tier === 3 ? 'banned' as const
    : [policy.penalty || 0];

  return {
    vehicleType: policy.vehicleType,
    policyValues,
    operatingHours: policy.period
  };
};

const itemToPolicy = (item: PolicyItem): Policy => {
  const tier: PolicyTier = item.policyValues === 'free' ? 1
    : item.policyValues === 'banned' ? 3
    : 2;

  const penalty = Array.isArray(item.policyValues) ? item.policyValues[0] : undefined;
  const interval = tier === 2 ? 1800 : undefined;

  return {
    vehicleType: item.vehicleType,
    tier,
    period: item.operatingHours,
    ...(penalty !== undefined && { penalty }),
    ...(interval !== undefined && { interval })
  };
};

export const timeToColumn = (timeString: string): number => {
  if (!timeString) return 0;

  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours * 2) + (minutes >= 30 ? 1 : 0);
};

export const columnToTime = (column: number): string => {
  if (column < 0 || column >= 48) return '00:00';

  const hours = Math.floor(column / 2);
  const minutes = (column % 2) * 30;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const generateTimeLabels = (): string[] => {
  const labels: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      labels.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  return labels;
};

export const generateMergedHeaders = (): string[] => {
  const headers: string[] = [];
  for (let hour = 2; hour < 24; hour += 2) {
    headers.push(`${hour}h`);
  }
  return headers;
};

export const checkOverlap = (block1: TimeRange, block2: TimeRange): boolean => {
  return (
    (block1.start >= block2.start && block1.start < block2.end) ||
    (block1.end > block2.start && block1.end <= block2.end) ||
    (block1.start <= block2.start && block1.end >= block2.end)
  );
};

export const vehiclesToPolicy = (vehicles: Vehicle[]): Policy[] => {
  const items: PolicyItem[] = vehicles.flatMap(vehicle => {
    const blocks = vehicle.blocks || [];

    // If no blocks, vehicle is unrestricted
    if (blocks.length === 0) {
      return [{
        vehicleType: vehicle.type,
        policyValues: "free" as const,
        operatingHours: ["00:00", "23:59"] as [string, string]
      }];
    }

    // Convert ALL blocks to policy items
    return blocks.map(block => ({
      vehicleType: vehicle.type,
      policyValues: block.type === 'banned'
        ? "banned" as const
        : [block.penalty || 0],
      operatingHours: [
        columnToTime(block.start),
        columnToTime(block.end)
      ] as [string, string]
    }));
  });

  return items.map(itemToPolicy);
};

export const policyToVehicles = (policies: Policy[] | null | undefined): Vehicle[] => {
  if (!policies || !Array.isArray(policies)) return [];

  const items = policies.map(policyToItem);

  return items.map((item, index) => {
    const { vehicleType, policyValues, operatingHours = ["00:00", "23:59"] } = item;

    const vehicle: Vehicle = {
      id: index + 1,
      type: vehicleType,
      blocks: []
    };

    const start = timeToColumn(operatingHours[0] || "00:00");
    const end = timeToColumn(operatingHours[1] || "23:59");

    if (policyValues === "banned") {
      vehicle.blocks.push({
        id: 1,
        start,
        end,
        type: 'banned'
      });
    } else if (policyValues === "free") {
      // No blocks for free access
    } else if (Array.isArray(policyValues) && policyValues.length > 0) {
      vehicle.blocks.push({
        id: 1,
        start,
        end,
        type: 'restricted',
        penalty: policyValues[0],
        interval: 1800
      });
    }

    return vehicle;
  });
};

export const getBlockDescription = (block: TimeBlock | null): string => {
  if (!block) return '';

  const startTime = columnToTime(block.start);
  const endTime = columnToTime(block.end);

  if (block.type === 'banned') {
    return `Banned from ${startTime} to ${endTime}`;
  } else {
    return `Restricted from ${startTime} to ${endTime} | Penalty: ${block.penalty} every ${block.interval} seconds`;
  }
};
