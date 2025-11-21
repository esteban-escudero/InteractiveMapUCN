// components/user/InfoModal.jsx
import React from 'react';
import './info-modal.css';

/**
 * Modal genérico para mostrar información
 */
function InfoModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="info-modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </>
    );
}

export default InfoModal;
