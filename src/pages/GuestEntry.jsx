import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    UserPlus, Camera, Check, X, User, Phone, MapPin,
    FileText, Building2, Ticket, ChevronLeft, ArrowRight,
    CheckCircle2, QrCode
} from 'lucide-react';
const CameraIcon = Camera;
import CameraCapture from '../components/CameraCapture';
import { formatDateTime } from '../utils/validators';

const GuestEntry = () => {
    const navigate = useNavigate();
    const { societies, users, addVisitor } = useData();

    // UI State
    const [step, setStep] = useState(1); // 1: Society, 2: Form, 3: Token
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [selectedSocietyId, setSelectedSocietyId] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [useBackCamera, setUseBackCamera] = useState(false); // Default to front camera
    const [photo, setPhoto] = useState(null);
    const [token, setToken] = useState(null);
    const [visitorData, setVisitorData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        idProof: '',
        comingFrom: '',
        purpose: '',
        contactNumber: '',
        residentId: ''
    });

    // Reset resident selection when society changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, residentId: '' }));
    }, [selectedSocietyId]);

    const handleCameraReady = () => {
        // Camera is ready
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhotoCapture = (photoData) => {
        setPhoto(photoData);
        setShowCamera(false);
    };

    const handleSocietySelect = (id) => {
        setSelectedSocietyId(id);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.name || !formData.residentId) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                photo: photo,
                societyId: selectedSocietyId,
                createdBy: 'Self-Registered',
                status: 'pending'
            };

            const result = await addVisitor(dataToSubmit);
            setToken(result.id);
            setVisitorData(result);
            setStep(3);
            setSuccess('Registration successful!');
        } catch (err) {
            console.error('Error in self-registration:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const residents = users.filter(u =>
        u.roles.some(r =>
            r.role === 'resident' &&
            r.societyId === selectedSocietyId &&
            r.status === 'approved'
        )
    );

    const selectedSociety = societies.find(s => s.id === selectedSocietyId);

    if (step === 3) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center" style={{ maxWidth: '500px' }}>
                    <div className="flex justify-center mb-6">
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'var(--success-500)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                        }}>
                            <Check size={40} color="white" />
                        </div>
                    </div>

                    <h2 className="mb-2">Registration Request Sent!</h2>
                    <p className="text-muted mb-8">
                        Your entry request has been sent to the resident for approval.
                    </p>

                    <div className="card mb-8" style={{ background: 'var(--bg-glass)', border: '2px dashed var(--border-color)' }}>
                        <div className="text-sm text-muted mb-2 uppercase tracking-wider font-semibold">Your Entry Token</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--primary-500)' }}>
                            {token?.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <QrCode size={120} className="text-muted opacity-50" />
                        </div>
                    </div>

                    <div className="alert alert-info mb-8 text-left">
                        <Ticket size={18} />
                        <div>
                            <strong>What's next?</strong>
                            <ul style={{ margin: 'var(--space-2) 0 0 var(--space-4)', padding: 0 }}>
                                <li>The resident will receive your request.</li>
                                <li>Please show this token at the Gate to the security.</li>
                                <li>Once approved, security will let you in.</li>
                            </ul>
                        </div>
                    </div>

                    <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
                        Back to Login
                    </button>

                    <div className="mt-6">
                        <button className="btn btn-ghost" onClick={() => window.print()}>
                            Print / Save as PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container p-4">
            <div className="auth-card" style={{ maxWidth: step === 1 ? '900px' : '700px', width: '100%' }}>
                <div className="flex-between mb-8">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="text-xl">Visitor Self-Entry</h1>
                    </div>
                    {step === 2 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                            <ChevronLeft size={16} />
                            Change Society
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-error mb-6">{error}</div>}

                {step === 1 ? (
                    <div>
                        <h3 className="mb-4">Select Your Society</h3>
                        <p className="text-muted mb-6">Choose the society you are visiting to begin registration.</p>

                        <div className="grid-2">
                            {societies.length === 0 ? (
                                <div className="col-span-2 text-center py-12">
                                    <p className="text-muted">No societies found. Please contact administration.</p>
                                </div>
                            ) : (
                                societies.map(society => (
                                    <div
                                        key={society.id}
                                        className="card hover-scale pointer"
                                        onClick={() => handleSocietySelect(society.id)}
                                        style={{ border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                background: 'var(--primary-500)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <Building2 size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 className="mb-1">{society.name}</h4>
                                                <div className="text-xs text-muted flex items-center gap-1">
                                                    <MapPin size={12} /> {society.city || 'Location N/A'}
                                                </div>
                                            </div>
                                            <ArrowRight size={20} className="text-muted" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 text-center pt-8 border-t" style={{ borderTopColor: 'var(--border-color)' }}>
                            <p className="text-muted mb-4">Are you a resident or staff member?</p>
                            <Link to="/login" className="btn btn-outline">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="alert alert-info mb-6">
                            <Building2 size={18} />
                            <span>Visiting: <strong>{selectedSociety?.name}</strong></span>
                        </div>

                        {/* Photo Section */}
                        <div className="form-group">
                            <label className="form-label">Visitor Photo Capture</label>

                            {showCamera ? (
                                <div className="card p-0 overflow-hidden mb-4" style={{ background: '#000', borderRadius: 'var(--radius-lg)', minHeight: '400px', position: 'relative' }}>
                                    <div className="flex justify-between items-center p-3" style={{ background: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                                        <div className="text-white text-xs font-semibold uppercase tracking-wider">
                                            Selfie Capture
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm text-white"
                                            onClick={() => setUseBackCamera(!useBackCamera)}
                                            style={{ background: 'rgba(255,255,255,0.1)' }}
                                        >
                                            <CameraIcon size={16} />
                                            {useBackCamera ? 'Front' : 'Back'} Camera
                                        </button>
                                    </div>
                                    <CameraCapture
                                        onCapture={handlePhotoCapture}
                                        onCancel={() => setShowCamera(false)}
                                        onReady={handleCameraReady}
                                        useBackCamera={useBackCamera}
                                    />

                                </div>
                            ) : photo ? (
                                <div className="flex gap-4 items-end mb-6">
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={photo}
                                            alt="Visitor"
                                            style={{
                                                width: 180,
                                                height: 180,
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '3px solid var(--primary-500)',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: -10,
                                            right: -10,
                                            background: 'var(--success-500)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            padding: '4px'
                                        }}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setShowCamera(true)}
                                        >
                                            <Camera size={16} />
                                            Retake Photo
                                        </button>
                                        <p className="text-xs text-muted">Clear photo helps for faster approval.</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="card text-center p-12 mb-6 pointer border-dashed h-48 flex flex-col items-center justify-center gap-4 hover-glass"
                                    onClick={() => setShowCamera(true)}
                                    style={{ border: '2px dashed var(--border-color)' }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'var(--bg-glass)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary-500)'
                                    }}>
                                        <Camera size={30} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Capture Photo</div>
                                        <div className="text-sm text-muted">Mandatory for entry registration</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label text-sm uppercase font-semibold tracking-wider">FullName *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm uppercase font-semibold tracking-wider">Contact Number *</label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    className="form-input"
                                    placeholder="Mobile number"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label text-sm uppercase font-semibold tracking-wider">Gender</label>
                                <select
                                    name="gender"
                                    className="form-select"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label text-sm uppercase font-semibold tracking-wider">ID Proof Type</label>
                                <input
                                    type="text"
                                    name="idProof"
                                    className="form-input"
                                    placeholder="e.g. Aadhar, DL, Pan"
                                    value={formData.idProof}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label text-sm uppercase font-semibold tracking-wider">Purpose of Visit</label>
                            <select
                                name="purpose"
                                className="form-select"
                                value={formData.purpose}
                                onChange={handleChange}
                            >
                                <option value="">Select purpose</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Guest/Relative">Guest / Relative</option>
                                <option value="Maintenance">Maintenance / Repair</option>
                                <option value="Business">Business Meeting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label text-sm uppercase font-semibold tracking-wider">Resident to Visit *</label>
                            <select
                                name="residentId"
                                className="form-select"
                                value={formData.residentId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select resident</option>
                                {residents.map(resident => {
                                    const resRole = resident.roles.find(r => r.role === 'resident' && r.societyId === selectedSocietyId);
                                    return (
                                        <option key={resident.id} value={resident.id}>
                                            {resident.name} (Flat: {resRole?.flatNumber}, Block: {resRole?.block})
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-xs text-muted mt-1">If your resident is not listed, they may not be approved yet.</p>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg w-full mt-6 ${loading ? 'btn-loading' : ''}`}
                            disabled={loading || !photo}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <UserPlus size={20} />
                                    Register & Get Access Token
                                </>
                            )}
                        </button>

                        {!photo && !loading && (
                            <p className="text-center text-xs text-error mt-2">
                                * Photo capture is mandatory to submit
                            </p>
                        )}
                    </form>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-500) !important;
                }
                .hover-glass:hover {
                    background: var(--bg-glass);
                }
            `}} />
        </div>
    );
};

export default GuestEntry;
