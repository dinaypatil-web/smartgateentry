import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Check, X, FileText } from 'lucide-react';

const SimpleCameraCapture = ({ onCapture, onCancel, useBackCamera = false }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState([]);

    // Simple camera initialization
    const initCamera = useCallback(async () => {
        try {
            setError('');
            setIsLoading(true);

            // Get available cameras
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            // Try with specific facingMode first
            const constraints = {
                video: {
                    facingMode: useBackCamera ? { ideal: 'environment' } : 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            console.log('Starting simple camera with constraints:', constraints);

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);

                    // Play video once metadata loads
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play()
                            .then(() => {
                                setIsLoading(false);
                            })
                            .catch(err => {
                                console.error('Video play error:', err);
                                setError('Failed to start video stream. Please try again.');
                                setIsLoading(false);
                            });
                    };
                }
            } catch (mediaErr) {
                console.warn('Facing mode constraint failed, trying default...', mediaErr);
                // Fallback to basic video if facingMode fails
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    setStream(fallbackStream);
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().then(() => setIsLoading(false));
                    };
                }
            }
        } catch (err) {
            console.error('Camera error:', err);
            setIsLoading(false);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found on this device. Please check your hardware.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is in use by another app. Please close other apps and try again.');
            } else {
                setError(`Camera access failed: ${err.message || 'Unknown error'}`);
            }
        }
    }, [useBackCamera]);

    // Cleanup function
    const cleanup = useCallback(() => {
        // Use a local copy of stream if possible, or handle it carefully
        // To avoid infinite loops, cleanup should not depend on stream in a way that triggers re-renders
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setStream(null);
    }, []); // Removed stream dependency

    // Capture photo
    const capturePhoto = useCallback(() => {
        if (!videoRef.current) {
            setError('Camera not ready. Please wait and try again.');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
        cleanup();
    }, [onCapture, cleanup]);

    // Initialize on mount
    useEffect(() => {
        initCamera();

        return () => {
            // Manual cleanup to ensure it runs without depending on state
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [initCamera]); // Removed cleanup dependency to prevent infinite loop

    if (error) {
        return (
            <div className="simple-camera-error" style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Camera Error</div>
                    <div>{error}</div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary" onClick={initCamera}>
                        <Camera size={18} />
                        Try Again
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => {
                        // File upload fallback
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    onCapture(event.target.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        input.click();
                    }}>
                        <FileText size={18} />
                        Upload Photo
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={onCancel}>
                        <X size={18} />
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="simple-camera-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)'
        }}>
            {isLoading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    textAlign: 'center'
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
                    <h3 style={{ margin: '0 0 var(--space-2) 0' }}>Starting Camera</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Please allow camera access when prompted</p>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}} />
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '60vh',
                            borderRadius: 'var(--radius-lg)',
                            objectFit: 'cover',
                            transform: useBackCamera ? 'none' : 'scaleX(-1)'
                        }}
                    />

                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                            <Camera size={18} />
                            Capture Photo
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => {
                            cleanup();
                            onCancel();
                        }}>
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SimpleCameraCapture;