import React from 'react';

export const DashboardCard = ({
  children,
  className = '',
  hover = true,
  shadow = 'shadow-md',
  padding = 'p-6'
}) => {
  return (
    <div className={`
      bg-white rounded-xl border border-gray-100
      ${shadow} ${padding}
      ${hover ? 'hover:shadow-lg transition-all duration-200 hover:-translate-y-1' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'text-green-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: 'text-red-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      icon: 'text-yellow-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      icon: 'text-purple-500'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <DashboardCard className={`${colors.bg} ${colors.border} border-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            {icon && <span className={`text-2xl ${colors.icon}`}>{icon}</span>}
          </div>
          <div className="flex items-baseline space-x-2">
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {trend && trendValue && (
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? '↗' : '↘'} {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export const AppointmentCard = ({
  appointment,
  onStatusUpdate,
  showActions = true,
  className = ''
}) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'border-l-yellow-500';
      case 'ACCEPTED': return 'border-l-green-500';
      case 'REJECTED': return 'border-l-red-500';
      case 'CANCELLED': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <DashboardCard className={`border-l-4 ${getStatusColor(appointment.status)} ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {appointment.patient?.name || appointment.doctor?.user?.name}
              </h3>
              <p className="text-sm text-gray-600">
                {appointment.patient?.email || appointment.doctor?.user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📅</span>
              {new Date(appointment.appointmentDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">🕐</span>
              {appointment.time}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">💰</span>
              ${appointment.doctor?.fee || 'N/A'}
            </div>
          </div>

          {appointment.reason && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {appointment.reason}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
              appointment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {appointment.status === 'PENDING' && '⏳ '}
              {appointment.status === 'ACCEPTED' && '✅ '}
              {appointment.status === 'REJECTED' && '❌ '}
              {appointment.status === 'CANCELLED' && '🚫 '}
              {appointment.status}
            </span>

            {showActions && appointment.status === 'PENDING' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'ACCEPTED')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'REJECTED')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};