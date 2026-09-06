import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface HotelCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const HotelCardSkeleton: React.FC<HotelCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="hotel-card horizontal-card skeleton-card" data-testid="hotel-card-skeleton-list">
        <div style={{ width: '300px', height: '100%', minHeight: '220px' }}>
          <Skeleton height="100%" borderRadius="18px 0 0 18px" />
        </div>
        <div className="horizontal-content-col" style={{ padding: '1.25rem 1.5rem', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={220} height={22} borderRadius={6} />
            <Skeleton width={80} height={16} borderRadius={4} />
          </div>
          <Skeleton width={260} height={14} borderRadius={4} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton width={90} height={24} borderRadius={6} />
            <Skeleton width={110} height={24} borderRadius={6} />
            <Skeleton width={90} height={24} borderRadius={6} />
          </div>
          <Skeleton height={46} borderRadius={10} />
        </div>
        <div className="horizontal-action-col" style={{ padding: '1.5rem', gap: '0.75rem' }}>
          <Skeleton width={90} height={14} borderRadius={4} />
          <Skeleton width={120} height={36} borderRadius={6} />
          <Skeleton width={130} height={40} borderRadius={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-card skeleton-card" data-testid="hotel-card-skeleton-grid">
      <Skeleton height={200} borderRadius="18px 18px 0 0" />
      <div className="hotel-card-body" style={{ gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={160} height={20} borderRadius={6} />
          <Skeleton width={70} height={16} borderRadius={4} />
        </div>
        <Skeleton width={190} height={14} borderRadius={4} />
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0' }}>
          <Skeleton width={80} height={22} borderRadius={6} />
          <Skeleton width={95} height={22} borderRadius={6} />
        </div>
        <Skeleton height={46} borderRadius={8} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          <Skeleton width={100} height={28} borderRadius={6} />
          <Skeleton width={105} height={36} borderRadius={8} />
        </div>
      </div>
    </div>
  );
};

export default HotelCardSkeleton;
