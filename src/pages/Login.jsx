import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Home, LogIn } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        emailOrLoginName: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = login(formData.emailOrLoginName, formData.password);

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            // Navigate based on roles
            if (result.hasMultipleRoles) {
                navigate('/select-role');
            } else {
                const roles = result.user?.roles || [];
                const role = roles.find(r => r.status === 'approved');
                if (role) {
                    switch (role.role) {
                        case 'superadmin':
                            navigate('/superadmin');
                            break;
                        case 'administrator':
                            navigate('/admin');
                            break;
                        case 'resident':
                            navigate('/resident');
                            break;
                        case 'security':
                            navigate('/security');
                            break;
                        default:
                            navigate('/select-role');
                    }
                } else {
                    setError('No approved role found for your account');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-slideUp">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Home size={28} />
                    </div>
                    <span className="auth-logo-text">GateEntry</span>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your dashboard</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email or Login Name</label>
                        <input
                            type="text"
                            name="emailOrLoginName"
                            className="form-input"
                            placeholder="Enter your email or login name"
                            value={formData.emailOrLoginName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 'var(--space-6)' }}>
                        <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
