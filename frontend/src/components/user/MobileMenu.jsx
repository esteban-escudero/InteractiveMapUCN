// components/user/MobileMenu.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './mobile-components.css';

/**
 * Menú lateral deslizable
 */
function MobileMenu({ onClose }) {
    const navigate = useNavigate();

    const handleAdminAccess = () => {
        navigate('/admin');
    };

    return (
        <>
            <div className="menu-overlay" onClick={onClose} />

            <div className="mobile-menu">
                {/* Header */}
                <div className="menu-header">
                    <div className="menu-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <h2>Mapa UCN</h2>
                    </div>
                    <button className="menu-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Menú items */}
                <nav className="menu-nav">
                    <div className="menu-section">
                        <h3 className="menu-section-title">Información</h3>

                        <button className="menu-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                            <span>Acerca de</span>
                        </button>

                        <button className="menu-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <path d="M12 17h.01"></path>
                            </svg>
                            <span>Ayuda</span>
                        </button>

                        <button className="menu-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>Términos y condiciones</span>
                        </button>
                    </div>

                    <div className="menu-section">
                        <h3 className="menu-section-title">Configuración</h3>

                        <button className="menu-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6"></path>
                                <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"></path>
                                <path d="M1 12h6m6 0h6"></path>
                                <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"></path>
                            </svg>
                            <span>Preferencias</span>
                        </button>
                    </div>

                    <div className="menu-section">
                        <h3 className="menu-section-title">Administración</h3>

                        <button className="menu-item" onClick={handleAdminAccess}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <span>Acceso administrativo</span>
                        </button>
                    </div>
                </nav>

                {/* Footer */}
                <div className="menu-footer">
                    <p>Universidad Católica del Norte</p>
                    <p className="version">Versión 1.0.0</p>
                </div>
            </div>
        </>
    );
}

export default MobileMenu;
