import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, Plus, Edit, Trash2, Phone, Mail, User, X, CheckCircle, AlertCircle, Image as ImageIcon, FileText, DollarSign, Home, Briefcase, Package, BookOpen, Car, Sofa, Laptop } from 'lucide-react';
import Modal from './Modal';
import EmptyState from './EmptyState';
import * as storage from '../utils/storage';

const CommunityBoard = () => {
    const { currentRole, currentUser } = useAuth();
    const { addDataItem, updateDataItem, deleteDataItem } = useData();
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [viewingPost, setViewingPost] = useState(null);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        type: 'sell',
        price: '',
        condition: '',
        contactName: '',
        contactMobile: '',
        contactEmail: '',
        attachments: []
    });

    const categories = [
        { value: 'all', label: 'All Categories', icon: Package },
        { value: 'furniture', label: 'Furniture', icon: Sofa },
        { value: 'electronics', label: 'Electronics', icon: Laptop },
        { value: 'vehicles', label: 'Vehicles', icon: Car },
        { value: 'books', label: 'Books & Media', icon: BookOpen },
        { value: 'appliances', label: 'Appliances', icon: Home },
        { value: 'services', label: 'Services', icon: Briefcase },
        { value: 'other', label: 'Other', icon: Package }
    ];

    const types = [
        { value: 'all', label: 'All Types' },
        { value: 'sell', label: 'For Sale' },
        { value: 'rent', label: 'For Rent' },
        { value: 'service', label: 'Service Offered' }
    ];

    const conditions = [
        { value: 'new', label: 'Brand New' },
        { value: 'like-new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'used', label: 'Used' }
    ];

    useEffect(() => {
        loadPosts();
        // Check if user has accepted disclaimer
        const accepted = localStorage.getItem(`disclaimer_accepted_${currentUser?.id}`);
        setDisclaimerAccepted(accepted === 'true');
    }, [currentUser]);

    const loadPosts = async () => {
        try {
            const societyId = currentRole?.societyId || currentRole?.societyid;
            const data = await storage.getData('community_board') || [];
            const filtered = data.filter(post => 
                post.societyId === societyId || post.societyid === societyId
            );
            setPosts(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            return (isImage || isPDF) && isValidSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were skipped. Only images and PDFs under 5MB are allowed.');
        }

        // Convert to base64 for storage
        Promise.all(validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        data: reader.result
                    });
                };
                reader.readAsDataURL(file);
            });
        })).then(attachments => {
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...attachments]
            }));
        });
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const societyId = currentRole?.societyId || currentRole?.societyid;
            const post = {
                ...formData,
                societyId: societyId,
                postedBy: currentUser.id,
                postedByName: currentUser.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active'
            };

            if (editingPost) {
                await updateDataItem('community_board', editingPost.id, {
                    ...post,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await addDataItem('community_board', post);
            }

            setShowAddModal(false);
            setEditingPost(null);
            resetForm();
            loadPosts();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post. Please try again.');
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            description: post.description,
            category: post.category,
            type: post.type,
            price: post.price || '',
            condition: post.condition || '',
            contactName: post.contactName,
            contactMobile: post.contactMobile,
            contactEmail: post.contactEmail || '',
            attachments: post.attachments || []
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDataItem('community_board', id);
                loadPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            type: 'sell',
            price: '',
            condition: '',
            contactName: currentUser?.name || '',
            contactMobile: '',
            contactEmail: currentUser?.email || '',
            attachments: []
        });
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesType = selectedType === 'all' || post.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const getTypeLabel = (type) => {
        return types.find(t => t.value === type)?.label || type;
    };

    const getTypeBadgeClass = (type) => {
        switch(type) {
            case 'sell': return 'badge-success';
            case 'rent': return 'badge-warning';
            case 'service': return 'badge-info';
            default: return 'badge-secondary';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2>Community Board</h2>
                <button className="btn btn-primary" onClick={() => {
                    if (!disclaimerAccepted) {
                        setShowDisclaimerModal(true);
                    } else {
                        resetForm();
                        setShowAddModal(true);
                    }
                }}>
                    <Plus size={18} />
                    Post Advertisement
                </button>
            </div>

            {/* Disclaimer Alert */}
            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={20} />
                <div>
                    <strong>⚠️ Important Disclaimer</strong>
                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                        This is a community platform for residents only. The society/management is NOT responsible for any transactions, disputes, or misuse of information. 
                        Users are solely responsible for verifying details and conducting safe transactions.
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
                    <strong>Community Marketplace</strong>
                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                        Buy, sell, rent items or offer services within your community. Connect directly with your neighbors!
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: 'var(--space-10)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Type Filter */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                    {types.map(type => (
                        <button
                            key={type.value}
                            className={`btn btn-sm ${selectedType === type.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setSelectedType(type.value)}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.value}
                                className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setSelectedCategory(cat.value)}
                            >
                                <Icon size={14} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No Posts Yet"
                    description={searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                        ? "No posts match your search criteria."
                        : "Be the first to post an advertisement on the community board!"}
                    action={
                        <button className="btn btn-primary" onClick={() => {
                            if (!disclaimerAccepted) {
                                setShowDisclaimerModal(true);
                            } else {
                                resetForm();
                                setShowAddModal(true);
                            }
                        }}>
                            <Plus size={18} />
                            Post Advertisement
                        </button>
                    }
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredPosts.map(post => {
                        const CategoryIcon = categories.find(c => c.value === post.category)?.icon || Package;
                        return (
                            <div key={post.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setViewingPost(post)}>
                                {/* Type Badge */}
                                <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>
                                    <span className={`badge ${getTypeBadgeClass(post.type)}`}>
                                        {getTypeLabel(post.type)}
                                    </span>
                                </div>

                                {/* Image Preview */}
                                {post.attachments?.length > 0 && post.attachments[0].type.startsWith('image/') && (
                                    <div style={{ 
                                        width: '100%', 
                                        height: '200px', 
                                        overflow: 'hidden', 
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-3)',
                                        background: 'var(--surface-secondary)'
                                    }}>
                                        <img 
                                            src={post.attachments[0].data} 
                                            alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                {/* Post Info */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                    <CategoryIcon size={24} style={{ color: 'var(--primary-500)', marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: 'var(--space-1)' }}>{post.title}</h3>
                                        {post.price && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--success-500)', fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                                                <DollarSign size={16} />
                                                ₹{post.price}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{ 
                                    fontSize: 'var(--font-size-sm)', 
                                    color: 'var(--text-secondary)', 
                                    marginBottom: 'var(--space-3)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {post.description}
                                </p>

                                {/* Condition */}
                                {post.condition && (
                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <span className="badge badge-secondary">
                                            {conditions.find(c => c.value === post.condition)?.label}
                                        </span>
                                    </div>
                                )}

                                {/* Attachments Count */}
                                {post.attachments?.length > 0 && (
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                            <ImageIcon size={14} />
                                            {post.attachments.filter(a => a.type.startsWith('image/')).length} photos
                                        </span>
                                        {post.attachments.filter(a => a.type === 'application/pdf').length > 0 && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                                <FileText size={14} />
                                                {post.attachments.filter(a => a.type === 'application/pdf').length} PDFs
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Posted By */}
                                <div style={{ 
                                    paddingTop: 'var(--space-3)', 
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                        Posted by {post.postedByName}
                                        <br />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                    {post.postedBy === currentUser?.id && (
                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }} onClick={(e) => e.stopPropagation()}>
                                            <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(post)}>
                                                <Edit size={14} />
                                            </button>
                                            <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(post.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingPost(null);
                    resetForm();
                }}
                title={editingPost ? 'Edit Post' : 'Post Advertisement'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Sofa Set for Sale"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Type *</label>
                        <select
                            className="form-input"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            {types.filter(t => t.value !== 'all').map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
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
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Describe your item or service in detail..."
                            required
                        />
                    </div>

                    {formData.type !== 'service' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Price (₹) {formData.type === 'rent' ? 'per month' : ''}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="Enter price"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Condition</label>
                                <select
                                    className="form-input"
                                    value={formData.condition}
                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                >
                                    <option value="">Select Condition</option>
                                    {conditions.map(cond => (
                                        <option key={cond.value} value={cond.value}>
                                            {cond.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Contact Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Mobile *</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={formData.contactMobile}
                            onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                            placeholder="10-digit mobile number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Attachments (Photos/PDFs)</label>
                        <input
                            type="file"
                            className="form-input"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileChange}
                        />
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                            Max 5MB per file. Images and PDFs only.
                        </div>
                    </div>

                    {/* Attachments Preview */}
                    {formData.attachments.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Attached Files</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {formData.attachments.map((file, index) => (
                                    <div 
                                        key={index}
                                        style={{ 
                                            position: 'relative',
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        {file.type.startsWith('image/') ? (
                                            <img 
                                                src={file.data} 
                                                alt={file.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                background: 'var(--surface-secondary)'
                                            }}>
                                                <FileText size={32} color="var(--text-muted)" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                background: 'var(--danger-500)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingPost(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <CheckCircle size={18} />
                            {editingPost ? 'Update' : 'Post'} Advertisement
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Post Modal */}
            <Modal
                isOpen={viewingPost !== null}
                onClose={() => setViewingPost(null)}
                title={viewingPost?.title || 'Post Details'}
            >
                {viewingPost && (
                    <div>
                        {/* Type Badge */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <span className={`badge ${getTypeBadgeClass(viewingPost.type)}`}>
                                {getTypeLabel(viewingPost.type)}
                            </span>
                            <span className="badge badge-secondary" style={{ marginLeft: 'var(--space-2)' }}>
                                {categories.find(c => c.value === viewingPost.category)?.label}
                            </span>
                        </div>

                        {/* Price */}
                        {viewingPost.price && (
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-2)', 
                                color: 'var(--success-500)', 
                                fontWeight: 700, 
                                fontSize: '1.5rem',
                                marginBottom: 'var(--space-4)'
                            }}>
                                <DollarSign size={24} />
                                ₹{viewingPost.price}
                                {viewingPost.type === 'rent' && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400 }}>/month</span>}
                            </div>
                        )}

                        {/* Condition */}
                        {viewingPost.condition && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <strong>Condition:</strong> {conditions.find(c => c.value === viewingPost.condition)?.label}
                            </div>
                        )}

                        {/* Description */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <strong>Description:</strong>
                            <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                {viewingPost.description}
                            </p>
                        </div>

                        {/* Attachments */}
                        {viewingPost.attachments?.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <strong>Attachments:</strong>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                    {viewingPost.attachments.map((file, index) => (
                                        <div key={index}>
                                            {file.type.startsWith('image/') ? (
                                                <img 
                                                    src={file.data} 
                                                    alt={file.name}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '150px', 
                                                        objectFit: 'cover',
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.open(file.data, '_blank')}
                                                />
                                            ) : (
                                                <a 
                                                    href={file.data} 
                                                    download={file.name}
                                                    style={{ 
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 'var(--space-4)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius-md)',
                                                        textDecoration: 'none',
                                                        color: 'var(--text-primary)',
                                                        height: '150px'
                                                    }}
                                                >
                                                    <FileText size={48} color="var(--text-muted)" />
                                                    <span style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
                                                        {file.name}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div style={{ 
                            padding: 'var(--space-4)', 
                            background: 'var(--surface-secondary)', 
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-4)'
                        }}>
                            <strong style={{ display: 'block', marginBottom: 'var(--space-3)' }}>Contact Information:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span>{viewingPost.contactName}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                    <a href={`tel:${viewingPost.contactMobile}`} style={{ color: 'var(--primary-500)' }}>
                                        {viewingPost.contactMobile}
                                    </a>
                                </div>
                                {viewingPost.contactEmail && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                        <a href={`mailto:${viewingPost.contactEmail}`} style={{ color: 'var(--primary-500)' }}>
                                            {viewingPost.contactEmail}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Posted By */}
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                            Posted by {viewingPost.postedByName} on {new Date(viewingPost.createdAt).toLocaleDateString()}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                            {viewingPost.postedBy === currentUser?.id && (
                                <>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setViewingPost(null);
                                            handleEdit(viewingPost);
                                        }}
                                    >
                                        <Edit size={18} />
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setViewingPost(null);
                                            handleDelete(viewingPost.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={() => setViewingPost(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Disclaimer Modal */}
            <Modal
                isOpen={showDisclaimerModal}
                onClose={() => setShowDisclaimerModal(false)}
                title="⚠️ Community Board - Terms & Disclaimer"
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Please Read Carefully</strong>
                            <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                By using the Community Board, you agree to these terms and understand the risks involved.
                            </p>
                        </div>
                    </div>

                    <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                        <h3 style={{ marginBottom: 'var(--space-3)' }}>1. Platform Purpose</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The Community Board is a FREE platform provided for residents to connect with each other for buying, selling, renting items, or offering services. 
                            It is NOT a commercial marketplace and is intended for personal, non-commercial use only.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>2. No Liability</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            <strong>The society, management, and app developers are NOT responsible for:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Quality, condition, or authenticity of items/services</li>
                            <li>Accuracy of information in posts</li>
                            <li>Disputes between buyers and sellers</li>
                            <li>Financial losses or damages</li>
                            <li>Fraud, scams, or misrepresentation</li>
                            <li>Personal injury or property damage</li>
                            <li>Data misuse or privacy breaches by users</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>3. User Responsibility</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            <strong>You are solely responsible for:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Verifying the identity of buyers/sellers</li>
                            <li>Inspecting items before purchase</li>
                            <li>Negotiating prices and terms</li>
                            <li>Ensuring safe transactions and meetings</li>
                            <li>Protecting your personal information</li>
                            <li>Complying with all applicable laws</li>
                            <li>Accuracy of your posts and contact information</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>4. Privacy & Data Protection</h3>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Only share contact information you're comfortable making public</li>
                            <li>Your posts are visible to all society residents</li>
                            <li>Do NOT share sensitive personal information (bank details, passwords, etc.)</li>
                            <li>You are responsible for protecting your own privacy</li>
                            <li>Contact information may be used by other residents to reach you</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>5. Prohibited Activities</h3>
                        <p style={{ marginBottom: 'var(--space-2)' }}>
                            <strong>The following are strictly prohibited:</strong>
                        </p>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Posting illegal items or services</li>
                            <li>Fraudulent or misleading advertisements</li>
                            <li>Harassment or abusive behavior</li>
                            <li>Spam or duplicate posts</li>
                            <li>Commercial business advertisements (unless personal services)</li>
                            <li>Sharing others' personal information without consent</li>
                            <li>Posting offensive or inappropriate content</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>6. Safety Guidelines</h3>
                        <ul style={{ marginBottom: 'var(--space-3)', paddingLeft: 'var(--space-6)' }}>
                            <li>Meet in public/common areas within the society</li>
                            <li>Bring someone with you for high-value transactions</li>
                            <li>Inspect items thoroughly before payment</li>
                            <li>Use secure payment methods</li>
                            <li>Get written receipts for valuable items</li>
                            <li>Report suspicious activity to society management</li>
                            <li>Trust your instincts - if something feels wrong, walk away</li>
                        </ul>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>7. Content Moderation</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The society management reserves the right to remove any post that violates these terms or is deemed inappropriate, 
                            without prior notice. Repeated violations may result in restricted access.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>8. No Warranty</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            The platform is provided "AS IS" without any warranties. We do not guarantee the accuracy, reliability, or availability of the service.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>9. Dispute Resolution</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            Any disputes arising from transactions must be resolved directly between the parties involved. 
                            The society management may facilitate communication but is not obligated to mediate or resolve disputes.
                        </p>

                        <h3 style={{ marginBottom: 'var(--space-3)' }}>10. Changes to Terms</h3>
                        <p style={{ marginBottom: 'var(--space-3)' }}>
                            These terms may be updated at any time. Continued use of the Community Board constitutes acceptance of updated terms.
                        </p>

                        <div className="alert alert-danger" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <AlertCircle size={20} />
                            <div>
                                <strong>⚠️ Final Warning</strong>
                                <p style={{ marginTop: 'var(--space-1)' }}>
                                    By clicking "I Accept", you acknowledge that you have read, understood, and agree to these terms. 
                                    You understand that all transactions are at your own risk and the society/management bears NO responsibility.
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
                            localStorage.setItem(`disclaimer_accepted_${currentUser?.id}`, 'true');
                            setShowDisclaimerModal(false);
                            resetForm();
                            setShowAddModal(true);
                        }}
                    >
                        <CheckCircle size={18} />
                        I Accept - Proceed to Post
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CommunityBoard;
