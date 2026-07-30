import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../context/useAuth';
import LandlordSidebar from '../../components/LandlordSidebar';
import API from '../../utils/axios';

const Technicians = () => {
    const { user } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTechnicians = useCallback(async () => {
        try {
            const response = await API.get('/api/auth/users');
            const techs = response.data.users.filter(u => u.role === 'technician');
            setTechnicians(techs);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const filteredTechnicians = technicians.filter(t =>
        searchTerm === '' ||
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            placeholder="Search technicians..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                <h1 className="text-3xl font-bold text-[#181c20]">Technicians</h1>
                                <p className="text-sm text-[#414754]">Manage all registered technicians.</p>
                            </div>
                            <div className="bg-white border border-[#c1c6d6] rounded-xl px-4 py-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#005bbf]">engineering</span>
                                <span className="text-sm font-bold text-[#181c20]">{technicians.length} Total Technicians</span>
                            </div>
                        </div>

                        {/* Technicians Grid */}
                        {loading ? (
                            <div className="text-center py-12 text-[#414754]">Loading technicians...</div>
                        ) : filteredTechnicians.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-[#c1c6d6]">engineering</span>
                                <p className="text-[#414754] mt-2">No technicians found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTechnicians.map(tech => (
                                    <div key={tech.id} className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#005bbf] font-bold text-xl">
                                                    {tech.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#181c20]">{tech.full_name}</p>
                                                    <span className="text-xs font-semibold text-[#005bbf] bg-[#d8e2ff]/30 px-2 py-0.5 rounded">
                                                        Technician
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                Active
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t border-[#c1c6d6] pt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#727785] text-sm">mail</span>
                                                <span className="text-xs text-[#414754] truncate">{tech.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#727785] text-sm">call</span>
                                                <span className="text-xs text-[#414754]">{tech.phone_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Technicians;