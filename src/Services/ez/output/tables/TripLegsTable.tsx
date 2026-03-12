import { Table as AntTable, Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputTripLegsStore,
  type EZTripLegRecord,
} from '~stores/output';
import { useEZOutputFiltersStore } from '~stores/session';
import { fetchTripLegsPage } from '~ez/api';
import { SmartNumber } from '../components';
import outputStyles from '../Output.module.less';
import './locales';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Trip Performance Table - paginated with NC filter, control panel, and row selection
 * SSE Message: data_table_trip_legs (first page)
 * REST: GET /scenario/{requestId}/trip-legs?page={n}&pageSize={n}&excludeNC={bool}
 */
export const TripLegsTable = () => {
  const { t } = useTranslation('ez-output-tables');

  const tripLegRecords = useEZOutputTripLegsStore((state) => state.tripLegRecords);
  const pagination = useEZOutputTripLegsStore((state) => state.tripLegsPagination);
  const tableState = useEZOutputTripLegsStore((state) => state.tripLegsTableState);
  const error = useEZOutputTripLegsStore((state) => state.tripLegsTableError);
  const excludeNC = useEZOutputTripLegsStore((state) => state.excludeNC);
  const selectedTripIds = useEZOutputTripLegsStore((state) => state.selectedTripIds);
  const setExcludeNC = useEZOutputTripLegsStore((state) => state.setExcludeNC);
  const toggleTripSelection = useEZOutputTripLegsStore((state) => state.toggleTripSelection);
  const selectAllOnPage = useEZOutputTripLegsStore((state) => state.selectAllOnPage);
  const deselectAll = useEZOutputTripLegsStore((state) => state.deselectAll);

  const tripLegsViewMode = useEZOutputFiltersStore((s) => s.tripLegsViewMode);
  const setTripLegsViewMode = useEZOutputFiltersStore((s) => s.setTripLegsViewMode);

  if (!pagination) {
    return (
      <div className={outputStyles.paragraphSpinnerContainer}>
        <Spin size="default" tip={t('tripLegsTable.loadingTip')} />
      </div>
    );
  }

  const handleNCToggle = () => {
    const newExcludeNC = !excludeNC;
    setExcludeNC(newExcludeNC);
    fetchTripLegsPage(1, newExcludeNC);
  };

  const handlePageChange = (page: number) => {
    fetchTripLegsPage(page, excludeNC);
  };

  const columns = [
    {
      title: t('tripLegsTable.columns.personId'),
      dataIndex: 'personId',
      key: 'personId',
      width: 100,
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.personId.localeCompare(b.personId),
    },
    {
      title: t('tripLegsTable.columns.originActivity'),
      dataIndex: 'originActivity',
      key: 'originActivity',
      width: 120,
      render: (val: string) => capitalize(val),
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.originActivity.localeCompare(b.originActivity),
    },
    {
      title: t('tripLegsTable.columns.destinationActivity'),
      dataIndex: 'destinationActivity',
      key: 'destinationActivity',
      width: 120,
      render: (val: string) => capitalize(val),
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.destinationActivity.localeCompare(b.destinationActivity),
    },
    {
      title: t('tripLegsTable.columns.co2DeltaGrams'),
      dataIndex: 'co2DeltaGrams',
      key: 'co2DeltaGrams',
      width: 120,
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.co2DeltaGrams - b.co2DeltaGrams,
      render: (value: number) => (
        <span className={value < 0 ? outputStyles.positiveDelta : value > 0 ? outputStyles.negativeDelta : outputStyles.neutralDelta}>
          {value > 0 ? '+' : ''}<SmartNumber value={value} unitType="mass" />
        </span>
      ),
    },
    {
      title: t('tripLegsTable.columns.timeDeltaMinutes'),
      dataIndex: 'timeDeltaMinutes',
      key: 'timeDeltaMinutes',
      width: 120,
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.timeDeltaMinutes - b.timeDeltaMinutes,
      render: (value: number) => (
        <span className={value < 0 ? outputStyles.positiveDelta : value > 0 ? outputStyles.negativeDelta : outputStyles.neutralDelta}>
          {value > 0 ? '+' : ''}<SmartNumber value={value} unitType="time" decimals={1} />
        </span>
      ),
    },
    {
      title: t('tripLegsTable.columns.impact'),
      dataIndex: 'impact',
      key: 'impact',
      width: 150,
      sorter: (a: EZTripLegRecord, b: EZTripLegRecord) => a.impact.localeCompare(b.impact),
    },
  ];

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
              onClick={() => pagination && fetchTripLegsPage(pagination.currentPage, excludeNC)}
              loading={tableState === 'loading'}
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

      <div className={outputStyles.tableControlPanel}>
        <Button
          size="small"
          type={excludeNC ? 'default' : 'primary'}
          onClick={handleNCToggle}
        >
          {t('tripLegsTable.ncToggleLabel')}
        </Button>

        <div className={outputStyles.tableControlButtonRow}>
          <Button size="small" onClick={selectAllOnPage}>
            {t('tripLegsTable.selectAll')}
          </Button>
          <Button size="small" onClick={deselectAll} disabled={selectedTripIds.size === 0}>
            {t('tripLegsTable.deselectAll')}
          </Button>
        </div>

        <Button
          size="small"
          type={tripLegsViewMode !== 'hidden' ? 'primary' : 'default'}
          onClick={() => setTripLegsViewMode(tripLegsViewMode === 'hidden' ? 'baseline' : 'hidden')}
          disabled={selectedTripIds.size === 0}
        >
          {tripLegsViewMode !== 'hidden'
            ? t('tripLegsTable.viewModes.hideMap')
            : t('tripLegsTable.viewModes.showMap')}
        </Button>
      </div>

      <AntTable
        dataSource={tripLegRecords}
        columns={columns}
        loading={tableState === 'loading'}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.totalRecords,
          showSizeChanger: false,
          onChange: handlePageChange,
        }}
        size="small"
        className={outputStyles.legPerformanceTable}
        rowKey="legId"
        locale={{ emptyText: t('tripLegsTable.noData') }}
        onRow={(record) => ({
          onClick: () => toggleTripSelection(record.legId),
        })}
        rowClassName={(record) => {
          if (selectedTripIds.has(record.legId)) return outputStyles.visibleRow;
          if (record.impact === 'NC') return outputStyles.ncRow;
          return '';
        }}
      />
    </>
  );
};
