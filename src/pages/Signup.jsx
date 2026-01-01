import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Eye, EyeOff, Home, UserPlus, Building2, Shield, Users, KeyRound } from 'lucide-react';
import { validateEmail, validateMobile, validatePassword } from '../utils/validators';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signup, hasSuperadmin } = useAuth();
    const { societies } = useData();

    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        securityQuestion: 'What is your pet\'s name?',
        securityAnswer: '',
        societyId: '',
        block: '',
        flatNumber: ''
    });

    const canSignupAsSuperadmin = !hasSuperadmin();

    const roleOptions = [
        {
            id: 'superadmin',
            label: 'Super Admin',
            icon: Shield,
            description: 'Manage all societies and administrators',
            disabled: !canSignupAsSuperadmin,
            disabledReason: 'A superadmin already exists'
        },
        {
            id: 'administrator',
            label: 'Administrator',
            icon: Building2,
            description: 'Manage residents and security for a society'
        },
        {
            id: 'resident',
            label: 'Resident',
            icon: Users,
            description: 'Approve or reject visitor entries'
        }
    ];

    const securityQuestions = [
        "What is your pet's name?",
        "What is your mother's maiden name?",
        "What city were you born in?",
        "What is your favorite movie?",
        "What was your first car?"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleSelect = (roleId) => {
        if (roleId === 'superadmin' && !canSignupAsSuperadmin) return;
        setSelectedRole(roleId);
        setStep(2);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!validateMobile(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            const firstError = Object.values(passwordValidation.errors).find(e => e);
            setError(firstError);
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (!formData.securityAnswer.trim()) {
            setError('Security answer is required');
            return false;
        }

        if (selectedRole !== 'superadmin' && !formData.societyId) {
            setError('Please select a society');
            return false;
        }

        if (selectedRole === 'resident') {
            if (!formData.block.trim()) {
                setError('Block is required for residents');
                return false;
            }
            if (!formData.flatNumber.trim()) {
                setError('Flat number is required for residents');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const result = signup({
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                password: formData.password,
                securityQuestion: formData.securityQuestion,
                securityAnswer: formData.securityAnswer,
                role: selectedRole,
                societyId: selectedRole === 'superadmin' ? null : formData.societyId,
                block: selectedRole === 'resident' ? formData.block : null,
                flatNumber: selectedRole === 'resident' ? formData.flatNumber : null
            });

            if (!result.success) {
                setError(result.error);
                setLoading(false);
                return;
            }

            if (selectedRole === 'superadmin') {
                setSuccess('Registration successful! You can now login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setSuccess('Registration successful! Please wait for approval from your ' +
                    (selectedRole === 'administrator' ? 'superadmin' : 'administrator') + '.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-slideUp" style={{ maxWidth: step === 1 ? '500px' : '480px' }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Home size={28} />
                    </div>
                    <span className="auth-logo-text">GateEntry</span>
                </div>

                {step === 1 ? (
                    <>
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Select your role to get started</p>

                        <div className="role-grid">
                            {roleOptions.map((role) => (
                                <div
                                    key={role.id}
                                    className="role-option"
                                    onClick={() => handleRoleSelect(role.id)}
                                    style={{
                                        opacity: role.disabled ? 0.5 : 1,
                                        cursor: role.disabled ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <div className="role-option-icon">
                                        <role.icon size={24} />
                                    </div>
                                    <div className="role-option-content">
                                        <div className="role-option-title">{role.label}</div>
                                        <div className="role-option-subtitle">
                                            {role.disabled ? role.disabledReason : role.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="auth-title">
                            {selectedRole === 'superadmin' && 'Super Admin Registration'}
                            {selectedRole === 'administrator' && 'Administrator Registration'}
                            {selectedRole === 'resident' && 'Resident Registration'}
                        </h1>
                        <p className="auth-subtitle">Fill in your details to continue</p>

                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mobile</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        className="form-input"
                                        placeholder="10-digit number"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {selectedRole !== 'superadmin' && (
                                <div className="form-group">
                                    <label className="form-label">Select Society</label>
                                    <select
                                        name="societyId"
                                        className="form-select"
                                        value={formData.societyId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose a society</option>
                                        {societies.map(society => (
                                            <option key={society.id} value={society.id}>
                                                {society.name}
                                            </option>
                                        ))}
                                    </select>
                                    {societies.length === 0 && (
                                        <p className="form-hint text-error">
                                            No societies available. Please contact the superadmin.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedRole === 'resident' && (
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Block</label>
                                        <input
                                            type="text"
                                            name="block"
                                            className="form-input"
                                            placeholder="e.g., A, B, Tower-1"
                                            value={formData.block}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Flat Number</label>
                                        <input
                                            type="text"
                                            name="flatNumber"
                                            className="form-input"
                                            placeholder="e.g., 101, 202"
                                            value={formData.flatNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="form-input"
                                        placeholder="Min 8 chars, uppercase, lowercase, number"
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

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Security Question</label>
                                <select
                                    name="securityQuestion"
                                    className="form-select"
                                    value={formData.securityQuestion}
                                    onChange={handleChange}
                                >
                                    {securityQuestions.map(q => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Security Answer</label>
                                <input
                                    type="text"
                                    name="securityAnswer"
                                    className="form-input"
                                    placeholder="Answer to your security question"
                                    value={formData.securityAnswer}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={loading || (selectedRole !== 'superadmin' && societies.length === 0)}
                                >
                                    {loading ? 'Creating Account...' : (
                                        <>
                                            <UserPlus size={20} />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
