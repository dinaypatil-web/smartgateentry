import { useState } from 'react';
import { Download, Upload, Database, AlertTriangle, CheckCircle, Info, X, HardDrive, Cloud, FileSpreadsheet } from 'lucide-react';
import {
    createBackup,
    parseBackupFile,
    restoreBackup,
    compareBackup,
    validateBackup,
    getBackupInfo,
    convertBackupToExcel,
    convertBackupFileToExcel,
    BACKUP_TYPES,
    MERGE_STRATEGIES
} from '../utils/backupUtils';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const BackupRestore = ({ onClose }) => {
    const { currentUser, currentRole } = useAuth();
    const { societies, refreshData } = useData();
    const [activeTab, setActiveTab] = useState('backup');
    const [backupType, setBackupType] = useState(BACKUP_TYPES.FULL);
    const [selectedSociety, setSelectedSociety] = useState(currentRole?.societyId || '');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    
    // Restore states
    const [restoreFile, setRestoreFile] = useState(null);
    const [backupInfo, setBackupInfo] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [mergeStrategy, setMergeStrategy] = useState(MERGE_STRATEGIES.MERGE);
    const [restoreSocietyId, setRestoreSocietyId] = useState('');
    
    // Excel conversion states
    const [excelFile, setExcelFile] = useState(null);
    const [excelBackupInfo, setExcelBackupInfo] = useState(null);
    
    const isSuperadmin = currentUser?.roles?.some(r => r.role === 'superadmin');
    const isAdmin = currentUser?.roles?.some(r => r.role === 'administrator');
    
    // Backup handlers
    const handleCreateBackup = async () => {
        setProcessing(true);
        setResult(null);
        
        try {
            const societyId = backupType === BACKUP_TYPES.SOCIETY ? selectedSociety : null;
            const result = await createBackup(
                backupType,
                societyId,
                currentUser.id,
                currentUser.name
            );
            
            if (result.success) {
                setResult({
                    type: 'success',
                    message: 'Backup created successfully!',
                    details: result.statistics
                });
            } else {
                setResult({
                    type: 'error',
                    message: `Backup failed: ${result.error}`
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Backup failed: ${error.message}`
            });
        } finally {
            setProcessing(false);
        }
    };
    
    // Restore handlers
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setProcessing(true);
        setResult(null);
        setBackupInfo(null);
        setComparison(null);
        
        try {
            // Parse backup file
            const backup = await parseBackupFile(file);
            
            // Validate backup
            const validation = validateBackup(backup);
            if (!validation.valid) {
                setResult({
                    type: 'error',
                    message: 'Invalid backup file',
                    details: validation.errors
                });
                setProcessing(false);
                return;
            }
            
            // Get backup info
            const info = getBackupInfo(backup);
            setBackupInfo(info);
            
            // Compare with current data
            const comp = await compareBackup(backup, restoreSocietyId || null);
            setComparison(comp);
            
            setRestoreFile(backup);
            
            if (validation.warnings.length > 0) {
                setResult({
                    type: 'warning',
                    message: 'Backup loaded with warnings',
                    details: validation.warnings
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Failed to load backup: ${error.message}`
            });
        } finally {
            setProcessing(false);
        }
    };
    
    const handleRestore = async () => {
        if (!restoreFile) return;
        
        const confirmMessage = mergeStrategy === MERGE_STRATEGIES.REPLACE
            ? 'WARNING: This will REPLACE all data. Any changes made after the backup will be LOST. Are you sure?'
            : 'This will merge the backup with current data. Newer data will be preserved. Continue?';
        
        if (!window.confirm(confirmMessage)) return;
        
        setProcessing(true);
        setResult(null);
        
        try {
            const result = await restoreBackup(
                restoreFile,
                mergeStrategy,
                restoreSocietyId || null
            );
            
            if (result.success) {
                await refreshData();
                setResult({
                    type: 'success',
                    message: 'Backup restored successfully!',
                    details: {
                        statistics: result.statistics,
                        conflicts: result.conflicts
                    }
                });
            } else {
                setResult({
                    type: 'error',
                    message: `Restore failed: ${result.error}`
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Restore failed: ${error.message}`
            });
        } finally {
            setProcessing(false);
        }
    };
    
    // Excel conversion handlers
    const handleExcelFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setProcessing(true);
        setResult(null);
        setExcelBackupInfo(null);
        
        try {
            // Parse backup file
            const backup = await parseBackupFile(file);
            
            // Validate backup
            const validation = validateBackup(backup);
            if (!validation.valid) {
                setResult({
                    type: 'error',
                    message: 'Invalid backup file',
                    details: validation.errors
                });
                setProcessing(false);
                return;
            }
            
            // Get backup info
            const info = getBackupInfo(backup);
            setExcelBackupInfo(info);
            setExcelFile(backup);
            
            if (validation.warnings.length > 0) {
                setResult({
                    type: 'warning',
                    message: 'Backup loaded with warnings',
                    details: validation.warnings
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Failed to load backup: ${error.message}`
            });
        } finally {
            setProcessing(false);
        }
    };
    
    const handleConvertToExcel = async () => {
        if (!excelFile) return;
        
        setProcessing(true);
        setResult(null);
        
        try {
            const result = convertBackupToExcel(excelFile);
            
            if (result.success) {
                setResult({
                    type: 'success',
                    message: `Excel file created successfully: ${result.filename}`,
                    details: {
                        filename: result.filename,
                        sheets: excelBackupInfo.collections.length + 1 // +1 for metadata sheet
                    }
                });
            } else {
                setResult({
                    type: 'error',
                    message: `Conversion failed: ${result.error}`
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `Conversion failed: ${error.message}`
            });
        } finally {
            setProcessing(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2>Backup & Restore</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="modal-body">
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '2px solid var(--border-color)' }}>
                        <button
                            className={`btn btn-ghost ${activeTab === 'backup' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('backup')}
                            style={{ borderRadius: '0', borderBottom: activeTab === 'backup' ? '2px solid var(--primary-500)' : 'none' }}
                        >
                            <Download size={18} />
                            Create Backup
                        </button>
                        <button
                            className={`btn btn-ghost ${activeTab === 'restore' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('restore')}
                            style={{ borderRadius: '0', borderBottom: activeTab === 'restore' ? '2px solid var(--primary-500)' : 'none' }}
                        >
                            <Upload size={18} />
                            Restore Backup
                        </button>
                        <button
                            className={`btn btn-ghost ${activeTab === 'excel' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('excel')}
                            style={{ borderRadius: '0', borderBottom: activeTab === 'excel' ? '2px solid var(--primary-500)' : 'none' }}
                        >
                            <FileSpreadsheet size={18} />
                            Convert to Excel
                        </button>
                    </div>
                    
                    {/* Backup Tab */}
                    {activeTab === 'backup' && (
                        <div>
                            <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
                                <Info size={20} />
                                <div>
                                    <strong>Backup creates a snapshot of your data</strong>
                                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                        Download a JSON file containing all selected data. Keep it safe for disaster recovery.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Backup Type Selection */}
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="form-label">Backup Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: isSuperadmin ? 'repeat(2, 1fr)' : '1fr', gap: 'var(--space-3)' }}>
                                    {isSuperadmin && (
                                        <button
                                            className={`card ${backupType === BACKUP_TYPES.FULL ? 'card-active' : ''}`}
                                            style={{
                                                padding: 'var(--space-4)',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                border: backupType === BACKUP_TYPES.FULL ? '2px solid var(--primary-500)' : '1px solid var(--border-color)'
                                            }}
                                            onClick={() => setBackupType(BACKUP_TYPES.FULL)}
                                        >
                                            <Database size={32} style={{ color: 'var(--primary-500)', margin: '0 auto var(--space-2)' }} />
                                            <div style={{ fontWeight: 600 }}>Full Backup</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                                                All societies and data
                                            </div>
                                        </button>
                                    )}
                                    <button
                                        className={`card ${backupType === BACKUP_TYPES.SOCIETY ? 'card-active' : ''}`}
                                        style={{
                                            padding: 'var(--space-4)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: backupType === BACKUP_TYPES.SOCIETY ? '2px solid var(--primary-500)' : '1px solid var(--border-color)'
                                        }}
                                        onClick={() => setBackupType(BACKUP_TYPES.SOCIETY)}
                                    >
                                        <HardDrive size={32} style={{ color: 'var(--primary-500)', margin: '0 auto var(--space-2)' }} />
                                        <div style={{ fontWeight: 600 }}>Society Backup</div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                                            Single society data
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Society Selection */}
                            {backupType === BACKUP_TYPES.SOCIETY && (
                                <div style={{ marginBottom: 'var(--space-6)' }}>
                                    <label className="form-label">Select Society</label>
                                    <select
                                        className="form-input"
                                        value={selectedSociety}
                                        onChange={(e) => setSelectedSociety(e.target.value)}
                                    >
                                        <option value="">-- Select Society --</option>
                                        {societies.map(society => (
                                            <option key={society.id} value={society.id}>
                                                {society.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Create Backup Button */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCreateBackup}
                                    disabled={processing || (backupType === BACKUP_TYPES.SOCIETY && !selectedSociety)}
                                >
                                    <Download size={18} />
                                    {processing ? 'Creating Backup...' : 'Create & Download Backup'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Restore Tab */}
                    {activeTab === 'restore' && (
                        <div>
                            <div className="alert alert-warning" style={{ marginBottom: 'var(--space-6)' }}>
                                <AlertTriangle size={20} />
                                <div>
                                    <strong>Data Loss Prevention</strong>
                                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                        Use "Merge" strategy (recommended) to preserve data created after the backup.
                                        "Replace" will overwrite all data and cause data loss.
                                    </p>
                                </div>
                            </div>
                            
                            {/* File Upload */}
                            {!restoreFile && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Step 1: Select Backup File</h3>
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
                                            accept=".json"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                            id="backup-upload"
                                        />
                                        <label htmlFor="backup-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                            Choose Backup File (.json)
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Backup Info */}
                            {backupInfo && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Backup Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Created</div>
                                            <div style={{ fontWeight: 600 }}>{new Date(backupInfo.metadata.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Created By</div>
                                            <div style={{ fontWeight: 600 }}>{backupInfo.metadata.createdByName}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Type</div>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{backupInfo.metadata.type}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Total Records</div>
                                            <div style={{ fontWeight: 600 }}>{backupInfo.statistics.total}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Comparison */}
                            {comparison && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Data Comparison</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                        <div className="stat-card" style={{ background: 'var(--success-50)', borderColor: 'var(--success-200)' }}>
                                            <div className="stat-value">{comparison.summary.newInBackup}</div>
                                            <div className="stat-label">New in Backup</div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'var(--info-50)', borderColor: 'var(--info-200)' }}>
                                            <div className="stat-value">{comparison.summary.newInCurrent}</div>
                                            <div className="stat-label">New in Current</div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'var(--warning-50)', borderColor: 'var(--warning-200)' }}>
                                            <div className="stat-value">{comparison.summary.conflicts}</div>
                                            <div className="stat-label">Potential Conflicts</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                        <strong>New in Backup:</strong> Records that will be added<br />
                                        <strong>New in Current:</strong> Records created after backup (will be preserved with Merge)<br />
                                        <strong>Conflicts:</strong> Records that exist in both (merge strategy will resolve)
                                    </div>
                                </div>
                            )}
                            
                            {/* Merge Strategy */}
                            {restoreFile && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Step 2: Choose Restore Strategy</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
                                        <button
                                            className={`card ${mergeStrategy === MERGE_STRATEGIES.MERGE ? 'card-active' : ''}`}
                                            style={{
                                                padding: 'var(--space-4)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                border: mergeStrategy === MERGE_STRATEGIES.MERGE ? '2px solid var(--success-500)' : '1px solid var(--border-color)'
                                            }}
                                            onClick={() => setMergeStrategy(MERGE_STRATEGIES.MERGE)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <CheckCircle size={20} style={{ color: 'var(--success-500)' }} />
                                                <strong>Merge (Recommended)</strong>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                Combines backup with current data. Newer records are preserved. No data loss.
                                            </div>
                                        </button>
                                        
                                        <button
                                            className={`card ${mergeStrategy === MERGE_STRATEGIES.REPLACE ? 'card-active' : ''}`}
                                            style={{
                                                padding: 'var(--space-4)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                border: mergeStrategy === MERGE_STRATEGIES.REPLACE ? '2px solid var(--error-500)' : '1px solid var(--border-color)'
                                            }}
                                            onClick={() => setMergeStrategy(MERGE_STRATEGIES.REPLACE)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <AlertTriangle size={20} style={{ color: 'var(--error-500)' }} />
                                                <strong>Replace (Caution)</strong>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                Replaces all data with backup. Data created after backup will be lost!
                                            </div>
                                        </button>
                                        
                                        <button
                                            className={`card ${mergeStrategy === MERGE_STRATEGIES.SKIP ? 'card-active' : ''}`}
                                            style={{
                                                padding: 'var(--space-4)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                border: mergeStrategy === MERGE_STRATEGIES.SKIP ? '2px solid var(--info-500)' : '1px solid var(--border-color)'
                                            }}
                                            onClick={() => setMergeStrategy(MERGE_STRATEGIES.SKIP)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <Info size={20} style={{ color: 'var(--info-500)' }} />
                                                <strong>Skip Existing</strong>
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                Only adds new records from backup. Keeps all current data unchanged.
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Society Filter for Restore */}
                            {restoreFile && isSuperadmin && backupInfo?.metadata.type === BACKUP_TYPES.FULL && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Step 3: Restore Scope (Optional)</h3>
                                    <label className="form-label">Restore specific society only</label>
                                    <select
                                        className="form-input"
                                        value={restoreSocietyId}
                                        onChange={(e) => setRestoreSocietyId(e.target.value)}
                                    >
                                        <option value="">All Societies</option>
                                        {societies.map(society => (
                                            <option key={society.id} value={society.id}>
                                                {society.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Restore Button */}
                            {restoreFile && (
                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setRestoreFile(null);
                                            setBackupInfo(null);
                                            setComparison(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRestore}
                                        disabled={processing}
                                    >
                                        <Upload size={18} />
                                        {processing ? 'Restoring...' : 'Restore Backup'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Excel Conversion Tab */}
                    {activeTab === 'excel' && (
                        <div>
                            <div className="alert alert-info" style={{ marginBottom: 'var(--space-6)' }}>
                                <Info size={20} />
                                <div>
                                    <strong>Convert Backup to Excel</strong>
                                    <p style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>
                                        Upload a backup file and convert it to Excel format for analysis, reporting, or external use.
                                        Each collection will be exported as a separate sheet.
                                    </p>
                                </div>
                            </div>
                            
                            {/* File Upload */}
                            {!excelFile && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Step 1: Select Backup File</h3>
                                    <div
                                        style={{
                                            border: '2px dashed var(--border-color)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: 'var(--space-8)',
                                            textAlign: 'center',
                                            background: 'var(--bg-tertiary)'
                                        }}
                                    >
                                        <FileSpreadsheet size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-4)' }} />
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleExcelFileSelect}
                                            style={{ display: 'none' }}
                                            id="excel-backup-upload"
                                        />
                                        <label htmlFor="excel-backup-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                            Choose Backup File (.json)
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Backup Info */}
                            {excelBackupInfo && (
                                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Backup Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Created</div>
                                            <div style={{ fontWeight: 600 }}>{new Date(excelBackupInfo.metadata.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Created By</div>
                                            <div style={{ fontWeight: 600 }}>{excelBackupInfo.metadata.createdByName}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Type</div>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{excelBackupInfo.metadata.type}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Total Records</div>
                                            <div style={{ fontWeight: 600 }}>{excelBackupInfo.statistics.total}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="alert alert-success" style={{ marginTop: 'var(--space-4)' }}>
                                        <CheckCircle size={18} />
                                        <div>
                                            <strong>Excel Export Will Include:</strong>
                                            <ul style={{ marginTop: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
                                                <li>Backup Info sheet with metadata and statistics</li>
                                                {excelBackupInfo.collections.map(col => (
                                                    <li key={col}>{col} ({excelBackupInfo.statistics[col]} records)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Convert Button */}
                            {excelFile && (
                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setExcelFile(null);
                                            setExcelBackupInfo(null);
                                            setResult(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleConvertToExcel}
                                        disabled={processing}
                                    >
                                        <FileSpreadsheet size={18} />
                                        {processing ? 'Converting...' : 'Convert to Excel'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Result Display */}
                    {result && (
                        <div className={`alert alert-${result.type}`} style={{ marginTop: 'var(--space-6)' }}>
                            {result.type === 'success' && <CheckCircle size={20} />}
                            {result.type === 'error' && <AlertTriangle size={20} />}
                            {result.type === 'warning' && <Info size={20} />}
                            <div>
                                <strong>{result.message}</strong>
                                {result.details && typeof result.details === 'object' && (
                                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                                        {result.details.statistics && (
                                            <div>Total records: {result.details.statistics.total}</div>
                                        )}
                                        {result.details.conflicts && result.details.conflicts.length > 0 && (
                                            <div>Conflicts resolved: {result.details.conflicts.length}</div>
                                        )}
                                        {Array.isArray(result.details) && result.details.map((detail, idx) => (
                                            <div key={idx}>• {detail}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;
