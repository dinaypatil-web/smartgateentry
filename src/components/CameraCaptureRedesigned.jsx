import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Check, X, Zap } from 'lucide-react';

const CameraCaptureRedesigned = ({ onCapture, onCancel, useBackCamera = false }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [preferBack, setPreferBack] = useState(useBackCamera);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [useSimpleMode, setUseSimpleMode] = useState(false);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setStream(null);
        setIsStreaming(false);
    }, []);

    const findPreferredDeviceId = useCallback(async (prefer) => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            if (!videoInputs.length) return null;

            setAvailableCameras(videoInputs.map(d => ({
                deviceId: d.deviceId,
                label: d.label || 'Unknown Camera',
                groupId: d.groupId
            })));

            if (prefer) {
                const backCamera = videoInputs.find(d =>
                    d.label && /back|rear|environment/i.test(d.label)
                );
                if (backCamera) return backCamera.deviceId;

                const nonUserCameras = videoInputs.filter(d =>
                    !d.label || !/user|front|selfie/i.test(d.label)
                );
                if (nonUserCameras.length > 0) return nonUserCameras[0].deviceId;

                if (videoInputs.length > 1) return videoInputs[videoInputs.length - 1].deviceId;
            }

            return videoInputs[0].deviceId;
        } catch (e) {
            console.error('Device enumeration failed', e);
            return null;
        }
    }, []);

    const switchCamera = useCallback(async (prefer) => {
        try {
            setError('');

            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: prefer ? { exact: 'environment' } : 'user',
                    aspectRatio: { ideal: 16 / 9 },
                    frameRate: { ideal: 30 }
                }
            };

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                    setIsStreaming(true);
                }
            } catch (err) {
                const deviceId = await findPreferredDeviceId(prefer);
                if (deviceId) {
                    const deviceConstraints = {
                        video: {
                            deviceId: { exact: deviceId },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        }
                    };
                    const mediaStream2 = await navigator.mediaDevices.getUserMedia(deviceConstraints);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream2;
                        setStream(mediaStream2);
                        setIsStreaming(true);
                        return;
                    }
                }
                throw err;
            }
        } catch (err) {
            console.error('Switch camera error:', err);
            setError('Unable to access camera. Please check permissions.');
        }
    }, [findPreferredDeviceId]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) {
            setError('Camera not ready. Please wait.');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video.videoWidth || !video.videoHeight) {
            setError('Camera not ready. Please wait and try again.');
            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            if (!context) {
                setError('Failed to capture photo.');
                return;
            }

            context.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            setTimeout(() => {
                setPhoto(dataUrl);
            }, 10);
        } catch (err) {
            console.error('Photo capture error:', err);
            setError('Failed to capture photo. Please try again.');
        }
    }, []);

    const retakePhoto = useCallback(() => {
        setPhoto(null);
    }, []);

    const confirmPhoto = useCallback(() => {
        if (photo) {
            stopCamera();
            onCapture(photo);
        }
    }, [photo, onCapture, stopCamera]);

    const handleCancel = useCallback(() => {
        stopCamera();
        onCancel();
    }, [stopCamera, onCancel]);

    useEffect(() => {
        let mounted = true;

        const initializeCamera = async () => {
            if (!mounted) return;

            try {
                setIsInitializing(true);
                setError('');
                await switchCamera(preferBack);
            } catch (err) {
                console.error('Camera initialization error:', err);
                if (mounted) {
                    setError('Camera access failed. Please grant permission.');
                }
            } finally {
                if (mounted) {
                    setIsInitializing(false);
                }
            }
        };

        initializeCamera();

        return () => {
            mounted = false;
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [switchCamera, preferBack]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)'
        }}>
            {/* Main Content Area */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 200px) 1fr',
                gap: 'var(--space-4)',
                flex: 1,
                minHeight: 0
            }}>
                {/* Left Sidebar - Thumbnail and Controls */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)'
                }}>
                    {/* Captured Photo Thumbnail */}
                    <div style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--border-color)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {photo ? (
                            <img
                                src={photo}
                                alt="Captured"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: preferBack ? 'none' : 'scaleX(-1)'
                                }}
                            />
                        ) : (
                            <Camera size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
                        )}
                    </div>

                    {/* Camera Mode Toggle */}
                    <div style={{
                        background: 'var(--bg-glass)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-2)',
                            gap: 'var(--space-2)'
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: useSimpleMode ? 'var(--text-secondary)' : 'var(--primary-500)',
                                whiteSpace: 'nowrap'
                            }}>
                                Advanced
                            </span>
                            <label style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '44px',
                                height: '24px',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}>
                                <input
                                    type="checkbox"
                                    checked={useSimpleMode}
                                    onChange={(e) => setUseSimpleMode(e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: useSimpleMode ? 'var(--primary-500)' : 'var(--gray-400)',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '24px'
                                }}></span>
                                <span style={{
                                    position: 'absolute',
                                    height: '18px',
                                    width: '18px',
                                    left: useSimpleMode ? '23px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}></span>
                            </label>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: useSimpleMode ? 'var(--primary-500)' : 'var(--text-secondary)',
                                whiteSpace: 'nowrap'
                            }}>
                                Simple
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--space-2)',
                            fontSize: '0.7rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.3'
                        }}>
                            <Zap size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{useSimpleMode ? 'More reliable' : 'Full features with camera switching'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Camera Preview */}
                <div style={{
                    background: 'var(--gray-900)',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--border-color)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    {error ? (
                        <div style={{
                            padding: 'var(--space-6)',
                            textAlign: 'center',
                            color: 'var(--error-500)'
                        }}>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <X size={48} />
                            </div>
                            <div style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                                Camera Access Error
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>{error}</div>
                        </div>
                    ) : isInitializing ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            <div className="spinner" style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid var(--border-color)',
                                borderLeftColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 20px'
                            }}></div>
                            <div>Accessing Camera...</div>
                            <style dangerouslySetInnerHTML={{
                                __html: `@keyframes spin { to { transform: rotate(360deg); } }`
                            }} />
                        </div>
                    ) : (
                        <>
                            {isStreaming && availableCameras.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        const next = !preferBack;
                                        setPreferBack(next);
                                        switchCamera(next);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        zIndex: 2,
                                        backdropFilter: 'blur(12px)',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        padding: 'var(--space-2) var(--space-3)'
                                    }}
                                >
                                    <RotateCcw size={16} />
                                    Switch
                                </button>
                            )}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: preferBack ? 'none' : 'scaleX(-1)'
                                }}
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.play().catch(err => {
                                            console.error('Video play error:', err);
                                        });
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Action Buttons */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                justifyContent: 'center',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap'
            }}>
                {photo ? (
                    <>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={retakePhoto}
                            style={{ minWidth: '120px' }}
                        >
                            <RotateCcw size={18} />
                            Retake
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={confirmPhoto}
                            style={{ minWidth: '120px' }}
                        >
                            <Check size={18} />
                            Use Photo
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={capturePhoto}
                            disabled={!isStreaming}
                            style={{ minWidth: '120px' }}
                        >
                            <Camera size={18} />
                            Capture
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={handleCancel}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    </>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default CameraCaptureRedesigned;
