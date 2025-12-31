import { useRef, useState, useCallback } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

const CameraCapture = ({ onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsStreaming(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Unable to access camera. Please allow camera permissions.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        setPhoto(dataUrl);
        stopCamera();
    }, [stopCamera]);

    const retakePhoto = useCallback(() => {
        setPhoto(null);
        startCamera();
    }, [startCamera]);

    const confirmPhoto = useCallback(() => {
        if (photo) {
            onCapture(photo);
        }
    }, [photo, onCapture]);

    const handleCancel = useCallback(() => {
        stopCamera();
        onCancel();
    }, [stopCamera, onCancel]);

    // Start camera on mount
    useState(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div className="camera-container">
            {error ? (
                <div className="alert alert-error" style={{ margin: 'var(--space-4)' }}>
                    {error}
                    <button
                        className="btn btn-secondary btn-sm mt-4"
                        onClick={startCamera}
                    >
                        Try Again
                    </button>
                </div>
            ) : photo ? (
                <>
                    <img src={photo} alt="Captured" className="camera-preview" />
                    <div className="camera-controls">
                        <button className="btn btn-secondary" onClick={retakePhoto}>
                            <RotateCcw size={18} />
                            Retake
                        </button>
                        <button className="btn btn-success" onClick={confirmPhoto}>
                            <Check size={18} />
                            Use Photo
                        </button>
                        <button className="btn btn-ghost" onClick={handleCancel}>
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="camera-video"
                        autoPlay
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-controls">
                        {isStreaming ? (
                            <>
                                <button className="btn btn-primary" onClick={capturePhoto}>
                                    <Camera size={18} />
                                    Capture
                                </button>
                                <button className="btn btn-ghost" onClick={handleCancel}>
                                    <X size={18} />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={startCamera}>
                                <Camera size={18} />
                                Start Camera
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
