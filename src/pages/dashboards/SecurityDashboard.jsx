import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import CameraCapture from '../../components/CameraCapture';
import SimpleCameraCapture from '../../components/SimpleCameraCapture';
import {
    LayoutDashboard, UserPlus, ClipboardList, LogOut as LogOutIcon,
    Camera, Check, X, User, Phone, MapPin, FileText, Building2,
    Ticket, Search, Megaphone, AlertTriangle, Bell, ShieldAlert, Car, Contact, LogIn, LogOut
} from 'lucide-react';
import NoticeBoard from '../../components/NoticeBoard';
import { formatDateTime, getInitials, getRoleLabel } from '../../utils/validators';
import InactiveSocietyOverlay from '../../components/InactiveSocietyOverlay';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/new-visitor', label: 'New Visitor Entry', icon: UserPlus },
            { path: '/active-visits', label: 'Active Visits', icon: ClipboardList },
            { path: '/verify-pass', label: 'Verify Pass', icon: Ticket },
            { path: '/vehicle-lookup', label: 'Vehicle Lookup', icon: Car },
            { path: '/staff-gate', label: 'Staff Gate Logs', icon: Contact },
            { path: '/notices', label: 'Notice Board', icon: Megaphone }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentRole } = useAuth();
    const { visitors, users, getSocietyById } = useData();

    const society = getSocietyById(currentRole?.societyId);

    const societyVisitors = visitors.filter(v => v.societyId === currentRole?.societyId);

    const today = new Date().toDateString();
    const todayVisitors = societyVisitors.filter(v =>
        new Date(v.entryTime).toDateString() === today
    );

    const pendingVisitors = societyVisitors.filter(v => v.status === 'pending');
    const activeVisitors = societyVisitors.filter(v =>
        v.status === 'approved' && !v.exitTime
    );

    return (
        <div>
            <div className="alert alert-info mb-6">
                <Building2 size={18} />
                <span>Security at: <strong>{society?.name}</strong></span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{todayVisitors.length}</div>
                        <div className="stat-label">Today's Entries</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <ClipboardList size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingVisitors.length}</div>
                        <div className="stat-label">Pending Approval</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Check size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{activeVisitors.length}</div>
                        <div className="stat-label">Currently Inside</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Visitor Entry
const NewVisitorPage = () => {
    const { currentUser, currentRole } = useAuth();
    const { users, addVisitor, getSocietyById } = useData();
    const [showCamera, setShowCamera] = useState(false);
    const [useSimpleCamera, setUseSimpleCamera] = useState(false); // Toggle between camera modes
    const [photo, setPhoto] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detect if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // Use back camera on mobile, front camera on desktop
    const useBackCamera = isMobile;

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        idProof: '',
        comingFrom: '',
        purpose: '',
        contactNumber: '',
        residentId: ''
    });

    const society = getSocietyById(currentRole?.societyId);

    // Get approved residents for this society
    const residents = users.filter(u =>
        u.roles.some(r =>
            r.role === 'resident' &&
            r.societyId === currentRole?.societyId &&
            r.status === 'approved'
        )
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePhotoCapture = (photoData) => {
        console.log('Photo captured, size:', photoData ? photoData.length : 0);

        // Validate the captured photo
        if (!photoData || !photoData.startsWith('data:image/')) {
            setError('Invalid photo data captured. Please try again.');
            return;
        }

        // Check photo size (warn if > 500KB)
        if (photoData.length > 512000) {
            console.warn('Large photo captured:', photoData.length, 'characters');
            // Could implement compression here if needed
        }

        setPhoto(photoData);
        setShowCamera(false);
        setError(''); // Clear any previous errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!formData.name || !formData.residentId) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('Submitting visitor data:', {
                ...formData,
                photo: photo ? `Photo captured (${photo.length} chars)` : 'No photo',
                societyId: currentRole?.societyId,
                createdBy: currentUser.id,
                residentId: formData.residentId
            });

            // Validate residentId is present
            if (!formData.residentId) {
                setError('Please select a resident to visit');
                setIsSubmitting(false);
                return;
            }

            // Validate photo if present
            if (photo && !photo.startsWith('data:image/')) {
                setError('Invalid photo format. Please capture the photo again.');
                setIsSubmitting(false);
                return;
            }

            const visitorData = {
                ...formData,
                photo: photo,
                societyId: currentRole?.societyId,
                createdBy: currentUser.id,
                residentId: formData.residentId // Ensure this is explicitly included
            };

            console.log('Final visitor data to be saved:', {
                ...visitorData,
                photo: visitorData.photo ? `Photo data (${visitorData.photo.length} chars)` : 'No photo'
            });

            const result = await addVisitor(visitorData);
            console.log('Visitor added successfully:', result);

            setSuccess('Visitor entry created! Waiting for resident approval.');

            // Reset form
            setFormData({
                name: '',
                gender: 'male',
                idProof: '',
                comingFrom: '',
                purpose: '',
                contactNumber: '',
                residentId: ''
            });
            setPhoto(null);

        } catch (error) {
            console.error('Error adding visitor:', error);

            // Provide more specific error messages
            if (error.message) {
                if (error.message.includes('Image too large')) {
                    setError('Photo is too large. Please capture a smaller image or try the simple camera mode.');
                } else if (error.message.includes('Image storage failed')) {
                    setError('Failed to save photo. Please try capturing the image again.');
                } else if (error.message.includes('Invalid image format')) {
                    setError('Invalid photo format. Please capture the photo again using the camera.');
                } else if (error.message.includes('storage')) {
                    setError('Storage error: Unable to save visitor data. Please check your browser storage settings.');
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    setError('Network error: Unable to connect to the server. Please check your internet connection.');
                } else if (error.message.includes('permission')) {
                    setError('Permission error: You do not have permission to create visitor entries.');
                } else {
                    setError(`Failed to create visitor entry: ${error.message}`);
                }
            } else {
                setError('Failed to create visitor entry. Please try again. If the problem persists, contact support.');
            }
        } finally {
            setIsSubmitting(false);
        }

        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div>
            <h2 className="mb-6">New Visitor Entry</h2>

            <div className="card" style={{ maxWidth: '800px' }}>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Photo Section - Enhanced with multiple capture options */}
                    <div className="form-group">
                        <label className="form-label">Visitor Photo</label>

                        {/* Camera Mode Toggle - Always visible at top */}
                        <div style={{
                            marginBottom: 'var(--space-3)',
                            textAlign: 'center',
                            padding: 'var(--space-3)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-3)',
                                marginBottom: 'var(--space-2)',
                                flexWrap: 'wrap'
                            }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Advanced
                                </span>
                                <label style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '50px',
                                    height: '24px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={useSimpleCamera}
                                        onChange={(e) => setUseSimpleCamera(e.target.checked)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: useSimpleCamera ? 'var(--primary-500)' : 'var(--gray-300)',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '24px'
                                    }}></span>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '18px',
                                        width: '18px',
                                        left: useSimpleCamera ? '26px' : '3px',
                                        bottom: '3px',
                                        backgroundColor: 'white',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></span>
                                </label>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Simple
                                </span>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.4'
                            }}>
                                {useSimpleCamera ? '📱 More reliable for mobile devices' : '⚡ Full features with camera switching'}
                            </p>
                        </div>

                        {showCamera ? (
                            <div className="camera-section">
                                {useSimpleCamera ? (
                                    <SimpleCameraCapture
                                        onCapture={handlePhotoCapture}
                                        onCancel={() => setShowCamera(false)}
                                        useBackCamera={useBackCamera}
                                    />
                                ) : (
                                    <CameraCapture
                                        onCapture={handlePhotoCapture}
                                        onCancel={() => setShowCamera(false)}
                                        useBackCamera={useBackCamera}
                                    />
                                )}
                            </div>
                        ) : photo ? (
                            <div className="flex gap-4" style={{ alignItems: 'flex-end' }}>
                                <img
                                    src={photo}
                                    alt="Visitor"
                                    style={{
                                        width: 150,
                                        height: 150,
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--border-color)'
                                    }}
                                />
                                <div className="flex gap-2" style={{ flexDirection: 'column' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setPhoto(null); setShowCamera(true); }}
                                    >
                                        <Camera size={18} />
                                        Retake Photo
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => document.getElementById('photo-upload').click()}
                                    >
                                        <FileText size={18} />
                                        Change Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="photo-options-grid" style={{
                                display: 'grid',
                                gap: 'var(--space-3)',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowCamera(true)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                                >
                                    <Camera size={18} />
                                    Live Camera Capture
                                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>({useBackCamera ? 'Back Camera' : 'Front Camera'})</span>
                                </button>

                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => document.getElementById('photo-upload').click()}
                                        style={{ flex: 1, minWidth: '150px' }}
                                    >
                                        <FileText size={18} />
                                        Upload Photo
                                    </button>

                                    {isMobile && (
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.capture = 'environment';
                                                input.onchange = (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setPhoto(event.target.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                };
                                                input.click();
                                            }}
                                            style={{ flex: 1, minWidth: '150px' }}
                                        >
                                            <Camera size={18} />
                                            Mobile Camera
                                        </button>
                                    )}
                                </div>

                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setPhoto(event.target.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Visitor Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter visitor's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gender</label>
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
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                className="form-input"
                                placeholder="10-digit mobile number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ID Proof</label>
                            <input
                                type="text"
                                name="idProof"
                                className="form-input"
                                placeholder="e.g., Aadhar, DL, Voter ID"
                                value={formData.idProof}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Coming From</label>
                        <input
                            type="text"
                            name="comingFrom"
                            className="form-input"
                            placeholder="Company/Organization or Address"
                            value={formData.comingFrom}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purpose of Visit</label>
                        <select
                            name="purpose"
                            className="form-select"
                            value={formData.purpose}
                            onChange={handleChange}
                        >
                            <option value="">Select purpose of visit</option>
                            <option value="Personal Visit">Personal Visit</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Courier">Courier</option>
                            <option value="Service/Repair">Service/Repair</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Painter">Painter</option>
                            <option value="Cleaning Service">Cleaning Service</option>
                            <option value="Pest Control">Pest Control</option>
                            <option value="Internet/Cable Service">Internet/Cable Service</option>
                            <option value="Appliance Repair">Appliance Repair</option>
                            <option value="Business Meeting">Business Meeting</option>
                            <option value="Real Estate Agent">Real Estate Agent</option>
                            <option value="Healthcare Professional">Healthcare Professional</option>
                            <option value="Tutor/Teacher">Tutor/Teacher</option>
                            <option value="Domestic Help">Domestic Help</option>
                            <option value="Guest/Relative">Guest/Relative</option>
                            <option value="Contractor">Contractor</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Visiting Resident *</label>
                        <select
                            name="residentId"
                            className="form-select"
                            value={formData.residentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select resident to visit</option>
                            {residents.map(resident => {
                                const residentRole = resident.roles.find(r =>
                                    r.role === 'resident' && r.societyId === currentRole?.societyId
                                );
                                return (
                                    <option key={resident.id} value={resident.id}>
                                        {resident.name} - Block {residentRole?.block}, Flat {residentRole?.flatNumber}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary btn-lg w-full mt-6 ${isSubmitting ? 'btn-loading' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner" style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #ffffff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Submit Visitor Entry
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Active Visits (for closing on exit)
const ActiveVisitsPage = () => {
    const { currentRole } = useAuth();
    const { visitors, users, updateVisitor } = useData();
    const [filter, setFilter] = useState('all');

    console.log('ActiveVisitsPage: All visitors:', visitors);
    console.log('ActiveVisitsPage: Current role societyId:', currentRole?.societyId);

    const societyVisitors = visitors
        .filter(v => {
            // Handle both camelCase and lowercase field names
            const visitorSocietyId = v.societyId || v.societyid;
            console.log('Filtering visitor:', v, 'societyId match:', visitorSocietyId === currentRole?.societyId);
            return visitorSocietyId === currentRole?.societyId;
        })
        .sort((a, b) => {
            // Handle both camelCase and lowercase field names for entryTime
            const aEntryTime = a.entryTime || a.entrytime;
            const bEntryTime = b.entryTime || b.entrytime;
            return new Date(bEntryTime) - new Date(aEntryTime);
        });

    console.log('ActiveVisitsPage: Society visitors:', societyVisitors);

    const filteredVisitors = societyVisitors.filter(v => {
        // Handle both camelCase and lowercase field names for exitTime
        const exitTime = v.exitTime || v.exittime;

        switch (filter) {
            case 'pending':
                return v.status === 'pending';
            case 'approved':
                return v.status === 'approved' && !exitTime;
            case 'inside':
                return v.status === 'approved' && !exitTime;
            case 'exited':
                return exitTime !== null;
            default:
                return true;
        }
    });

    const getResidentName = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        if (!resident) return 'Unknown';
        const residentRole = resident.roles.find(r =>
            r.role === 'resident' && (r.societyId === currentRole?.societyId || r.societyid === currentRole?.societyId)
        );
        return `${resident.name} (${residentRole?.block}-${residentRole?.flatNumber})`;
    };

    const handleCloseVisit = (visitorId) => {
        updateVisitor(visitorId, { exitTime: new Date().toISOString() });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Active Visits</h2>

                <div className="tabs" style={{ marginBottom: 0 }}>
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab ${filter === 'inside' ? 'active' : ''}`}
                        onClick={() => setFilter('inside')}
                    >
                        Inside
                    </button>
                    <button
                        className={`tab ${filter === 'exited' ? 'active' : ''}`}
                        onClick={() => setFilter('exited')}
                    >
                        Exited
                    </button>
                </div>
            </div>

            {filteredVisitors.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No Visitors"
                    description={`No ${filter !== 'all' ? filter : ''} visitors found.`}
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Purpose</th>
                                    <th>Visiting</th>
                                    <th>Entry</th>
                                    <th>Exit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVisitors.map(visitor => (
                                    <tr key={visitor.id}>
                                        <td>
                                            <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                                {visitor.photo ? (
                                                    <img
                                                        src={visitor.photo}
                                                        alt={visitor.name}
                                                        style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="header-avatar" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>
                                                        {getInitials(visitor.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{visitor.name}</div>
                                                    <div className="text-xs text-muted">{visitor.contactNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted text-sm">{visitor.purpose || '—'}</td>
                                        <td className="text-sm">{getResidentName(visitor.residentId || visitor.residentid)}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime || visitor.entrytime)}</td>
                                        <td className="text-sm text-muted">
                                            {visitor.exitTime || visitor.exittime ? formatDateTime(visitor.exitTime || visitor.exittime) : '—'}
                                        </td>
                                        <td>
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                        <td>
                                            {visitor.status === 'approved' && !(visitor.exitTime || visitor.exittime) ? (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleCloseVisit(visitor.id)}
                                                >
                                                    <LogOutIcon size={14} />
                                                    Close Visit
                                                </button>
                                            ) : (
                                                <span className="text-muted text-sm">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const SOSAlertOverlay = () => {
    const { currentRole, currentUser } = useAuth();
    const { sosAlerts, users, resolveSOS } = useData();

    const activeAlerts = sosAlerts.filter(a => {
        const sId = a.societyId || a.societyid;
        const currentSId = currentRole?.societyId || currentRole?.societyid;
        return sId === currentSId && a.status === 'active';
    });

    // Sound effect for SOS
    useEffect(() => {
        if (activeAlerts.length > 0) {
            console.log('SOSAlertOverlay: Active alerts detected, starting siren');
            const playSiren = () => {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.5);
                oscillator.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 1.0);

                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.8);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1.0);
            };

            playSiren();
            const interval = setInterval(playSiren, 1500);
            return () => clearInterval(interval);
        }
    }, [activeAlerts.length]);

    if (activeAlerts.length === 0) return null;

    const getUserInfo = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return { name: 'Unknown User', details: 'N/A', role: 'Unknown' };

        const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
        const role = user.roles.find(r => (r.societyId === roleSocietyId || r.societyid === roleSocietyId));

        let details = 'N/A';
        if (role?.role === 'resident') {
            details = `Flat ${role.block || ''}-${role.flatNumber || ''}`;
        } else {
            details = getRoleLabel(role?.role);
        }

        return {
            name: user.name,
            details: details,
            role: role?.role || 'User'
        };
    };

    return (
        <div className="sos-overlay-container">
            {activeAlerts.map(alert => {
                const alertId = alert.id || alert.id; // Usually same but for clarity
                const senderId = alert.residentId || alert.residentid;
                const sender = getUserInfo(senderId);
                return (
                    <div key={alertId} className="sos-emergency-card animate-pulse">
                        <div className="sos-emergency-header">
                            <AlertTriangle size={48} className="sos-blink-icon" />
                            <div>
                                <h1 className="emergency-title">EMERGENCY ALERT</h1>
                                <p className="emergency-subtitle">Immediate Assistance Required</p>
                            </div>
                        </div>

                        <div className="sos-resident-details">
                            <div className="sos-detail-item">
                                <span className="label">SENT BY</span>
                                <span className="value">{sender.name}</span>
                            </div>
                            <div className="sos-detail-item">
                                <span className="label">LOCATION / ROLE</span>
                                <span className="value">{sender.details}</span>
                            </div>
                            <div className="sos-detail-item">
                                <span className="label">TIME</span>
                                <span className="value">{new Date(alert.createdAt || alert.createdat).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <button
                            className="sos-resolve-btn"
                            onClick={async () => {
                                try {
                                    // Use alert ID if available, otherwise residentId as fallback
                                    const targetId = alert.id || alert.id;
                                    const residentId = alert.residentId || alert.residentid;

                                    if (!targetId && !residentId) {
                                        alert('Error: Invalid alert data. Cannot resolve.');
                                        return;
                                    }

                                    // Pass residentId to resolveSOS as fallback context
                                    await resolveSOS(targetId, currentUser.id, residentId);
                                } catch (error) {
                                    console.error('Failed to resolve SOS:', error);
                                    alert('Failed to update alert status. Please check your connection and try again.');
                                }
                            }}
                        >
                            <ShieldAlert size={20} />
                            MARK AS ATTENDED
                        </button>
                    </div>
                );
            })}

            <style dangerouslySetInnerHTML={{
                __html: `
                .sos-overlay-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start; /* Changed from center to allow scrolling */
                    padding: 2rem;
                    gap: 2rem;
                    overflow-y: auto; /* Enable vertical scrolling */
                }

                .sos-emergency-card {
                    background: #fff;
                    width: 100%;
                    max-width: 600px;
                    border-radius: 2rem;
                    padding: 3rem;
                    box-shadow: 0 0 50px rgba(220, 38, 38, 0.8);
                    border: 5px solid var(--error-600);
                    border: 5px solid var(--error-600);
                    /* animation: emergency-shake 0.5s infinite; Removed for usability */
                }

                @keyframes emergency-shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }

                .sos-emergency-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                    color: var(--error-700);
                }

                .emergency-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -1px;
                    color: #dc2626;
                }

                .emergency-subtitle {
                    margin: 0.5rem 0 0;
                    font-weight: 600;
                    letter-spacing: 0.2rem;
                    text-transform: uppercase;
                    font-size: 0.875rem;
                    opacity: 0.8;
                }

                .sos-blink-icon {
                    animation: blink-error 0.5s infinite alternate;
                }

                @keyframes blink-error {
                    from { color: var(--error-600); transform: scale(1); }
                    to { color: var(--error-900); transform: scale(1.2); }
                }

                .sos-resident-details {
                    display: grid;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .sos-detail-item {
                    display: flex;
                    flex-direction: column;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1rem;
                }

                .sos-detail-item .label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                    letter-spacing: 0.05rem;
                }

                .sos-detail-item .value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #111827;
                }

                .sos-resolve-btn {
                    width: 100%;
                    background: #000;
                    color: white;
                    border: none;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    font-size: 1.125rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    transition: all 0.2s;
                    position: relative;
                    z-index: 10;
                }

                .sos-resolve-btn:hover {
                    background: var(--success-600);
                    transform: translateY(-2px);
                }
            ` }} />
        </div>
    );
};

// Main Dashboard Layout
const SecurityDashboard = () => {
    const { currentRole } = useAuth();
    const { isSocietyActive, getSocietyById, loading } = useData();

    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
    const isActive = isSocietyActive(roleSocietyId);
    const society = getSocietyById(roleSocietyId);

    return (
        <div className="app-container">
            {!loading && !isActive && <InactiveSocietyOverlay societyName={society?.name} />}
            <Sidebar items={sidebarItems} basePath="/security" />
            <div className="main-content">
                <Header title="Security Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/new-visitor" element={<NewVisitorPage />} />
                        <Route path="/active-visits" element={<ActiveVisitsPage />} />
                        <Route path="/verify-pass" element={<VerifyPassPage />} />
                        <Route path="/vehicle-lookup" element={<VehicleLookupPage />} />
                        <Route path="/staff-gate" element={<StaffGatePage />} />
                        <Route path="/notices" element={<NoticeBoardPage />} />
                    </Routes>
                </div>
            </div>
            <SOSAlertOverlay />
        </div>
    );
};
const VerifyPassPage = () => {
    const { currentRole } = useAuth();
    const { preApprovals, updatePreApproval, addVisitor, users } = useData();
    const [passCode, setPassCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = (e) => {
        e.preventDefault();
        setError('');
        const pass = preApprovals.find(p => p.passCode === passCode && p.societyId === currentRole.societyId);

        if (!pass) {
            setError('Invalid Pass Code');
            setResult(null);
            return;
        }

        if (pass.status !== 'valid') {
            setError(`This pass is ${pass.status}`);
            setResult(null);
            return;
        }

        // Find resident name for display
        const resident = users.find(u => u.id === pass.residentId);
        setResult({ ...pass, residentName: resident?.name });
    };

    const handleCheckIn = async () => {
        try {
            // Create a visitor entry based on pre-approval
            await addVisitor({
                name: result.name,
                contactNumber: result.contactNumber,
                purpose: result.purpose,
                residentId: result.residentId,
                societyId: result.societyId,
                status: 'approved', // Pre-approved implies auto-approval
                entryTime: new Date().toISOString()
            });

            // Mark pre-approval as used
            await updatePreApproval(result.id, { status: 'used' });

            setResult(null);
            setPassCode('');
            alert('Check-in successful!');
        } catch (error) {
            console.error('Error checking in visitor:', error);
            setError('Failed to check in visitor. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="mb-6">Verify Visitor Pass</h2>

            <form onSubmit={handleVerify} className="card flex gap-4 mb-8">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit Pass Code"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value)}
                    maxLength={6}
                    style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5em', fontWeight: 'bold' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>
                    <Search size={20} />
                    Verify
                </button>
            </form>

            {error && (
                <div className="alert alert-error animate-fadeIn">
                    <X size={18} />
                    {error}
                </div>
            )}

            {result && (
                <div className="card animate-slideUp">
                    <div className="text-center mb-6">
                        <div className="stat-icon m-auto mb-4" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
                            <Ticket size={32} />
                        </div>
                        <h3 className="text-2xl">Valid Pass Found</h3>
                        <p className="text-muted">Pre-approved by {result.residentName}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex-between p-3 bg-glass rounded-lg">
                            <span className="text-muted">Visitor Name</span>
                            <span className="font-semibold">{result.name}</span>
                        </div>
                        <div className="flex-between p-3 bg-glass rounded-lg">
                            <span className="text-muted">Contact</span>
                            <span className="font-semibold">{result.contactNumber}</span>
                        </div>
                        <div className="flex-between p-3 bg-glass rounded-lg">
                            <span className="text-muted">Purpose</span>
                            <span className="font-semibold">{result.purpose}</span>
                        </div>
                        <div className="flex-between p-3 bg-glass rounded-lg">
                            <span className="text-muted">Visit Date</span>
                            <span className="font-semibold">{result.expectedDate}</span>
                        </div>
                    </div>

                    <button className="btn btn-success w-full text-lg py-4" onClick={handleCheckIn}>
                        Confirm Entry & Check-in
                    </button>
                </div>
            )}
        </div>
    );
};

const NoticeBoardPage = () => {
    return (
        <div>
            <h2 className="mb-6">Society Announcements</h2>
            <NoticeBoard />
        </div>
    );
};

// Vehicle Lookup Page for Security
const VehicleLookupPage = () => {
    const { currentRole } = useAuth();
    const { vehicles, users } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        const normalizedSearch = searchTerm.replace(/\s+/g, '').toUpperCase();
        const found = vehicles.find(v =>
            v.societyId === currentRole.societyId &&
            v.plateNumber.replace(/\s+/g, '').toUpperCase() === normalizedSearch
        );

        if (found) {
            const owner = users.find(u => u.id === found.residentId);
            const ownerRole = owner?.roles.find(r => r.role === 'resident' && r.societyId === currentRole.societyId);
            setResult({ ...found, ownerName: owner?.name, flat: `${ownerRole?.block}-${ownerRole?.flatNumber}` });
        } else {
            setResult(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="mb-6">Resident Vehicle Lookup</h2>

            <form onSubmit={handleSearch} className="card flex gap-4 mb-8">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Plate Number (e.g. MH 12 AB 1234)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>
                    <Search size={20} />
                    Search
                </button>
            </form>

            {result === false && (
                <div className="alert alert-warning animate-fadeIn">
                    <X size={18} />
                    No registered vehicle found with this plate number.
                </div>
            )}

            {result && (
                <div className="card animate-slideUp">
                    <div className="flex-between items-start mb-8">
                        <div>
                            <div className="text-muted text-sm uppercase tracking-wider mb-1">Registered Vehicle</div>
                            <div className="plate-number-display">{result.plateNumber}</div>
                        </div>
                        <div className={`vehicle-type-badge ${result.type}`}>
                            {result.type === 'car' ? <Car size={24} /> : <span>🏍️</span>}
                            <span>{result.type.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="grid-2 gap-12">
                        <div>
                            <div className="label-sm mb-2">VEHICLE DETAILS</div>
                            <div className="p-4 bg-soft rounded-lg">
                                <div className="flex-between mb-2">
                                    <span className="text-muted">Make</span>
                                    <span className="font-semibold">{result.make || 'N/A'}</span>
                                </div>
                                <div className="flex-between">
                                    <span className="text-muted">Model</span>
                                    <span className="font-semibold">{result.model || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="label-sm mb-2">RESIDENT INFO</div>
                            <div className="p-4 bg-soft rounded-lg border-2 border-primary-100">
                                <div className="flex-between mb-2">
                                    <span className="text-muted">Owner</span>
                                    <span className="font-semibold">{result.ownerName}</span>
                                </div>
                                <div className="flex-between">
                                    <span className="text-muted">Flat No.</span>
                                    <span className="font-semibold">Flat {result.flat}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .plate-number-display {
                    font-size: 2.5rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    color: var(--text-main);
                }
                .label-sm { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); opacity: 0.7; }
                .vehicle-type-badge {
                    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
                    padding: 1rem; border-radius: 1rem; width: 80px;
                }
                .vehicle-type-badge.car { background: var(--primary-100); color: var(--primary-700); }
                .vehicle-type-badge.bike { background: var(--warning-100); color: var(--warning-700); }
            ` }} />
        </div>
    );
};

