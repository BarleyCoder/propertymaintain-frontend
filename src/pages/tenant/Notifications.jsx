import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import TenantSidebar from '../../components/Sidebar';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const Notifications = () => {
      const { user } = useAuth();
      const [notifications, setNotifications] = useState([]);
      const [loading, setLoading] = useState(true);

      const fetchNotifications = useCallback(async () => {
            try {
                  const response = await API.get('/api/notifications');
                  setNotifications(response.data.notifications);
            } catch (error) {
                  console.error('Error fetching notifications:', error);
            } finally {
                  setLoading(false);
            }
      }, []);

      useEffect(() => {
            fetchNotifications();
      }, [fetchNotifications]);

      useDataRefresh(() => {
            fetchNotifications();
      }, 'tenant');

      const markAsRead = async (id) => {
            try {
                  await API.put(`/api/notifications/${id}/read`);
                  triggerDataRefresh('tenant');
                  fetchNotifications();
            } catch (error) {
                  console.error('Error marking notification as read:', error);
            }
      };

      const markAllAsRead = async () => {
            try {
                  await API.put('/api/notifications/read-all');
                  triggerDataRefresh('tenant');
                  fetchNotifications();
            } catch (error) {
                  console.error('Error marking all as read:', error);
            }
      };

      const deleteNotification = async (id) => {
            try {
                  await API.delete(`/api/notifications/${id}`);
                  triggerDataRefresh('tenant');
                  fetchNotifications();
            } catch (error) {
                  console.error('Error deleting notification:', error);
            }
      };

      const unreadCount = notifications.filter(n => !n.is_read).length;

      return (
            <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
                  <TenantSidebar />

                  <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                        {/* Top Navbar */}
                        <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                              <div className="font-bold text-lg text-[#005bbf]">Notifications</div>
                              <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                                          {user?.full_name?.charAt(0).toUpperCase()}
                                    </div>
                              </div>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                              <div className="max-w-3xl mx-auto space-y-6">

                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                          <div>
                                                <h1 className="text-3xl font-bold text-[#181c20]">Notifications</h1>
                                                <p className="text-sm text-[#414754]">
                                                      You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                                </p>
                                          </div>
                                          {unreadCount > 0 && (
                                                <button
                                                      className="text-[#005bbf] font-bold text-xs hover:underline"
                                                      onClick={markAllAsRead}>
                                                      Mark all as read
                                                </button>
                                          )}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="bg-white border border-[#c1c6d6] rounded-xl shadow-sm overflow-hidden">
                                          {loading ? (
                                                <div className="p-8 text-center text-[#414754]">Loading notifications...</div>
                                          ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                      <span className="material-symbols-outlined text-5xl text-[#c1c6d6]">notifications_off</span>
                                                      <p className="text-[#414754] mt-2">No notifications yet.</p>
                                                </div>
                                          ) : (
                                                <div className="divide-y divide-[#c1c6d6]">
                                                      {notifications.map(notification => (
                                                            <div
                                                                  key={notification.id}
                                                                  className={`flex items-start gap-4 p-4 hover:bg-[#f7f9ff] transition-colors ${!notification.is_read ? 'bg-[#f1f4fa]' : ''}`}>
                                                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.is_read ? 'bg-[#005bbf]' : 'bg-[#c1c6d6]'}`}></div>
                                                                  <div className="flex-1">
                                                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-[#181c20]' : 'text-[#414754]'}`}>
                                                                              {notification.message}
                                                                        </p>
                                                                        <p className="text-xs text-[#727785] mt-1">
                                                                              {new Date(notification.created_at).toLocaleString()}
                                                                        </p>
                                                                  </div>
                                                                  <div className="flex items-center gap-2">
                                                                        {!notification.is_read && (
                                                                              <button
                                                                                    className="text-[#005bbf] text-xs font-bold hover:underline"
                                                                                    onClick={() => markAsRead(notification.id)}>
                                                                                    Mark read
                                                                              </button>
                                                                        )}
                                                                        <button
                                                                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                                              onClick={() => deleteNotification(notification.id)}>
                                                                              <span className="material-symbols-outlined text-sm">delete</span>
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Notifications;