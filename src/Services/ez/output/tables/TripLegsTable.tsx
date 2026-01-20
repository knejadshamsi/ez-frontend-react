import { Table as AntTable, Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputTripLegsStore,
  useEZOutputChartConfigStore,
  type EZTripLegRecord,
} from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { fetchTripLegsPage } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

/**
 * Trip Legs Table - paginated table of individual trip legs
 * SSE Message: data_table_trip_legs (first page delivery)
 * REST: GET /api/simulation/{requestId}/trip-legs?page={n}&pageSize={n}
 */
export const TripLegsTable = () => {
  const { t } = useTranslation('ez-output-tables');
  const visibleTripLegIds = useEZOutputFiltersStore((state) => state.visibleTripLegIds);
  const toggleTripLegVisibility = useEZOutputFiltersStore((state) => state.toggleTripLegVisibility);

  const tripLegRecords = useEZOutputTripLegsStore((state) => state.tripLegRecords);
  const pagination = useEZOutputTripLegsStore((state) => state.tripLegsPagination);
  const state = useEZOutputTripLegsStore((state) => state.tripLegsTableState);
  const error = useEZOutputTripLegsStore((state) => state.tripLegsTableError);

  const tableConfig = useEZOutputChartConfigStore((state) => state.tripLegsTableConfig);

  if (!pagination) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="default" tip={t('tripLegsTable.loadingTip')} />
      </div>
    );
  }

  const columns = tableConfig.columns.map((col) => ({
    title: t(`tripLegsTable.columns.${col.dataIndex}`),
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

  const handleRetry = () => {
    if (pagination) {
      fetchTripLegsPage(pagination.currentPage);
    }
  };

  return (
    <>
      {error && (
        <Alert
          message={t('tripLegsTable.error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={handleRetry}
              loading={state === 'loading'}
            >
              {t('tripLegsTable.retry')}
            </Button>
          }
          className={outputStyles.tripLegsErrorAlert}
        />
      )}

      <span className={outputStyles.chartDescription}>
        {t('tripLegsTable.description')}
      </span>
      <AntTable
        dataSource={tripLegRecords}
        columns={columns}
        loading={state === 'loading'}
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
