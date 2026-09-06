import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { HotelCardSkeleton } from './HotelCardSkeleton';

interface HotelListSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  isDark?: boolean;
}

export const HotelListSkeleton: React.FC<HotelListSkeletonProps> = ({
  count = 3,
  viewMode = 'grid',
  isDark = false,
}) => {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <SkeletonTheme
      baseColor={isDark ? '#1e293b' : '#e2e8f0'}
      highlightColor={isDark ? '#334155' : '#f8fafc'}
    >
      <div
        className={viewMode === 'list' ? 'hotel-cards-list-view' : 'hotel-cards-grid'}
        data-testid="hotel-list-skeleton"
      >
        {items.map((i) => (
          <HotelCardSkeleton key={`skeleton-item-${i}`} viewMode={viewMode} />
        ))}
      </div>
    </SkeletonTheme>
  );
};

export default HotelListSkeleton;
