import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { generateTemplate, parseExcelFile } from '../utils/excelUtils';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import * as storage from '../utils/storage';

const BulkUpload = ({ onClose }) => {
    const [selectedType, setSelectedType] = useState('residents');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const { addUser, refreshData } = useData();
    const { currentRole } = useAuth();

    const uploadTypes = [
        { value: 'residents', label: 'Residents', icon: '🏠' },
        { value: 'security', label: 'Security Personnel', icon: '🛡️' },
        { value: 'staff', label: 'Staff Members', icon: '👷' }
    ];

    const handleDownloadTemplate = () => {
        try {
            generateTemplate(selectedType);
        } catch (error) {
            alert(`Failed to download template: ${error.message}`);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                alert('Please select a valid Excel file (.xlsx or .xls)');
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            // Parse Excel file
            const parseResult = await parseExcelFile(file, selectedType);

            if (parseResult.errorRows > 0) {
                setResult(parseResult);
                setUploading(false);
                return;
            }

            // Process valid records
            const societyId = currentRole?.societyId || currentRole?.societyid;
            const successCount = [];
            const failedCount = [];

            for (const record of parseResult.valid) {
                try {
                    if (selectedType === 'residents') {
                        await addUser({
                            name: record.name,
                            email: record.email,
                            mobile: record.mobile,
                            loginName: record.loginName,
                            password: record.password,
                            roles: [{
                                role: 'resident',
                                societyId: societyId,
                                status: 'approved',
                                flatNumber: record.flatNumber,
                                wing: record.wing || '',
                                floor: record.floor || '',
                                ownershipType: record.ownershipType || 'owner'
                            }]
                        });
                    } else if (selectedType === 'security') {
                        await addUser({
                            name: record.name,
                            email: record.email,
                            mobile: record.mobile,
                            loginName: record.loginName,
                            password: record.password,
                            roles: [{
                                role: 'security',
                                societyId: societyId,
                                status: 'approved',
                                shift: record.shift || '',
                                idNumber: record.idNumber || ''
                            }]
                        });
                    } else if (selectedType === 'staff') {
                        const staffData = {
                            id: storage.generateId(),
                            name: record.name,
                            role: record.role,
                            mobile: record.mobile,
                            email: record.email || '',
                            idNumber: record.idNumber || '',
                            shift: record.shift || '',
                            salary: record.salary || '',
                            joinDate: record.joinDate || new Date().toISOString().split('T')[0],
                            societyId: societyId,
                            status: 'active',
                            createdAt: new Date().toISOString()
                        };
                        await storage.addData('staff', staffData);
                    }
                    successCount.push(record);
                } catch (error) {
                    console.error('Failed to add record:', record, error);
                    failedCount.push({ record, error: error.message });
                }
            }

            await refreshData();

            setResult({
                ...parseResult,
                successCount: successCount.length,
                failedCount: failedCount.length,
                failed: failedCount
            });

        } catch (error) {
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2>Bulk Upload</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Type Selection */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="form-label">Select Upload Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                            {uploadTypes.map(type => (
                                <button
                                    key={type.value}
                                    className={`card ${selectedType === type.value ? 'card-active' : ''}`}
                                    style={{
                                        padding: 'var(--space-4)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: selectedType === type.value ? '2px solid var(--primary-500)' : '1px solid var(--border-color)'
                                    }}
                                    onClick={() => {
                                        setSelectedType(type.value);
                                        handleReset();
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{type.icon}</div>
                                    <div style={{ fontWeight: 600 }}>{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Download Template */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <FileSpreadsheet size={32} style={{ color: 'var(--primary-500)' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: 'var(--space-1)' }}>Step 1: Download Template</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                    Download the Excel template, fill in the data, and upload it back
                                </p>
                            </div>
                            <button className="btn btn-primary" onClick={handleDownloadTemplate}>
                                <Download size={18} />
                                Download Template
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ marginBottom: 'var(--space-4)' }}>Step 2: Upload Filled Excel</h3>
                        <div
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-8)',
                                textAlign: 'center',
                                background: 'var(--bg-tertiary)'
                            }}
                        >
                            <Upload size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-4)' }} />
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                id="excel-upload"
                            />
                            <label htmlFor="excel-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                Choose Excel File
                            </label>
                            {file && (
                                <div style={{ marginTop: 'var(--space-4)', color: 'var(--text-primary)' }}>
                                    <CheckCircle size={20} style={{ color: 'var(--success-500)', display: 'inline', marginRight: 'var(--space-2)' }} />
                                    {file.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Button */}
                    {file && !result && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={handleReset}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? 'Processing...' : 'Upload & Process'}
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="card">
                            <h3 style={{ marginBottom: 'var(--space-4)' }}>Upload Results</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                <div className="stat-card" style={{ background: 'var(--info-50)', borderColor: 'var(--info-200)' }}>
                                    <div className="stat-value">{result.totalRows}</div>
                                    <div className="stat-label">Total Rows</div>
                                </div>
                                <div className="stat-card" style={{ background: 'var(--success-50)', borderColor: 'var(--success-200)' }}>
                                    <div className="stat-value">{result.successCount || result.validRows}</div>
                                    <div className="stat-label">Successful</div>
                                </div>
                                <div className="stat-card" style={{ background: 'var(--error-50)', borderColor: 'var(--error-200)' }}>
                                    <div className="stat-value">{result.failedCount || result.errorRows}</div>
                                    <div className="stat-label">Failed</div>
                                </div>
                            </div>

                            {/* Errors */}
                            {result.errors && result.errors.length > 0 && (
                                <div style={{ marginTop: 'var(--space-4)' }}>
                                    <h4 style={{ color: 'var(--error-500)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <AlertCircle size={20} />
                                        Validation Errors
                                    </h4>
                                    <div style={{ maxHeight: '300px', overflow: 'auto', background: 'var(--bg-tertiary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                                        {result.errors.map((error, idx) => (
                                            <div key={idx} style={{ marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--error-500)' }}>Row {error.row}:</div>
                                                <ul style={{ marginLeft: 'var(--space-4)', marginTop: 'var(--space-1)' }}>
                                                    {error.errors.map((err, i) => (
                                                        <li key={i} style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {result.successCount > 0 && (
                                <div className="alert alert-success" style={{ marginTop: 'var(--space-4)' }}>
                                    <CheckCircle size={20} />
                                    Successfully uploaded {result.successCount} {selectedType}!
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                                <button className="btn btn-secondary" onClick={handleReset}>
                                    Upload Another File
                                </button>
                                <button className="btn btn-primary" onClick={onClose}>
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
