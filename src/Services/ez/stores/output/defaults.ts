/** Output Static Store Defaults for chart  and table **/

import type {
  EZPeopleResponseChartConfig,
  EZTimeImpactChartConfig,
  EZEmissionsBarChartConfig,
  EZVehicleEmissionsChartConfig,
  EZTripLegsTableConfig,
} from './types';

export const DEFAULT_PEOPLE_RESPONSE_CHART_CONFIG: EZPeopleResponseChartConfig = {
  categoryIds: ['paidPenalty', 'rerouted', 'switchedToBus', 'switchedToSubway', 'switchedToWalking', 'switchedToBiking', 'cancelledTrip'],
  categoryLabels: ['Paid Penalty', 'Rerouted', 'Changed to Bus', 'Changed to Subway', 'Changed to Walking', 'Changed to Biking', 'Trip Cancelled'],
  categoryColors: ['#c9c9c9', '#ffd4a3', '#b8d4e8', '#a8c7dd', '#c8e6c9', '#b2dfb2', '#f5b7b1'],
};

export const DEFAULT_TIME_IMPACT_CHART_CONFIG: EZTimeImpactChartConfig = {
  categoryIds: ['paidPenalty', 'rerouted', 'switchedToBus', 'switchedToSubway', 'switchedToWalking', 'switchedToBiking'],
  categoryLabels: ['Paid Penalty', 'Rerouted', 'Changed to Bus', 'Changed to Subway', 'Changed to Walking', 'Changed to Biking'],
  categoryColors: ['#c9c9c9', '#ffd4a3', '#b8d4e8', '#a8c7dd', '#c8e6c9', '#b2dfb2'],
};

export const DEFAULT_EMISSIONS_BAR_CHART_CONFIG: EZEmissionsBarChartConfig = {
  pollutantIds: ['CO2', 'NOx', 'PM2.5', 'PM10'],
  pollutantLabels: ['CO₂', 'NOx', 'PM2.5', 'PM10'],
  baselineBarColor: '#d9cdc3',
  postPolicyBarColor: '#b2dfb2',
};

export const DEFAULT_VEHICLE_EMISSIONS_CHART_CONFIG: EZVehicleEmissionsChartConfig = {
  vehicleTypeIds: ['zero_emission', 'low_emission', 'high_emission'],
  vehicleTypeLabels: ['Zero Emission Vehicles', 'Low Emission Vehicles', 'High Emission Vehicles'],
  vehicleTypeColors: ['#b2dfb2', '#b8d4e8', '#d9cdc3'],
};

export const DEFAULT_TRIP_LEGS_TABLE_CONFIG: EZTripLegsTableConfig = {
  columns: [
    { title: 'Person ID', dataIndex: 'personId', key: 'personId', width: 120 },
    { title: 'From Activity', dataIndex: 'originActivity', key: 'originActivity', width: 150 },
    { title: 'To Activity', dataIndex: 'destinationActivity', key: 'destinationActivity', width: 150 },
    { title: 'CO₂ Δ (g)', dataIndex: 'co2DeltaGrams', key: 'co2DeltaGrams', width: 120, isSortable: true },
    { title: 'Time Δ (min)', dataIndex: 'timeDeltaMinutes', key: 'timeDeltaMinutes', width: 120, isSortable: true },
    { title: 'Impact', dataIndex: 'impact', key: 'impact', width: 150 },
  ],
};
