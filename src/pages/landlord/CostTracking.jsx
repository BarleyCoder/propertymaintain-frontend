import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';
import { triggerDataRefresh, useDataRefresh } from '../../utils/dataRefresh';

const CostTracking = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        propertyId: '',
        category: '',
        material: '',
        quantity: '',
        cost: '',
        description: ''
    });

    const fetchData = useCallback(async () => {
        try {
            const [propertiesResponse, costsResponse] = await Promise.all([
                API.get('/api/properties'),
                API.get('/api/costs')
            ]);
            setProperties(Array.isArray(propertiesResponse.data.properties) ? propertiesResponse.data.properties : []);
            setExpenses(Array.isArray(costsResponse.data.costs) ? costsResponse.data.costs : []);
        } catch (err) {
            console.error('Error fetching landlord cost data:', err);
            setProperties([]);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useDataRefresh(() => {
        fetchData();
    }, 'landlord');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.propertyId || !formData.category || !formData.material || !formData.cost) {
            setError('Please complete the required expense fields.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                propertyId: formData.propertyId,
                category: formData.category,
                itemName: formData.material,
                quantity: formData.quantity,
                amount: Number(formData.cost),
                description: formData.description || '',
                status: 'completed'
            };

            const response = await API.post('/api/costs', payload);
            if (response.data?.cost) {
                setExpenses((prev) => [response.data.cost, ...prev]);
            }
            triggerDataRefresh('landlord');
            setFormData({ propertyId: '', category: '', material: '', quantity: '', cost: '', description: '' });
        } catch (err) {
            console.error('Create cost error:', err);
            setError(err.response?.data?.message || 'Unable to record this cost.');
        } finally {
            setSaving(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const completedExpenses = expenses.filter((item) => item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingExpenses = expenses.filter((item) => item.status === 'pending' || item.status === 'in_progress').reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-red-100 text-red-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return String(status || 'completed').replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="hidden md:flex bg-[#f1f4fa] px-4 py-1 rounded-full border border-[#c1c6d6] items-center gap-2 min-w-[320px]">
                        <span className="material-symbols-outlined text-[#727785]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#727785]"
                            placeholder="Search expenses..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4fa]">
                            <span className="material-symbols-outlined text-[#414754]">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto space-y-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#181c20]">Maintenance Cost Tracking</h1>
                                <p className="text-sm text-[#414754]">Real-time expenditure overview for property maintenance.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c1c6d6] rounded-lg text-xs font-semibold text-[#414754] hover:bg-[#f1f4fa]">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#005bbf]/10 flex items-center justify-center text-[#005bbf]">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Total Expenses</p>
                                    <p className="text-xl font-bold text-[#181c20]">₦ {totalExpenses.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 font-bold">Current total</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Completed</p>
                                    <p className="text-xl font-bold text-[#181c20]">₦ {completedExpenses.toLocaleString()}</p>
                                    <div className="w-full bg-[#dfe3e8] h-1.5 rounded-full mt-1">
                                        <div
                                            className="bg-green-600 h-full rounded-full"
                                            style={{ width: `${totalExpenses > 0 ? (completedExpenses / totalExpenses) * 100 : 0}%` }}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">receipt_long</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Pending</p>
                                    <p className="text-xl font-bold text-[#181c20]">₦ {pendingExpenses.toLocaleString()}</p>
                                    <p className="text-xs text-red-500 font-bold">Action Required</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-[#181c20]">Monthly Spending Trends</h3>
                                    <select className="bg-[#f1f4fa] border-none rounded-lg text-xs py-1 px-3 focus:ring-1 focus:ring-[#005bbf]">
                                        <option>Last 6 Months</option>
                                        <option>Year to Date</option>
                                    </select>
                                </div>
                                {loading ? (
                                    <div className="flex items-center justify-center h-48 text-sm text-[#414754]">Loading maintenance costs...</div>
                                ) : expenses.length === 0 ? (
                                    <div className="flex items-center justify-center h-48 border border-dashed border-[#c1c6d6] rounded-lg text-sm text-[#414754] bg-[#f7f9ff]">
                                        No cost records yet.
                                    </div>
                                ) : (
                                    <div className="flex items-end justify-between gap-4 h-48 pb-4">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                                            const value = expenses
                                                .filter((item) => new Date(item.createdAt || Date.now()).getMonth() === index)
                                                .reduce((sum, item) => sum + Number(item.amount || 0), 0);
                                            const height = `${Math.min(100, Math.max(8, (value / Math.max(totalExpenses, 1)) * 100))}%`;
                                            return (
                                                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                                    <div
                                                        className="w-full bg-[#005bbf]/20 rounded-t-lg hover:bg-[#005bbf]/40 transition-all relative"
                                                        style={{ height }}>
                                                        <span className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-[#181c20] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                            ₦{Math.round(value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-[#414754]">{month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <h3 className="text-lg font-bold text-[#181c20] mb-6">Log New Expense</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Property</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none"
                                            name="propertyId"
                                            value={formData.propertyId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select property</option>
                                            {properties.map((property) => (
                                                <option key={property._id} value={property._id}>{property.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Category</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="plumbing">Plumbing</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="carpentry">Carpentry</option>
                                            <option value="roofing">Roofing</option>
                                            <option value="painting">Painting</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Material Used</label>
                                        <input
                                            className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none"
                                            name="material"
                                            placeholder="e.g. Industrial Paint"
                                            required
                                            type="text"
                                            value={formData.material}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Quantity</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none"
                                                name="quantity"
                                                placeholder="0"
                                                type="text"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Cost (₦)</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none"
                                                name="cost"
                                                placeholder="0.00"
                                                required
                                                type="number"
                                                min="0"
                                                value={formData.cost}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-lg border border-[#c1c6d6] text-sm focus:ring-2 focus:ring-[#005bbf]/20 focus:border-[#005bbf] outline-none resize-none"
                                            name="description"
                                            placeholder="Reference work order or location details..."
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {error && <p className="text-xs text-red-600">{error}</p>}
                                    <button
                                        className="w-full py-3 bg-[#005bbf] text-white font-bold rounded-lg hover:bg-[#004493] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        type="submit"
                                        disabled={saving}
                                    >
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        {saving ? 'Saving...' : 'Add Expense'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-[#c1c6d6] overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-[#c1c6d6] flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#181c20]">Expense History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Material</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Property</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Quantity</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {expenses.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-[#414754]">No cost records yet.</td>
                                            </tr>
                                        ) : (
                                            expenses.map((expense) => (
                                                <tr key={expense._id || expense.id} className="hover:bg-[#f7f9ff] transition-colors">
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{new Date(expense.createdAt || Date.now()).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-sm text-[#181c20] font-bold">{expense.itemName || 'Maintenance Cost'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{expense.propertyId?.name || 'Property'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#414754]">{expense.quantity || '—'}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-[#181c20]">₦ {Number(expense.amount || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(expense.status)}`}>
                                                            {formatStatus(expense.status || 'completed')}
                                                        </span>
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
        </div>
    );
};

export default CostTracking;