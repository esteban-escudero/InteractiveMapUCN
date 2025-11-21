// components/user/MobileMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoModal from './InfoModal';
import AboutContent from './AboutContent';
import HelpContent from './HelpContent';
import TermsContent from './TermsContent';
import './mobile-components.css';

/**
 * Menú lateral deslizable
 */
function MobileMenu({ onClose, isDarkMode, onToggleTheme }) {
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);

    const handleAdminAccess = () => {
        navigate('/admin');
    };

    const openModal = (modalType) => {
        setActiveModal(modalType);
    };

    const closeModal = () => {
        setActiveModal(null);
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

                        <button className="menu-item" onClick={() => openModal('about')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                            <span>Acerca de</span>
                        </button>

                        <button className="menu-item" onClick={() => openModal('help')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <path d="M12 17h.01"></path>
                            </svg>
                            <span>Ayuda</span>
                        </button>

                        <button className="menu-item" onClick={() => openModal('terms')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>Términos y condiciones</span>
                        </button>
                    </div>

                    <div className="menu-section">
                        <h3 className="menu-section-title">Configuración</h3>

                        <button className="menu-item" onClick={onToggleTheme}>
                            {isDarkMode ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                    <span>Modo claro</span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                    <span>Modo oscuro</span>
                                </>
                            )}
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

            {/* Modales */}
            <InfoModal
                isOpen={activeModal === 'about'}
                onClose={closeModal}
                title="Acerca de"
            >
                <AboutContent />
            </InfoModal>

            <InfoModal
                isOpen={activeModal === 'help'}
                onClose={closeModal}
                title="Ayuda"
            >
                <HelpContent />
            </InfoModal>

            <InfoModal
                isOpen={activeModal === 'terms'}
                onClose={closeModal}
                title="Términos y Condiciones"
            >
                <TermsContent />
            </InfoModal>
        </>
    );
}

export default MobileMenu;
