import { useState, useRef, useCallback, useEffect } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ZoneCard from './ZoneCard';
import AddZoneCard from './AddZoneCard';
import containerStyles from './ZoneCardsContainer.module.less';
import { useAPIPayloadStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

const SCROLL_AMOUNT = 176 * 2;
const EDGE_THRESHOLD = 10;

const ZoneCardList = () => {
  const apiZones = useAPIPayloadStore(state => state.payload.zones);
  const sessionZones = useEZSessionStore(state => state.zones);
  const addZone = useAPIPayloadStore(state => state.addZone);
  const reorderZones = useAPIPayloadStore(state => state.reorderZones);
  const nextAvailableColor = useEZSessionStore(state => state.nextAvailableColor);

  const allZones = apiZones.filter(zone => sessionZones[zone.id]);
  const zonesCount = allZones.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const updateNavigationState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollLeft = container.scrollLeft;

    setShowPrev(scrollLeft > EDGE_THRESHOLD);
    setShowNext(maxScroll - scrollLeft > EDGE_THRESHOLD);
  }, []);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = direction === 'next'
      ? container.scrollLeft + SCROLL_AMOUNT
      : container.scrollLeft - SCROLL_AMOUNT;

    const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    setShowPrev(clampedScroll > EDGE_THRESHOLD);
    setShowNext(maxScroll - clampedScroll > EDGE_THRESHOLD);

    container.scrollTo({ left: clampedScroll, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(updateNavigationState);
    resizeObserver.observe(container);
    container.addEventListener('scrollend', updateNavigationState);

    updateNavigationState();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scrollend', updateNavigationState);
    };
  }, [updateNavigationState, zonesCount]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      reorderZones(active.id, over.id);
    }
    setActiveId(null);
  };
  const handleDragCancel = () => setActiveId(null);

  if (zonesCount < 2) return null;

  const zoneIds = allZones.map(zone => zone.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
    >
      <SortableContext items={zoneIds} strategy={horizontalListSortingStrategy}>
        <div className={containerStyles.container}>
          {showPrev && (
            <button
              className={`${containerStyles.navigationButton} ${containerStyles.prevButton}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scroll('prev');
              }}
            >
              <LeftOutlined />
            </button>
          )}

          <div ref={scrollRef} className={containerStyles.scrollContainer}>
            {allZones.map((zone) => (
              <ZoneCard key={zone.id} zoneId={zone.id} />
            ))}
            <AddZoneCard
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const color = nextAvailableColor();
                addZone(color);
              }}
              id="multi-zone-add-button"
            />
          </div>

          {showNext && (
            <button
              className={`${containerStyles.navigationButton} ${containerStyles.nextButton}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scroll('next');
              }}
            >
              <RightOutlined />
            </button>
          )}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeId ? <ZoneCard zoneId={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ZoneCardList;
