"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse bg-gray-200';
      case 'wave':
        return 'skeleton';
      case 'none':
        return 'bg-gray-200';
      default:
        return 'skeleton';
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1em' : '40px'),
  };

  return (
    <div
      className={`${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  );
};

// Astrologer Card Skeleton
export const AstrologerCardSkeleton: React.FC = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1">
        <Skeleton variant="text" height={20} className="mb-2" />
        <Skeleton variant="text" height={16} width="60%" className="mb-2" />
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={60} height={20} />
          <Skeleton variant="rounded" width={50} height={20} />
        </div>
      </div>
    </div>
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <Skeleton variant="text" height={14} width={80} />
        <Skeleton variant="text" height={14} width={100} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  </div>
);

// Transaction History Skeleton
export const TransactionSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton variant="text" height={16} className="mb-2" />
            <Skeleton variant="text" height={12} width="70%" />
          </div>
          <div className="text-right">
            <Skeleton variant="rounded" width={60} height={20} className="mb-2" />
            <Skeleton variant="text" height={18} width={80} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Call History Skeleton
export const CallHistorySkeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <Skeleton variant="text" height={16} className="mb-2" />
            <Skeleton variant="text" height={12} width="60%" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton variant="rounded" width={70} height={24} />
            <Skeleton variant="text" height={14} width={40} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Header Skeleton
export const HeaderSkeleton: React.FC = () => (
  <div className="bg-white shadow-sm border-b animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" height={24} width={120} />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="text" height={16} width={100} />
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
      </div>
    </div>
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <HeaderSkeleton />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <AstrologerCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

// List Skeleton with stagger effect
interface ListSkeletonProps {
  count?: number;
  ItemSkeleton: React.ComponentType;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  count = 5, 
  ItemSkeleton 
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        style={{ animationDelay: `${index * 0.1}s` }}
        className="animate-fadeIn"
      >
        <ItemSkeleton />
      </div>
    ))}
  </div>
);

// Filter Bar Skeleton
export const FilterBarSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
    <div className="flex flex-wrap gap-3">
      <Skeleton variant="rounded" width={120} height={36} />
      <Skeleton variant="rounded" width={100} height={36} />
      <Skeleton variant="rounded" width={80} height={36} />
      <Skeleton variant="rounded" width={90} height={36} />
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton variant="text" height={14} width={80} className="mb-2" />
        <Skeleton variant="text" height={24} width={60} />
      </div>
      <Skeleton variant="circular" width={48} height={48} />
    </div>
  </div>
);

// Modal Skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-pulse">
      <div className="text-center mb-6">
        <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-4" />
        <Skeleton variant="text" height={24} width="70%" className="mx-auto mb-2" />
        <Skeleton variant="text" height={16} width="90%" className="mx-auto" />
      </div>
      <div className="space-y-4 mb-6">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={48} />
      </div>
      <div className="flex gap-3">
        <Skeleton variant="rounded" height={40} className="flex-1" />
        <Skeleton variant="rounded" height={40} className="flex-1" />
      </div>
    </div>
  </div>
);

export default Skeleton; 