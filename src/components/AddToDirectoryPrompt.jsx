import { useState } from 'react';
import { CheckCircle, X, UserPlus, AlertCircle } from 'lucide-react';

/**
 * Prompt to add visitor to Common Directory
 * Shows after resident approves a visitor with service-related purpose
 */
const AddToDirectoryPrompt = ({ visitor, onAdd, onSkip, onClose }) => {
    const [formData, setFormData] = useState({
        name: visitor.name || '',
        category: suggestCategory(visitor.purpose),
        mobile: visitor.contactNumber || visitor.contactnumber || '',
        email: '',
        address: '',
        description: '',
        services: ''
    });

    const categories = [
        { value: 'plumber', label: 'Plumber', keywords: ['plumber', 'plumbing', 'pipe', 'leak', 'water'] },
        { value: 'electrician', label: 'Electrician', keywords: ['electrician', 'electrical', 'wiring', 'electric'] },
        { value: 'carpenter', label: 'Carpenter', keywords: ['carpenter', 'carpentry', 'wood', 'furniture'] },
        { value: 'painter', label: 'Painter', keywords: ['painter', 'painting', 'paint'] },
        { value: 'cleaning', label: 'Cleaning Service', keywords: ['cleaning', 'cleaner', 'housekeeping', 'maid'] },
        { value: 'pest-control', label: 'Pest Control', keywords: ['pest', 'termite', 'cockroach', 'rat'] },
        { value: 'appliance-repair', label: 'Appliance Repair', keywords: ['appliance', 'repair', 'washing machine', 'refrigerator'] },
        { value: 'ac-repair', label: 'AC Repair', keywords: ['ac', 'air conditioner', 'cooling', 'hvac'] },
        { value: 'internet', label: 'Internet/Cable', keywords: ['internet', 'wifi', 'cable', 'broadband'] },
        { value: 'healthcare', label: 'Healthcare', keywords: ['doctor', 'nurse', 'healthcare', 'medical', 'physiotherapy'] },
        { value: 'tutor', label: 'Tutor/Teacher', keywords: ['tutor', 'teacher', 'coaching', 'education'] },
        { value: 'delivery', label: 'Delivery Service', keywords: ['delivery'] },
        { value: 'courier', label: 'Courier', keywords: ['courier'] },
        { value: 'other', label: 'Other Service', keywords: [] }
    ];

    function suggestCategory(purpose) {
        if (!purpose) return 'other';
        
        const purposeLower = purpose.toLowerCase();
        for (const cat of categories) {
            if (cat.keywords.some(keyword => purposeLower.includes(keyword))) {
                return cat.value;
            }
        }
        return 'other';
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Add to Common Directory?</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Help Your Community!</strong>
                            <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                This visitor's purpose suggests they're a service provider. 
                                Would you like to add them to the Common Directory so other residents can find them?
                            </p>
                        </div>
                    </div>

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
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <div className="form-hint">
                                Suggested based on purpose: "{visitor.purpose}"
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile Number *</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email (Optional)</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Services Offered (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.services}
                                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                                placeholder="e.g., Pipe repair, Installation, Emergency service"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                placeholder="Brief description..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onSkip}
                            >
                                Skip
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <UserPlus size={18} />
                                Add to Directory
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddToDirectoryPrompt;
