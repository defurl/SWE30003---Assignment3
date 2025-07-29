import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { XIcon, CheckIcon, BellIcon } from '../components/common/Icons';

const NotificationCenter = () => {
  const { 
    notifications, 
    loading, 
    error, 
    refetch 
  } = useNotifications();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    return '🔔';
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'delivery':
        return 'bg-orange-100 text-orange-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-slate-100 min-h-screen">
        <div className="container mx-auto px-6 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">Notifications Center ({notifications.length})</h1>
            </div>
          </div>
          
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>Error loading notifications: {error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                You're all caught up! No unread notifications.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white p-6 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                  !notification.isRead 
                    ? 'border-l-blue-500 bg-blue-50' 
                    : 'border-l-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;
