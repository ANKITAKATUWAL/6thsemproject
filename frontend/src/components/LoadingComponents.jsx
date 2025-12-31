import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingSkeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}></div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <LoadingSkeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <LoadingSkeleton width="w-32" />
          <LoadingSkeleton width="w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton width="w-full" />
        <LoadingSkeleton width="w-3/4" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-12 rounded-t-lg mb-4"></div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex space-x-4 mb-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} width="flex-1" height="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
};