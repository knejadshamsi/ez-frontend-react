import { useRef } from 'react';
import { Popover } from 'antd';
import { useEZSessionStore } from '~stores/session';
import { colorShader, HIDDEN_COLOR } from '~ez/utils/colorUtils';
import BlockEditor from './BlockEditor';
import { TimeHeader, VehicleRow } from './SchedulerGrid';
import { useSchedulerState } from './hooks/useSchedulerState';
import { useBlockInteractions } from './hooks/useBlockInteractions';
import { useContainerResize } from './hooks/useContainerResize';
import { HEADER_HEIGHT, ROW_HEIGHT, VEHICLE_COLUMN_WIDTH, TIME_COLUMNS } from './constants';
import { PolicySectionProps } from './types';
import styles from '../zoneSettings/zoneSettings.module.less';

const PolicySection = ({ zoneId }: PolicySectionProps) => {
  const sessionZones = useEZSessionStore(state => state.zones);
  const sessionZone = sessionZones[zoneId];
  const zoneColor = sessionZone?.color || '#CCCCCC';
  const isZoneHidden = sessionZone?.hidden || false;

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { vehicles, updateBlock, deleteBlock, setVehicles, syncVehiclesToPolicy } = useSchedulerState({ zoneId });

  const totalHeight = HEADER_HEIGHT + (vehicles.length * ROW_HEIGHT);
  const { containerSize } = useContainerResize({
    containerRef,
    totalHeight,
    vehicleCount: vehicles.length,
    zoneId
  });

  const timeColumnWidth = (containerSize.width - VEHICLE_COLUMN_WIDTH) / TIME_COLUMNS;

  const {
    selectedVehicleId,
    setSelectedVehicleId,
    selectedBlockId,
    setSelectedBlockId,
    showBlockEditor,
    setShowBlockEditor,
    blockEditorPosition,
    activeBlock,
    handleBlockDoubleClick,
    handleGridDoubleClick,
    handleBlockMouseDown
  } = useBlockInteractions({
    vehicles,
    setVehicles,
    syncVehiclesToPolicy,
    timeColumnWidth,
    svgRef,
    vehicleColumnWidth: VEHICLE_COLUMN_WIDTH,
    headerHeight: HEADER_HEIGHT,
    rowHeight: ROW_HEIGHT
  });

  const handleDeleteBlock = (vehicleId: number, blockId: number) => {
    deleteBlock(vehicleId, blockId);
    setShowBlockEditor(false);
    setSelectedBlockId(null);
  };

  return (
    <div
      className={styles.sectionContainer}
      style={{
        backgroundColor: isZoneHidden
          ? colorShader(HIDDEN_COLOR, 1.85)
          : (zoneColor ? colorShader(zoneColor, 1.85) : undefined),
        border: `1px solid ${isZoneHidden
          ? colorShader(HIDDEN_COLOR, 1.75)
          : (zoneColor ? colorShader(zoneColor, 1.75) : undefined)}`,
        opacity: isZoneHidden ? 0.6 : 1,
        pointerEvents: isZoneHidden ? 'none' : 'auto'
      }}
    >
      <span className={styles.sectionHeader}>
        <strong>RESTRICTIONS</strong>
      </span>

      <div className={styles.schedulerContainer}>
        <div className={styles.boundariesText}>
          Double-click to add restrictions. Click icon to edit, drag edges to resize, drag center to move.
        </div>

        <div className={styles.svgGrid} ref={containerRef}>
          <svg
            ref={svgRef}
            width={containerSize.width}
            height={totalHeight}
            className="overflow-visible"
          >
            <TimeHeader
              containerWidth={containerSize.width}
              timeColumnWidth={timeColumnWidth}
              zoneColor={zoneColor}
            />

            {vehicles.map((vehicle, rowIndex) => (
              <VehicleRow
                key={`vehicle-${vehicle.id}`}
                vehicle={vehicle}
                rowIndex={rowIndex}
                containerWidth={containerSize.width}
                timeColumnWidth={timeColumnWidth}
                zoneColor={zoneColor}
                selectedVehicleId={selectedVehicleId}
                selectedBlockId={selectedBlockId}
                onVehicleClick={setSelectedVehicleId}
                onGridDoubleClick={handleGridDoubleClick}
                onBlockMouseDown={handleBlockMouseDown}
                onBlockDoubleClick={handleBlockDoubleClick}
              />
            ))}
          </svg>
        </div>

        {showBlockEditor && activeBlock && (
          <Popover
            content={
              <BlockEditor
                activeBlock={activeBlock}
                onUpdate={updateBlock}
                onDelete={handleDeleteBlock}
                onClose={() => setShowBlockEditor(false)}
              />
            }
            trigger="click"
            open={showBlockEditor}
            onOpenChange={(visible) => {
              if (!visible) setShowBlockEditor(false);
            }}
            placement="bottom"
            overlayStyle={{}}
            overlayClassName="block-editor-popover"
            arrow={false}
            destroyTooltipOnHide={{ keepParent: false }}
          >
            <div
              style={{
                position: 'fixed',
                left: `${blockEditorPosition.x}px`,
                top: `${blockEditorPosition.y}px`,
                width: '1px',
                height: '1px',
                pointerEvents: 'none'
              }}
            />
          </Popover>
        )}
      </div>
    </div>
  );
};

export default PolicySection;
