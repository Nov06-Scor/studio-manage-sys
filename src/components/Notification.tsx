import { useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../store';

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const iconComponents = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export default function Notification() {
  const { notifications, removeNotification } = useNotificationStore();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!timersRef.current.has(notification.id)) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
          timersRef.current.delete(notification.id);
        }, 5000);
        timersRef.current.set(notification.id, timer);
      }
    });

    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [notifications, removeNotification]);

  const handleClose = (id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    removeNotification(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => {
        const Icon = iconComponents[notification.type];
        return (
          <div
            key={notification.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${notificationStyles[notification.type]} animate-in slide-in-from-right fade-in duration-300`}
          >
            <Icon size={20} className={iconStyles[notification.type]} />
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => handleClose(notification.id)}
              className="p-1 hover:bg-black/5 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
