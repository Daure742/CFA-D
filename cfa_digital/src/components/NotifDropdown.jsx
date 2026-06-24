import { useContext } from 'react';
import { NotifContext } from '../context/notif-context.js';

export default function NotifDropdown() {
  const context = useContext(NotifContext);
  const notifications = context?.notifications || [];

  return (
    <button
      type="button"
      className="relative rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      title="Notifications"
    >
      Notifications
      {notifications.length > 0 && (
        <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
          {notifications.length}
        </span>
      )}
    </button>
  );
}
