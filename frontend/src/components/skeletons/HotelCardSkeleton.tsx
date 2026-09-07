import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface HotelCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

/**
 * Loading skeleton component mirroring both Grid and List view layouts responsively.
 */
export const HotelCardSkeleton: React.FC<HotelCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="hotel-card horizontal-card skeleton-card" data-testid="hotel-card-skeleton-list">
        <div className="horizontal-img-wrap">
          <Skeleton height="100%" style={{ minHeight: '130px' }} />
        </div>
        <div className="horizontal-content-col" style={{ padding: '0.85rem 1rem', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width={180} height={20} borderRadius={6} />
            <Skeleton width={60} height={14} borderRadius={4} />
          </div>
          <Skeleton width={140} height={12} borderRadius={4} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Skeleton width={75} height={20} borderRadius={4} />
            <Skeleton width={85} height={20} borderRadius={4} />
          </div>
          <Skeleton height={32} borderRadius={8} />
        </div>
        <div className="horizontal-action-col">
          <Skeleton width={90} height={24} borderRadius={6} />
          <Skeleton width={80} height={32} borderRadius={8} />
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
