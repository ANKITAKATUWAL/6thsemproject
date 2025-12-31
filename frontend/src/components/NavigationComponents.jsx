import React, { useState } from 'react';

export const DashboardNav = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  mobileBreakpoint = 'md'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className={`hidden ${mobileBreakpoint}:flex space-x-1 bg-gray-100 p-1 rounded-lg ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className={`${mobileBreakpoint}:hidden ${className}`}>
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-gray-100 p-3 rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center">
              {tabs.find(tab => tab.id === activeTab)?.icon && (
                <span className="mr-2">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </span>
              )}
              {tabs.find(tab => tab.id === activeTab)?.label}
            </span>
            <span className={`transform transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  `}
                >
                  {tab.icon && <span className="mr-3">{tab.icon}</span>}
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const DashboardHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};