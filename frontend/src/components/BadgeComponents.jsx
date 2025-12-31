import React from 'react';

export const StatusBadge = ({ status, className = '', animated = false }) => {
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '⏳',
          label: 'Pending'
        };
      case 'ACCEPTED':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '✅',
          label: 'Accepted'
        };
      case 'REJECTED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: '❌',
          label: 'Rejected'
        };
      case 'CANCELLED':
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: '🚫',
          label: 'Cancelled'
        };
      case 'APPROVED':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '✓',
          label: 'Approved'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: '❓',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      border ${config.bgColor} ${config.borderColor} ${config.textColor}
      ${animated ? 'transition-all duration-200 hover:scale-105' : ''}
      ${className}
    `}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: '🔴',
          label: 'High'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '🟡',
          label: 'Medium'
        };
      case 'low':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '🟢',
          label: 'Low'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: '⚪',
          label: priority || 'Normal'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      border ${config.bgColor} ${config.borderColor} ${config.textColor}
      ${className}
    `}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export const RoleBadge = ({ role, className = '' }) => {
  const getRoleConfig = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          icon: '👑',
          label: 'Admin'
        };
      case 'DOCTOR':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: '👨‍⚕️',
          label: 'Doctor'
        };
      case 'PATIENT':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '👤',
          label: 'Patient'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: '❓',
          label: role || 'Unknown'
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      border ${config.bgColor} ${config.borderColor} ${config.textColor}
      ${className}
    `}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};