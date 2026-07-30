import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const CostTracking = () => {
    const { user } = useAuth();
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        material: '',
        quantity: '',
        cost: '',
        description: ''
    });
    const [expenses, setExpenses] = useState([
        { id: 1, date: '2024-10-24', material: 'LED Panel 12W x 20', quantity: '20 Units', amount: 85000, status: 'completed' },
        { id: 2, date: '2024-10-22', material: 'Polyurethane Sealant', quantity: '5 Gallons', amount: 120450, status: 'in_progress' },
        { id: 3, date: '2024-10-21', material: 'Compressor Spare Parts', quantity: '1 Set', amount: 345000, status: 'pending' },
        { id: 4, date: '2024-10-19', material: 'PVC Conduit Pipes 20mm', quantity: '50 Pipes', amount: 42500, status: 'completed' },
    ]);

    const fetchWorkOrders = useCallback(async () => {
        try {
            const response = await API.get('/api/workorders/landlord');
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newExpense = {
            id: expenses.length + 1,
            date: new Date().toISOString().split('T')[0],
            material: formData.material,
            quantity: formData.quantity,
            amount: parseFloat(formData.cost),
            status: 'pending'
        };
        setExpenses([newExpense, ...expenses]);
        setFormData({ material: '', quantity: '', cost: '', description: '' });
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const completedExpenses = expenses.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-red-100 text-red-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9ff]">
            <LandlordSidebar />

            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1280px] mx-auto space-y-6">

                        {/* Page Header */}
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

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-[#c1c6d6] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#005bbf]/10 flex items-center justify-center text-[#005bbf]">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#414754] uppercase tracking-wider">Total Expenses</p>
                                    <p className="text-xl font-bold text-[#181c20]">₦ {totalExpenses.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 font-bold">This Month</p>
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

                        {/* Form and Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Spending Chart */}
                            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-[#181c20]">Monthly Spending Trends</h3>
                                    <select className="bg-[#f1f4fa] border-none rounded-lg text-xs py-1 px-3 focus:ring-1 focus:ring-[#005bbf]">
                                        <option>Last 6 Months</option>
                                        <option>Year to Date</option>
                                    </select>
                                </div>
                                <div className="flex items-end justify-between gap-4 h-48 pb-4">
                                    {[
                                        { month: 'Mar', height: '40%', amount: '₦450k' },
                                        { month: 'Apr', height: '60%', amount: '₦680k' },
                                        { month: 'May', height: '45%', amount: '₦520k' },
                                        { month: 'Jun', height: '85%', amount: '₦890k' },
                                        { month: 'Jul', height: '55%', amount: '₦710k' },
                                        { month: 'Aug', height: '75%', amount: '₦950k' },
                                    ].map((bar, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div
                                                className="w-full bg-[#005bbf]/20 rounded-t-lg hover:bg-[#005bbf]/40 transition-all relative"
                                                style={{ height: bar.height }}>
                                                <span className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-[#181c20] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                    {bar.amount}
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#414754]">{bar.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Log Expense Form */}
                            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c1c6d6] shadow-sm">
                                <h3 className="text-lg font-bold text-[#181c20] mb-6">Log New Expense</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
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
                                                required
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
                                            onChange={handleChange}>
                                        </textarea>
                                    </div>
                                    <button
                                        className="w-full py-3 bg-[#005bbf] text-white font-bold rounded-lg hover:bg-[#004493] transition-all flex items-center justify-center gap-2"
                                        type="submit">
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Add Expense
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Expense History Table */}
                        <div className="bg-white rounded-xl border border-[#c1c6d6] overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-[#c1c6d6] flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#181c20]">Expense History</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded hover:bg-[#f1f4fa]">
                                        <span className="material-symbols-outlined text-[#414754]">filter_list</span>
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f1f4fa] border-b border-[#c1c6d6]">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Materials</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Quantity</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Amount</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#414754] uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c1c6d6]">
                                        {expenses.map(expense => (
                                            <tr key={expense.id} className="hover:bg-[#f7f9ff] transition-colors group">
                                                <td className="px-6 py-4 text-sm text-[#414754]">{expense.date}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-[#181c20]">{expense.material}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#414754]">{expense.quantity}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-[#181c20]">₦ {expense.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(expense.status)}`}>
                                                        {formatStatus(expense.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[#005bbf] text-xs font-bold hover:underline">View</button>
                                                        <button className="text-[#414754] text-xs font-bold hover:underline">Edit</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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