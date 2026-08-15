import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const LandlordSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 z-40 p-4 gap-2 bg-[#f1f4fa] border-r border-[#c1c6d6]">
            <div className="flex items-center gap-3 px-2 py-4">
                <div className="w-10 h-10 rounded-lg bg-[#005bbf] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">business_center</span>
                </div>
                <div>
                    <span className="font-bold text-[#005bbf] text-lg">PropMaintain</span>
                    <p className="text-[10px] uppercase tracking-widest text-[#414754] font-bold">Management</p>
                </div>
            </div>

            <button className="mb-4 flex items-center justify-center gap-2 bg-[#005bbf] text-white py-3 px-4 rounded-lg font-bold text-xs hover:bg-[#004493] transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                New Work Order
            </button>

            <nav className="flex flex-col gap-1 flex-1">
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/dashboard') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/dashboard">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-xs font-semibold uppercase">Dashboard</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/requests') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/requests">
                    <span className="material-symbols-outlined">inbox</span>
                    <span className="text-xs font-semibold uppercase">Requests</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/assign-technician') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/assign-technician">
                    <span className="material-symbols-outlined">person_add</span>
                    <span className="text-xs font-semibold uppercase">Assign Technician</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/work-orders') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/work-orders">
                    <span className="material-symbols-outlined">task</span>
                    <span className="text-xs font-semibold uppercase">Work Orders</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/cost-tracking') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/cost-tracking">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="text-xs font-semibold uppercase">Cost Tracking</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/reports') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/reports">
                    <span className="material-symbols-outlined">analytics</span>
                    <span className="text-xs font-semibold uppercase">Reports</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/landlord/technicians') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/landlord/technicians">
                    <span className="material-symbols-outlined">engineering</span>
                    <span className="text-xs font-semibold uppercase">Technicians</span>
                </Link>
            </nav>

            <div className="mt-auto border-t border-[#c1c6d6] pt-4">
                <button
                    className="flex items-center gap-4 p-4 text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-lg cursor-pointer w-full"
                    onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-xs font-semibold uppercase">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default LandlordSidebar;