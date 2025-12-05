import { Table as AntTable, Spin } from 'antd';
import {
  useEZOutputTripLegsStore,
  useEZOutputChartConfigStore,
  type EZTripLegRecord,
} from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { fetchTripLegsPage } from '../../api/tripLegsFetch';
import outputStyles from '../Output.module.less';

/**
 * Trip Legs Table - paginated table of individual trip legs
 * SSE Message: data_trip_legs_first_page (first page delivery)
 * REST: GET /api/simulation/{requestId}/trip-legs?page={n}&pageSize={n}
 */
export const Table = () => {
  const visibleTripLegIds = useEZOutputFiltersStore((state) => state.visibleTripLegIds);
  const toggleTripLegVisibility = useEZOutputFiltersStore((state) => state.toggleTripLegVisibility);

  const tripLegRecords = useEZOutputTripLegsStore((state) => state.tripLegRecords);
  const pagination = useEZOutputTripLegsStore((state) => state.tripLegsPagination);
  const isLoading = useEZOutputTripLegsStore((state) => state.isTripLegsLoading);

  const tableConfig = useEZOutputChartConfigStore((state) => state.tripLegsTableConfig);

  if (!pagination) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip="Loading trip legs data..." />
      </div>
    );
  }

  const columns = tableConfig.columns.map((col) => ({
    title: col.title,
    dataIndex: col.dataIndex,
    key: col.key,
    width: col.width,
    ...(col.isSortable && {
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => {
        const aVal = a[col.dataIndex as keyof EZTripLegRecord];
        const bVal = b[col.dataIndex as keyof EZTripLegRecord];
        return (aVal as number) - (bVal as number);
      },
      render: (value: number) => (
        <span className={value < 0 ? outputStyles.positiveDelta : value > 0 ? outputStyles.negativeDelta : outputStyles.neutralDelta}>
          {value > 0 ? '+' : ''}{value}
        </span>
      )
    })
  }));

  const handlePageChange = (page: number) => {
    fetchTripLegsPage(page);
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        Sample of individual trip legs showing the granular impact on emissions and travel time. Click column headers to sort or click a row to toggle visibility on map.
      </span>
      <AntTable
        dataSource={tripLegRecords}
        columns={columns}
        loading={isLoading}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.totalRecords,
          showSizeChanger: false,
          onChange: handlePageChange
        }}
        size="small"
        className={outputStyles.legPerformanceTable}
        rowKey="legId"
        onRow={(record) => ({
          onClick: () => toggleTripLegVisibility(record.legId),
          className: outputStyles.clickableRow
        })}
        rowClassName={(record) => visibleTripLegIds.has(record.legId) ? outputStyles.visibleRow : ''}
      />
    </>
  );
};
