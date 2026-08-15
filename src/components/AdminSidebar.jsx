import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const AdminSidebar = () => {
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
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div>
                    <span className="font-bold text-[#005bbf] text-lg">PropMaintain</span>
                    <p className="text-[10px] uppercase tracking-widest text-[#414754] font-bold">Admin</p>
                </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1 flex-1">
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/dashboard') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/dashboard"
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-xs font-semibold uppercase">Dashboard</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/users') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/users"
                >
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-xs font-semibold uppercase">Users</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/technician-verification') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/technician-verification"
                >
                    <span className="material-symbols-outlined">verified_user</span>
                    <span className="text-xs font-semibold uppercase">Technicians</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/properties') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/properties"
                >
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-xs font-semibold uppercase">Properties</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/maintenance') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/maintenance"
                >
                    <span className="material-symbols-outlined">build</span>
                    <span className="text-xs font-semibold uppercase">Maintenance</span>
                </Link>
                <Link
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${isActive('/admin/work-orders') ? 'bg-[#4d8efe] text-white font-bold' : 'text-[#414754] hover:bg-[#dfe3e8]/50'}`}
                    to="/admin/work-orders"
                >
                    <span className="material-symbols-outlined">assignment</span>
                    <span className="text-xs font-semibold uppercase">Work Orders</span>
                </Link>
            </nav>

            <div className="mt-auto border-t border-[#c1c6d6] pt-4">
                <button
                    className="flex items-center gap-4 p-4 text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-lg cursor-pointer w-full"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-xs font-semibold uppercase">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
