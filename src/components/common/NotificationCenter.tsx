import React, { useState, useEffect } from 'react';
import { Notification } from '../../core/achievementTypes';
import { achievementService } from '../../services/achievementService';
import { useApp } from '../../context/AppContext';
import './NotificationCenter.css';

interface NotificationCenterProps {
  profileId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ profileId }) => {
  const { state } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [profileId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userNotifications = await achievementService.getNotifications(profileId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await achievementService.markNotificationAsRead(profileId, notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (notification: Notification): string => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'achievement':
        return '🏆';
      case 'goal_completed':
        return '✅';
      case 'milestone':
        return '🎯';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications yet</p>
                <small>You'll see achievements and milestones here</small>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="notification-icon-container">
                    <span className="notification-type-icon">
                      {getNotificationIcon(notification)}
                    </span>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="notification-unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="clear-all-button"
                onClick={() => {
                  notifications.forEach(n => {
                    if (!n.isRead) markAsRead(n.id);
                  });
                }}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;