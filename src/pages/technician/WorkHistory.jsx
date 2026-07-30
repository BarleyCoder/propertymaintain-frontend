import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import TechnicianSidebar from '../../components/TechnicianSidebar';
import API from '../../utils/axios';

const WorkHistory = () => {
      const { user } = useAuth();
      const [workOrders, setWorkOrders] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('');

      const fetchWorkOrders = useCallback(async () => {
      try {
            const response = await API.get('/api/workorders/technician');
            setWorkOrders(response.data.workOrders);
            } catch (error) {
            console.error('Error fetching work orders:', error);
            } finally {
            setLoading(false);
            }
      }, []);

      useEffect(() => {
            fetchWorkOrders();
      }, [fetchWorkOrders]);

      const filteredOrders = workOrders.filter(w => {
            const matchSearch = searchTerm === '' ||
            `#WO-${w.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === '' || w.status === statusFilter;
            return matchSearch && matchStatus;
      });

      const getStatusBadge = (status) => {
      const badges = {
            assigned: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-amber-700',
            completed: 'bg-green-100 text-green-700',
            };
            return badges[status] || 'bg-gray-100 text-gray-700';
      };

      const formatStatus = (status) => {
            return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      };

      const stats = {
            total: workOrders.length,
            completed: workOrders.filter(w => w.status === 'completed').length,
            inProgress: workOrders.filter(w => w.status === 'in_progress').length,
      };

      return (
            <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <TechnicianSidebar />

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                  <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                        <div className="font-bold text-lg text-[#005bbf]">Work History</div>
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                              {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        </div>
                  </header>

                {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-[1280px] mx-auto space-y-6">

                        {/* Page Header */}
                        <div>
                              <h1 className="text-3xl font-bold text-[#181c20]">Work History</h1>
                              <p className="text-sm text-[#414754]">All your assigned and completed work orders.</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#d8e2ff] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#005bbf]">assignment</span>
                                    </div>
                                    <div>
                                          <p className="text-xs font-semibold text-[#414754] uppercase">Total Tasks</p>
                                          <p className="text-2xl font-bold text-[#181c20]">{stats.total}</p>
                                    </div>
                                    </div>
                              </div>
                              <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    </div>
                              <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                              </div>
                        </div>
                              <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-600">sync</span>
                                    </div>
                              <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase">In Progress</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                              </div>
                              </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-4 flex flex-wrap items-center gap-4">
                              <div className="flex-1 min-w-[240px]">
                                    <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#727785] text-lg">search</span>
                                    <input
                                          className="w-full border border-[#c1c6d6] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#005bbf] outline-none"
                                          placeholder="Search by ID or Category"
                                          type="text"
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                              </div>
                        </div>
                        <div className="w-full md:w-48">
                              <select
                                    className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 text-sm focus:border-[#005bbf] outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">All Statuses</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                              </select>
                        </div>
                        </div>

                        {/* Work Orders Table */}
                        <div className="bg-white border border-[#c1c6d6] rounded-xl overflow-hidden shadow-sm">
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                          <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                          <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Work Order ID</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Category</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Property</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Scheduled Date</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Action</th>
                                          </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                          {loading ? (
                                                <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                      Loading...
                                                </td>
                                                </tr>
                                          ) : filteredOrders.length === 0 ? (
                                                <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">
                                                      No work orders found.
                                                </td>
                                                </tr>
                                          ) : (
                                                filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                      <td className="px-6 py-4 font-bold text-[#005bbf] text-xs">#WO-{order.id}</td>
                                                      <td className="px-6 py-4 text-sm capitalize">{order.category}</td>
                                                      <td className="px-6 py-4 text-sm text-[#414754]">{order.property_name}</td>
                                                      <td className="px-6 py-4 text-sm text-[#414754]">
                                                            {new Date(order.scheduled_date).toLocaleDateString()}
                                                      </td>
                                                      <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                                            {formatStatus(order.status)}
                                                            </span>
                                                      </td>
                                                      <td className="px-6 py-4 text-right">
                                                            {order.status !== 'completed' ? (
                                                            <Link
                                                                  to={`/technician/update-work-order/${order.id}`}
                                                                  className="text-[#005bbf] text-xs font-bold hover:underline">
                                                                  Update
                                                            </Link>
                                                            ) : (
                                                            <span className="text-green-600 text-xs font-bold">Done ✓</span>
                                                            )}
                                                            </td>
                                                </tr>
                                                ))
                                          )}
                                    </tbody>
                                    </table>
                              </div>
                        </div>
                        </div>
                  </div>
            </div>
      );
};

export default WorkHistory;