export default SecurityDashboard;

// Staff Gate Management Page
const StaffGatePage = () => {
    const { currentRole } = useAuth();
    const { staff, updateDataItem, addDataItem } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const societyStaff = staff.filter(s => (s.societyId === currentRole.societyId || s.societyid === currentRole.societyId));
    const filteredStaff = societyStaff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleGate = async (member) => {
        const newStatus = !member.atGate;
        await updateDataItem('staff', member.id, { atGate: newStatus });

        // Also add to staff_logs for history
        await addDataItem('staff_logs', {
            staffId: member.id,
            societyId: currentRole.societyId,
            action: newStatus ? 'entry' : 'exit',
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Staff Gate Management</h2>
                <div className="search-box" style={{ maxWidth: '300px' }}>
                    <Search size={18} />
                    <input type="text" placeholder="Search staff name or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {filteredStaff.length === 0 ? (
                <EmptyState icon={Contact} title="No Staff Found" description="Try searching for a different name or role." />
            ) : (
                <div className="grid-3">
                    {filteredStaff.map(member => (
                        <div key={member.id} className={`card staff-gate-card ${member.atGate ? 'inside' : 'outside'}`}>
                            <div className="flex gap-4">
                                <div className="header-avatar" style={{ width: 48, height: 48 }}>{getInitials(member.name)}</div>
                                <div>
                                    <h3 className="font-bold">{member.name}</h3>
                                    <div className="text-xs font-bold uppercase text-primary-400">{member.role}</div>
                                </div>
                            </div>
                            <div className="mt-6 flex-between">
                                <div className="status-indicator">
                                    <span className="dot"></span>
                                    {member.atGate ? 'INSIDE' : 'OUTSIDE'}
                                </div>
                                <button
                                    className={`btn ${member.atGate ? 'btn-danger' : 'btn-success'} btn-sm`}
                                    onClick={() => handleToggleGate(member)}
                                >
                                    {member.atGate ? <LogOut size={14} /> : <LogIn size={14} />}
                                    {member.atGate ? 'Mark Exit' : 'Mark Entry'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .staff-gate-card { border-top: 4px solid var(--border-color); }
                .staff-gate-card.inside { border-top-color: var(--success-500); background: rgba(16, 185, 129, 0.05); }
                .staff-gate-card.outside { border-top-color: var(--border-color); }
                .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); }
                .inside .status-indicator { color: var(--success-500); }
                .inside .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success-500); box-shadow: 0 0 10px var(--success-500); }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; }
            ` }} />
        </div>
    );
};
