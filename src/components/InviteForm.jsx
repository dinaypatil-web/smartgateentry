import React, { useState } from 'react';
import { Ticket, User, Phone, Calendar, FileText, Send, X, Smartphone, QrCode } from 'lucide-react';

const InviteForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        contactNumber: initialData.contactNumber || '',
        purpose: initialData.purpose || '',
        expectedDate: initialData.expectedDate || new Date().toISOString().split('T')[0],
        type: initialData.type || 'guest'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'guest': return 'var(--primary-500)';
            case 'delivery': return 'var(--warning-500)';
            case 'service': return 'var(--info-500)';
            default: return 'var(--primary-500)';
        }
    };

    return (
        <div className="invite-form-container">
            <div className="form-preview-split">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="invite-form-main">
                    <div className="form-group mb-4">
                        <label className="form-label">Visitor Name</label>
                        <div className="input-with-icon">
                            <User size={18} />
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Full Name"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Contact Number</label>
                        <div className="input-with-icon">
                            <Phone size={18} />
                            <input
                                type="tel"
                                name="contactNumber"
                                className="form-input"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                                placeholder="10-digit mobile"
                                pattern="[0-9]{10}"
                            />
                        </div>
                    </div>

                    <div className="grid-2 gap-4">
                        <div className="form-group mb-4">
                            <label className="form-label">Expected Date</label>
                            <input
                                type="date"
                                name="expectedDate"
                                className="form-input"
                                value={formData.expectedDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">Guest Type</label>
                            <select
                                name="type"
                                className="form-select"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="guest">Guest / Relative</option>
                                <option value="delivery">Delivery</option>
                                <option value="service">Service Provider</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Purpose of Visit</label>
                        <textarea
                            name="purpose"
                            className="form-textarea"
                            rows="3"
                            value={formData.purpose}
                            onChange={handleChange}
                            placeholder="e.g., Dinner, AC Repair, Package delivery"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            <X size={18} />
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!formData.name || !formData.contactNumber}>
                            <Ticket size={18} />
                            Generate Pass
                        </button>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="invite-preview-section">
                    <div className="preview-header">
                        <Smartphone size={16} />
                        <span>Visitor Pass Preview</span>
                    </div>

                    <div className="pass-container">
                        <div className={`modern-pass ${formData.type}`}>
                            <div className="pass-decoration" style={{ background: getTypeColor(formData.type) }}></div>

                            <div className="pass-header">
                                <div className="pass-logo">
                                    <Ticket size={24} />
                                </div>
                                <div className="pass-type-label">
                                    {formData.type.toUpperCase()} PASS
                                </div>
                            </div>

                            <div className="pass-body">
                                <div className="pass-visitor-info">
                                    <div className="pass-label">VISITOR</div>
                                    <div className="pass-value-large">{formData.name || 'Visitor Name'}</div>
                                    <div className="pass-contact">{formData.contactNumber || 'Contact Number'}</div>
                                </div>

                                <div className="pass-qr-sim">
                                    <QrCode size={80} strokeWidth={1} />
                                    <div className="qr-scan-line"></div>
                                </div>
                            </div>

                            <div className="pass-footer">
                                <div className="pass-detail">
                                    <div className="pass-label">DATE</div>
                                    <div className="pass-value">{formData.expectedDate}</div>
                                </div>
                                <div className="pass-detail">
                                    <div className="pass-label">PURPOSE</div>
                                    <div className="pass-value truncate">{formData.purpose || 'General Visit'}</div>
                                </div>
                            </div>

                            <div className="pass-status-overlay">
                                <span>VALID PASS</span>
                            </div>
                        </div>
                        <p className="pass-hint text-center mt-4 text-xs text-muted">
                            This is how the pass will appear on the visitor's phone.
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .invite-form-container { width: 100%; }
                .form-preview-split {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                @media (max-width: 992px) {
                    .form-preview-split { grid-template-columns: 1fr; }
                }

                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-with-icon svg {
                    position: absolute;
                    left: 12px;
                    color: var(--text-muted);
                }

                .input-with-icon .form-input {
                    padding-left: 40px;
                }

                .invite-preview-section {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: var(--radius-2xl);
                    border: 1px dashed var(--border-color);
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .preview-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 2rem;
                    width: 100%;
                }

                .pass-container {
                    width: 100%;
                    max-width: 320px;
                    perspective: 1000px;
                }

                .modern-pass {
                    background: #ffffff;
                    color: #1a1b1e;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    position: relative;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transform: rotateY(-5deg);
                    transition: all 0.5s ease;
                }
                
                .modern-pass:hover {
                    transform: rotateY(0deg) translateY(-10px);
                }

                .pass-decoration {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 150px;
                    height: 150px;
                    border-radius: 0 0 0 100%;
                    opacity: 0.1;
                    pointer-events: none;
                }

                .pass-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pass-logo {
                    width: 48px;
                    height: 48px;
                    background: #f1f3f5;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #495057;
                }

                .pass-type-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    color: #868e96;
                }

                .pass-body {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pass-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #adb5bd;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .pass-value-large {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #212529;
                    line-height: 1.2;
                }

                .pass-contact {
                    font-size: 0.75rem;
                    color: #495057;
                }

                .pass-qr-sim {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #212529;
                    position: relative;
                    overflow: hidden;
                }

                .qr-scan-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary-500);
                    box-shadow: 0 0 8px var(--primary-500);
                    animation: scan 2s infinite ease-in-out;
                }

                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }

                .pass-footer {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed #e9ecef;
                }

                .pass-value {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #495057;
                }

                .truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pass-status-overlay {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #212529;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px 0 0 0;
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                }

                .modern-pass.guest { border-top: 6px solid var(--primary-500); }
                .modern-pass.delivery { border-top: 6px solid var(--warning-500); }
                .modern-pass.service { border-top: 6px solid var(--info-500); }
                
                .modern-pass.guest .pass-logo { color: var(--primary-500); background: var(--primary-50); }
                .modern-pass.delivery .pass-logo { color: var(--warning-500); background: var(--warning-50); }
                .modern-pass.service .pass-logo { color: var(--info-500); background: var(--info-50); }
            ` }} />
        </div>
    );
};

export default InviteForm;
