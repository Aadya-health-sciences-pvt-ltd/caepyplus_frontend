import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle size={20} color="#EF4444" />;
            case 'info': return <Info size={20} color="#3B82F6" />;
            default: return <CheckCircle2 size={20} color="#10B981" />;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            color: '#0F172A',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            border: '1px solid #E2E8F0',
            borderLeft: `4px solid ${type === 'error' ? '#EF4444' : (type === 'info' ? '#3B82F6' : '#10B981')}`,
            animation: 'slideIn 0.3s ease-out'
        }}>
            {getIcon()}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default Toast;
