import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Home, KeyRound, ArrowLeft } from 'lucide-react';
import { validatePassword } from '../utils/validators';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const { getUserByEmail } = useData();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setError('');

        const user = getUserByEmail(email);
        if (!user) {
            setError('No account found with this email address');
            return;
        }

        setSecurityQuestion(user.securityQuestion);
        setStep(2);
    };

    const handleResetSubmit = (e) => {
        e.preventDefault();
        setError('');

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            const firstError = Object.values(passwordValidation.errors).find(e => e);
            setError(firstError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const result = resetPassword(email, securityAnswer, newPassword);

        if (!result.success) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
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

                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">
                    {step === 1 ? 'Enter your email to get started' : 'Answer your security question'}
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full">
                            <KeyRound size={20} />
                            Continue
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit}>
                        <div className="form-group">
                            <label className="form-label">Security Question</label>
                            <p style={{
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-lg)',
                                color: 'var(--text-primary)'
                            }}>
                                {securityQuestion}
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Your Answer</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your answer"
                                value={securityAnswer}
                                onChange={(e) => {
                                    setSecurityAnswer(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min 8 chars, uppercase, lowercase, number"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setStep(1);
                                    setSecurityAnswer('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setError('');
                                }}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    Remember your password?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
