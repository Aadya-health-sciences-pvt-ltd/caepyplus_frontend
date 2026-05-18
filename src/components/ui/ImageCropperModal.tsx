import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../lib/cropImage';
import { Loader2, X } from 'lucide-react';

interface ImageCropperModalProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onCropCompleteAction: (croppedBlob: Blob) => Promise<void>;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, imageSrc, onClose, onCropCompleteAction }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImageBlob) {
                await onCropCompleteAction(croppedImageBlob);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                height: '60vh',
                backgroundColor: '#333',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Square aspect ratio
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>

            <div style={{
                marginTop: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px'
            }}>
                <label style={{ flexShrink: 0, fontWeight: 500, fontSize: '0.875rem' }}>Zoom</label>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                        setZoom(Number(e.target.value))
                    }}
                    style={{ flexGrow: 1 }}
                />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={onClose}
                    disabled={isSaving}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#64748B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#0EA5E9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isSaving && <Loader2 className="animate-spin" size={18} />}
                    Apply & Upload
                </button>
            </div>
            
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                <X size={24} />
            </button>
        </div>
    );
};

export default ImageCropperModal;
