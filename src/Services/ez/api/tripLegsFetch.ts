import axios from 'axios';
import { useEZSessionStore } from '~stores/session';
import { useEZOutputTripLegsStore, type EZTripLegRecord } from '~stores/output';
import { useEZServiceStore } from '~store';
import { getBackendUrl } from './config';

interface TripLegsPageResponse {
  records: EZTripLegRecord[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

// demo trip leg records for a specific page
const generateDemoTripLegsPage = (page: number, pageSize: number, totalRecords: number): EZTripLegRecord[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const records: EZTripLegRecord[] = [];

  const impacts = [
    'Car → Bus',
    'Car → Subway',
    'Car → Walking',
    'Car → Biking',
    'Rerouted',
    'Paid Penalty',
  ];

  const activities = ['Home', 'Work', 'Shop', 'Leisure', 'School', 'Other'];

  for (let i = startIndex; i < endIndex; i++) {
    const personId = `P${(1000 + i).toString()}`;
    records.push({
      legId: `leg_${i.toString().padStart(5, '0')}`,
      personId,
      originActivity: `A_${activities[Math.floor(Math.random() * activities.length)]}_${personId.slice(1)}`,
      destinationActivity: `A_${activities[Math.floor(Math.random() * activities.length)]}_${personId.slice(1)}`,
      co2DeltaGrams: Math.round((Math.random() - 0.4) * 500), // -200 to +300
      timeDeltaMinutes: Math.round((Math.random() - 0.2) * 20), // -4 to +16
      impact: impacts[Math.floor(Math.random() * impacts.length)],
    });
  }

  return records;
};

export const fetchTripLegsPage = async (page: number): Promise<void> => {
  const store = useEZOutputTripLegsStore.getState();
  const isDemoMode = !useEZServiceStore.getState().isEzBackendAlive;
  const pagination = store.tripLegsPagination;

  if (!pagination) {
    console.warn('[TripLegsFetch] No pagination info available');
    return;
  }

  if (pagination.currentPage === page && store.tripLegRecords.length > 0) {
    console.log('[TripLegsFetch] Already on page', page);
    return;
  }

  store.setTripLegsLoading(true);
  store.setTripLegsLoadError(null);

  try {
    if (isDemoMode) {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 300));
      const records = generateDemoTripLegsPage(page, pagination.pageSize, pagination.totalRecords);
      store.setTripLegsPage(page, records);
      console.log(`[TripLegsFetch] Demo page ${page} loaded with ${records.length} records`);
    } else {
      // Real mode
      const backendUrl = getBackendUrl();
      const requestId = useEZSessionStore.getState().requestId!;

      const response = await axios.get<TripLegsPageResponse>(
        `${backendUrl}/api/simulation/${requestId}/trip-legs`,
        {
          params: {
            page,
            pageSize: pagination.pageSize,
          },
        }
      );

      store.setTripLegsPage(page, response.data.records);
      console.log(`[TripLegsFetch] Page ${page} loaded with ${response.data.records.length} records`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trip legs page';
    console.error('[TripLegsFetch] Error:', message);
    store.setTripLegsLoadError(message);
  } finally {
    store.setTripLegsLoading(false);
  }
};
