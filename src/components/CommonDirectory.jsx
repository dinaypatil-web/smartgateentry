import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Briefcase, Star, X, CheckCircle, AlertCircle, Award, Share2 } from 'lucide-react';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { getInitials } from '../utils/validators';
import * as storage from '../utils/storage';

const CommonDirectory = () => {
    const { currentRole, currentUser } = useAuth();
    const { addDataItem, updateDataItem, deleteDataItem } = useData();
    const [directory, setDirectory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(null);
    const [showReviewsModal, setShowReviewsModal] = useState(null);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [ratingData, setRatingData] = useState({ rating: 5, review: '' });
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        mobile: '',
        email: '',
        address: '',
        description: '',
        services: '',
        rating: 0
    });

    const categories = [
        { value: 'all', label: 'All Services', icon: '🏢' },
        { value: 'plumber', label: 'Plumber', icon: '🔧' },
        { value: 'electrician', label: 'Electrician', icon: '⚡' },
        { value: 'carpenter', label: 'Carpenter', icon: '🪚' },
        { value: 'painter', label: 'Painter', icon: '🎨' },
        { value: 'cleaning', label: 'Cleaning Service', icon: '🧹' },
        { value: 'pest-control', label: 'Pest Control', icon: '🐛' },
        { value: 'appliance-repair', label: 'Appliance Repair', icon: '🔨' },
        { value: 'ac-repair', label: 'AC Repair', icon: '❄️' },
        { value: 'internet', label: 'Internet/Cable', icon: '📡' },
        { value: 'healthcare', label: 'Healthcare', icon: '⚕️' },
        { value: 'tutor', label: 'Tutor/Teacher', icon: '📚' },
        { value: 'delivery', label: 'Delivery Service', icon: '📦' },
        { value: 'courier', label: 'Courier', icon: '📮' },
        { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
        { value: 'restaurant', label: 'Restaurant/Catering', icon: '🍽️' },
        { value: 'salon', label: 'Salon/Beauty', icon: '💇' },
        { value: 'laundry', label: 'Laundry/Dry Cleaning', icon: '👔' },
        { value: 'other', label: 'Other', icon: '📋' }
    ];

    // Load directory on mount
    useEffect(() => {
        loadDirectory();
        // Check if user has accepted disclaimer
        const accepted = localStorage.getItem(`directory_disclaimer_accepted_${currentUser?.id}`);
        setDisclaimerAccepted(accepted === 'true');
    }, [currentUser]);

    const loadDirectory = async () => {
        try {
            const societyId = currentRole?.societyId || currentRole?.societyid;
            // Fetch from storage
            const data = await storage.getData('common_directory') || [];
            const filtered = data.filter(entry => 
                entry.societyId === societyId || entry.societyid === societyId
            );
            setDirectory(filtered);
        } catch (error) {
            console.error('Error loading directory:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const societyId = currentRole?.societyId || currentRole?.societyid;
            const entry = {
                ...formData,
                societyId: societyId,
                addedBy: currentRole.userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                verified: false,
                ratings: [],
                averageRating: 0
            };

            if (editingEntry) {
                await updateDataItem('common_directory', editingEntry.id, {
                    ...entry,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await addDataItem('common_directory', entry);
            }

            setShowAddModal(false);
            setEditingEntry(null);
            resetForm();
            loadDirectory();
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry. Please try again.');
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setFormData({
            name: entry.name,
            category: entry.category,
            mobile: entry.mobile,
            email: entry.email || '',
            address: entry.address || '',
            description: entry.description || '',
            services: entry.services || '',
            rating: entry.averageRating || 0
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteDataItem('common_directory', id);
                loadDirectory();
            } catch (error) {
                console.error('Error deleting entry:', error);
                alert('Failed to delete entry. Please try again.');
            }
        }
    };

    const handleAddRating = async (e) => {
        e.preventDefault();
        
        try {
            const entry = directory.find(e => e.id === showRatingModal.id);
            const newRating = {
                userId: currentUser.id,
                userName: currentUser.name,
                rating: ratingData.rating,
                review: ratingData.review,
                createdAt: new Date().toISOString()
            };

            const ratings = [...(entry.ratings || []), newRating];
            const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

            await updateDataItem('common_directory', entry.id, {
                ratings: ratings,
                averageRating: averageRating,
                totalRatings: ratings.length
            });

            setShowRatingModal(null);
            setRatingData({ rating: 5, review: '' });
            loadDirectory();
            alert('Rating added successfully!');
        } catch (error) {
            console.error('Error adding rating:', error);
            alert('Failed to add rating. Please try again.');
        }
    };

    const handleVerifyProvider = async (id) => {
        // Admin only feature
        if (currentRole?.role !== 'administrator' && currentRole?.role !== 'superadmin') {
            alert('Only administrators can verify providers.');
            return;
        }

        try {
            await updateDataItem('common_directory', id, {
                verified: true,
                verifiedBy: currentUser.id,
                verifiedAt: new Date().toISOString()
            });
            loadDirectory();
            alert('Provider verified successfully!');
        } catch (error) {
            console.error('Error verifying provider:', error);
            alert('Failed to verify provider. Please try again.');
        }
    };

    const handleShareProvider = (entry) => {
        const text = `${entry.name} - ${categories.find(c => c.value === entry.category)?.label}\n` +
                    `Phone: ${entry.mobile}\n` +
                    `${entry.description || ''}\n` +
                    `Recommended by ${entry.addedByName || 'a resident'}`;
        
        if (navigator.share) {
            navigator.share({
                title: entry.name,
                text: text
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Provider details copied to clipboard!');
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            mobile: '',
            email: '',
            address: '',
            description: '',
            services: '',
            rating: 0
        });
    };

    const filteredDirectory = directory.filter(entry => {
        const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.mobile.includes(searchTerm) ||
                            entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2>Common Directory</h2>
                <button className="btn btn-primary" onClick={() => {
                    if (!disclaimerAccepted) {
                        setShowDisclaimerModal(true);
                    } else {
                        setShowAddModal(true);
                    }
                }}>
                    <Plus size={18} />
                    Add Service Provider
                </button>
            </div>

            {/* Disclaimer Alert */}
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={20} />
                <div>
                    <strong>⚠️ Important Disclaimer</strong>
                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                        This directory is for information sharing only. The society/management is NOT responsible for the quality, 
                        reliability, or conduct of service providers. Users must verify credentials and exercise caution.
                        <button 
                            onClick={() => setShowDisclaimerModal(true)}
                            style={{ 
                                marginLeft: 'var(--space-2)', 
                                color: 'var(--primary-500)', 
                                textDecoration: 'underline',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                padding: 0
                            }}
                        >
                            Read Full Terms
                        </button>
                    </p>
                </div>
            </div>

            {/* Info Alert */}
            <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
                <AlertCircle size={20} />
                <div>
                    <strong>Community Directory</strong>
                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                        Share and discover trusted service providers recommended by your neighbors. 
                        Add contacts for plumbers, electricians, tutors, and more!
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name, phone, or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: 'var(--space-10)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            <span style={{ marginRight: 'var(--space-1)' }}>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Directory Entries */}
            {filteredDirectory.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No Service Providers"
                    description={searchTerm || selectedCategory !== 'all' 
                        ? "No providers match your search criteria."
                        : "Be the first to add a trusted service provider to help your community!"}
                    action={
                        <button className="btn btn-primary" onClick={() => {
                            if (!disclaimerAccepted) {
                                setShowDisclaimerModal(true);
                            } else {
                                setShowAddModal(true);
                            }
                        }}>
                            <Plus size={18} />
                            Add Service Provider
                        </button>
                    }
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredDirectory.map(entry => (
                        <div key={entry.id} className="card" style={{ position: 'relative' }}>
                            {/* Category Badge & Verified Badge */}
                            <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className="badge badge-info">
                                    {categories.find(c => c.value === entry.category)?.icon} {categories.find(c => c.value === entry.category)?.label}
                                </span>
                                {entry.verified && (
                                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <Award size={12} />
                                        Verified
                                    </span>
                                )}
                            </div>

                            {/* Provider Info */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                <div className="header-avatar" style={{ width: 48, height: 48, fontSize: 'var(--font-size-lg)' }}>
                                    {getInitials(entry.name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: 'var(--space-1)' }}>{entry.name}</h3>
                                    {entry.averageRating > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--warning-500)' }}>
                                                <Star size={14} fill="currentColor" />
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                                    {entry.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                            <button 
                                                className="btn btn-ghost btn-sm"
                                                style={{ padding: '2px 6px', fontSize: 'var(--font-size-xs)' }}
                                                onClick={() => setShowReviewsModal(entry)}
                                            >
                                                ({entry.totalRatings || entry.ratings?.length || 0} reviews)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {entry.description && (
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                                    {entry.description}
                                </p>
                            )}

                            {/* Services */}
                            {entry.services && (
                                <div style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                                        Services:
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>{entry.services}</div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                                    <a href={`tel:${entry.mobile}`} style={{ color: 'var(--primary-500)' }}>{entry.mobile}</a>
                                </div>
                                {entry.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                                        <a href={`mailto:${entry.email}`} style={{ color: 'var(--primary-500)' }}>{entry.email}</a>
                                    </div>
                                )}
                                {entry.address && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                        <MapPin size={14} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{entry.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                                <button className="btn btn-sm btn-primary" onClick={() => setShowRatingModal(entry)}>
                                    <Star size={14} />
                                    Rate
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => handleShareProvider(entry)}>
                                    <Share2 size={14} />
                                    Share
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(entry)}>
                                    <Edit size={14} />
                                    Edit
                                </button>
                                {(currentRole?.role === 'administrator' || currentRole?.role === 'superadmin') && !entry.verified && (
                                    <button className="btn btn-sm btn-success" onClick={() => handleVerifyProvider(entry.id)}>
                                        <Award size={14} />
                                        Verify
                                    </button>
                                )}
                                <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(entry.id)}>
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>

                            {/* Added by info */}
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                                Added {new Date(entry.createdAt).toLocaleDateString()}
                                {entry.addedByName && ` by ${entry.addedByName}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                    resetForm();
                }}
                title={editingEntry ? 'Edit Service Provider' : 'Add Service Provider'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select
                            className="form-input"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.filter(c => c.value !== 'all').map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mobile Number *</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="10-digit mobile number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Services Offered</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.services}
                            onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                            placeholder="e.g., Pipe repair, Installation, Emergency service"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Brief description about the service provider..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingEntry(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <CheckCircle size={18} />
                            {editingEntry ? 'Update' : 'Add'} Provider
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Rating Modal */}
            <Modal
                isOpen={showRatingModal !== null}
                onClose={() => {
                    setShowRatingModal(null);
                    setRatingData({ rating: 5, review: '' });
                }}
                title={`Rate ${showRatingModal?.name || 'Provider'}`}
            >
                <form onSubmit={handleAddRating}>
                    <div className="form-group">
                        <label className="form-label">Your Rating *</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingData({ ...ratingData, rating: star })}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        padding: 'var(--space-1)',
                                        color: star <= ratingData.rating ? 'var(--warning-500)' : 'var(--border-color)'
                                    }}
                                >
                                    <Star size={32} fill={star <= ratingData.rating ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                            {ratingData.rating === 1 && 'Poor'}
                            {ratingData.rating === 2 && 'Fair'}
                            {ratingData.rating === 3 && 'Good'}
                            {ratingData.rating === 4 && 'Very Good'}
                            {ratingData.rating === 5 && 'Excellent'}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Your Review (Optional)</label>
                        <textarea
                            className="form-input"
                            value={ratingData.review}
                            onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                            rows={4}
                            placeholder="Share your experience with this service provider..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowRatingModal(null);
                                setRatingData({ rating: 5, review: '' });
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Star size={18} />
                            Submit Rating
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reviews Modal */}
            <Modal
                isOpen={showReviewsModal !== null}
                onClose={() => setShowReviewsModal(null)}
                title={`Reviews for ${showReviewsModal?.name || 'Provider'}`}
            >
                <div>
                    {/* Overall Rating Summary */}
                    {showReviewsModal && (
                        <div style={{ 
                            padding: 'var(--space-4)', 
                            background: 'var(--surface-secondary)', 
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-4)',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <Star size={32} fill="var(--warning-500)" color="var(--warning-500)" />
                                <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                                    {showReviewsModal.averageRating?.toFixed(1) || '0.0'}
                                </span>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                Based on {showReviewsModal.totalRatings || showReviewsModal.ratings?.length || 0} reviews
                            </div>
                        </div>
                    )}

                    {/* Individual Reviews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {showReviewsModal?.ratings?.length > 0 ? (
                            showReviewsModal.ratings
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((rating, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            padding: 'var(--space-4)', 
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div className="header-avatar" style={{ width: 32, height: 32, fontSize: 'var(--font-size-sm)' }}>
                                                    {getInitials(rating.userName)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                        {rating.userName}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                        {new Date(rating.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={14} 
                                                        fill={star <= rating.rating ? 'var(--warning-500)' : 'none'}
                                                        color={star <= rating.rating ? 'var(--warning-500)' : 'var(--border-color)'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {rating.review && (
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                                {rating.review}
                                            </p>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                <Star size={48} style={{ marginBottom: 'var(--space-3)', opacity: 0.3 }} />
                                <p>No reviews yet</p>
                                <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
                                    Be the first to review this provider!
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowReviewsModal(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Disclaimer Modal */}
            <Modal
                isOpen={showDisclaimerModal}
                onClose={() => setShowDisclaimerModal(false)}
                title="⚠️ Common Directory - Terms & Disclaimer"
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Please Read Carefully</strong>
                            <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                By adding service providers to this directory, you agree to these terms and understand the limitations.
                            </p>
                        </div>
                    </div>

                    <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                        <h3 style={{ marginBottom: 'var(--space-3)' }}>1. Directory Purpose</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The Common Directory is a FREE information-sharing platform for residents to share contact details of service providers 
                            they have used or recommend. It is NOT an endorsement or guarantee of service quality.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>2. No Liability</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            <strong>The society, management, and app developers are NOT responsible for:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Quality, reliability, or professionalism of service providers</li>
                            <li>Accuracy of contact information or service descriptions</li>
                            <li>Work performed by service providers</li>
                            <li>Pricing, billing, or payment disputes</li>
                            <li>Damages, losses, or injuries caused by service providers</li>
                            <li>Fraud, scams, or misconduct by service providers</li>
                            <li>Data misuse or privacy breaches</li>
                            <li>Ratings and reviews (user opinions only)</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>3. User Responsibility</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            <strong>You are solely responsible for:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Verifying credentials and background of service providers</li>
                            <li>Checking references and past work</li>
                            <li>Negotiating prices and terms of service</li>
                            <li>Ensuring proper contracts and agreements</li>
                            <li>Supervising work and ensuring quality</li>
                            <li>Protecting your property and belongings</li>
                            <li>Accuracy of information you add to directory</li>
                            <li>Getting permission before adding someone's contact details</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>4. Privacy & Data Protection</h3>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Only add publicly available contact information</li>
                            <li>Get consent before adding someone's details</li>
                            <li>Information is visible to all society residents</li>
                            <li>Do NOT add sensitive personal information</li>
                            <li>Contact details may be used by residents to reach providers</li>
                            <li>You are responsible for respecting others' privacy</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>5. Ratings & Reviews</h3>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Ratings and reviews are personal opinions only</li>
                            <li>Society/management does not verify or endorse reviews</li>
                            <li>Be honest and fair in your reviews</li>
                            <li>Do not post false, defamatory, or malicious reviews</li>
                            <li>Reviews may be removed if inappropriate</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>6. Verification Badge</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The "Verified" badge indicates administrative verification of basic information only. 
                            It does NOT guarantee quality, reliability, or endorse the service provider.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>7. Prohibited Activities</h3>
                        <p style={{ marginBottom: 'var(--space-2)' }}>
                            <strong>The following are strictly prohibited:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Adding fake or fraudulent service providers</li>
                            <li>Adding contact details without permission</li>
                            <li>Posting false or misleading information</li>
                            <li>Harassment or defamation</li>
                            <li>Spam or duplicate entries</li>
                            <li>Sharing others' personal information maliciously</li>
                            <li>Commercial advertising (unless genuine service)</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>8. Safety Guidelines</h3>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Always verify identity and credentials</li>
                            <li>Check references from other users</li>
                            <li>Get written quotes and agreements</li>
                            <li>Never pay full amount in advance</li>
                            <li>Supervise work being done</li>
                            <li>Keep valuables secure during service</li>
                            <li>Report suspicious behavior immediately</li>
                            <li>Trust your instincts - if unsure, don't proceed</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>9. Content Moderation</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The society management reserves the right to remove any entry, rating, or review that violates these terms 
                            or is deemed inappropriate, without prior notice.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>10. No Warranty</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The directory is provided "AS IS" without any warranties. We do not guarantee the accuracy, 
                            reliability, or availability of information.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>11. Dispute Resolution</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            Any disputes with service providers must be resolved directly between you and the provider. 
                            The society management is not obligated to mediate or resolve such disputes.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>12. Changes to Terms</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            These terms may be updated at any time. Continued use of the directory constitutes acceptance of updated terms.
                        </p>

                        <div className="alert alert-danger" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <AlertCircle size={20} />
                            <div>
                                <strong>⚠️ Final Warning</strong>
                                <p style={{ marginTop: 'var(--space-1)' }}>
                                    By clicking "I Accept", you acknowledge that you have read, understood, and agree to these terms. 
                                    You understand that the directory is for information sharing only and the society/management bears NO responsibility 
                                    for service quality, disputes, or any issues with service providers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowDisclaimerModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setDisclaimerAccepted(true);
                            localStorage.setItem(`directory_disclaimer_accepted_${currentUser?.id}`, 'true');
                            setShowDisclaimerModal(false);
                            setShowAddModal(true);
                        }}
                    >
                        <CheckCircle size={18} />
                        I Accept - Proceed to Add
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CommonDirectory;
