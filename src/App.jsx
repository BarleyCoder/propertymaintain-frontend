import Profile from './pages/Profile';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from "./pages/LandingPage";

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// Tenant Pages
import TenantDashboard from './pages/tenant/Dashboard';
import SubmitRequest from './pages/tenant/SubmitRequest';
import MyRequests from './pages/tenant/MyRequests';
import RequestDetails from './pages/tenant/RequestDetails';
import Notifications from './pages/tenant/Notifications';

// Landlord Pages
import LandlordDashboard from './pages/landlord/Dashboard';
import LandlordRequests from './pages/landlord/Requests';
import AssignTechnician from './pages/landlord/AssignTechnician';
import WorkOrders from './pages/landlord/WorkOrders';
import CostTracking from './pages/landlord/CostTracking';
import Reports from './pages/landlord/Reports';
import Technicians from './pages/landlord/Technicians';

// Technician Pages
import TechnicianDashboard from './pages/technician/Dashboard';
import AssignedTasks from './pages/technician/AssignedTasks';
import UpdateWorkOrder from './pages/technician/UpdateWorkOrder';
import WorkHistory from './pages/technician/WorkHistory';
import TechnicianProfileSetup from './pages/technician/TechnicianProfileSetup';
import TechnicianVerification from './pages/admin/TechnicianVerification';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProperties from './pages/admin/Properties';
import AdminMaintenance from './pages/admin/Maintenance';
import AdminWorkOrders from './pages/admin/WorkOrders';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* Tenant Routes */}
                    <Route path="/tenant/dashboard" element={
                        <ProtectedRoute allowedRoles={['tenant']}>
                            <TenantDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/tenant/submit-request" element={
                        <ProtectedRoute allowedRoles={['tenant']}>
                            <SubmitRequest />
                        </ProtectedRoute>
                    } />
                    <Route path="/tenant/my-requests" element={
                        <ProtectedRoute allowedRoles={['tenant']}>
                            <MyRequests />
                        </ProtectedRoute>
                    } />
                    <Route path="/tenant/request-details/:id" element={
                        <ProtectedRoute allowedRoles={['tenant']}>
                            <RequestDetails />
                        </ProtectedRoute>
                    } />

                    {/* Landlord Routes */}
                    <Route path="/landlord/dashboard" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <LandlordDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/requests" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <LandlordRequests />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/assign-technician" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <AssignTechnician />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/work-orders" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <WorkOrders />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/cost-tracking" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <CostTracking />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/reports" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <Reports />
                        </ProtectedRoute>
                    } />

                    {/* Technician Routes */}
                    <Route path="/technician/dashboard" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <TechnicianDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/technician/work-orders" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <AssignedTasks />
                        </ProtectedRoute>
                    } />
                    <Route path="/technician/update-work-order/:id" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <UpdateWorkOrder />
                        </ProtectedRoute>
                    } />
                    <Route path="/technician/setup-profile" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <TechnicianProfileSetup />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute allowedRoles={['tenant', 'landlord', 'technician', 'admin']}>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/tenant/notifications" element={
                        <ProtectedRoute allowedRoles={['tenant']}>
                            <Notifications />
                        </ProtectedRoute>
                    } />
                    <Route path="/landlord/technicians" element={
                        <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                            <Technicians />
                        </ProtectedRoute>
                    } />
                    <Route path="/technician/work-history" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <WorkHistory />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/properties" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminProperties />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/maintenance" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminMaintenance />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/work-orders" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminWorkOrders />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/technician-verification" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <TechnicianVerification />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;