import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import RoleSelector from './pages/RoleSelector';
import GuestEntry from './pages/GuestEntry';

// Dashboards
import SuperadminDashboard from './pages/dashboards/SuperadminDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ResidentDashboard from './pages/dashboards/ResidentDashboard';
import SecurityDashboard from './pages/dashboards/SecurityDashboard';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, currentUser, currentRole } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user has multiple roles and hasn't selected one
    const approvedRoles = currentUser?.roles?.filter(r => r.status === 'approved') || [];
    if (approvedRoles.length > 1 && !currentRole && location.pathname !== '/select-role') {
        return <Navigate to="/select-role" replace />;
    }

    // If role is required and doesn't match
    if (requiredRole && currentRole?.role !== requiredRole) {
        return <Navigate to="/select-role" replace />;
    }

    return children;
};

// Public Route component (redirects authenticated users)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, currentUser, currentRole } = useAuth();

    if (isAuthenticated) {
        const approvedRoles = currentUser?.roles?.filter(r => r.status === 'approved') || [];

        if (approvedRoles.length > 1 && !currentRole) {
            return <Navigate to="/select-role" replace />;
        }

        // Redirect to appropriate dashboard
        const role = currentRole || approvedRoles[0];
        if (role) {
            switch (role.role) {
                case 'superadmin':
                    return <Navigate to="/superadmin" replace />;
                case 'administrator':
                    return <Navigate to="/admin" replace />;
                case 'resident':
                    return <Navigate to="/resident" replace />;
                case 'security':
                    return <Navigate to="/security" replace />;
                default:
                    return <Navigate to="/select-role" replace />;
            }
        }
    }

    return children;
};

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div className="auth-logo">
                        <div className="auth-logo-icon animate-pulse">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/visitor-self-entry" element={<PublicRoute><GuestEntry /></PublicRoute>} />

            {/* Role Selection */}
            <Route path="/select-role" element={
                <ProtectedRoute>
                    <RoleSelector />
                </ProtectedRoute>
            } />

            {/* Dashboard Routes */}
            <Route path="/superadmin/*" element={
                <ProtectedRoute requiredRole="superadmin">
                    <SuperadminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="administrator">
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/resident/*" element={
                <ProtectedRoute requiredRole="resident">
                    <ResidentDashboard />
                </ProtectedRoute>
            } />

            <Route path="/security/*" element={
                <ProtectedRoute requiredRole="security">
                    <SecurityDashboard />
                </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
