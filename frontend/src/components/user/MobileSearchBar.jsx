// components/user/MobileSearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import './mobile-components.css';

/**
 * Barra de búsqueda flotante para móviles
 */
function MobileSearchBar({
    searchQuery,
    onSearchChange,
    buildings,
    onLocationSelect,
    onMenuToggle
}) {
    const [showResults, setShowResults] = useState(false);
    const [filteredResults, setFilteredResults] = useState([]);
    const searchRef = useRef(null);

    // Filtrar resultados cuando cambia la búsqueda
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const results = buildings.filter(building =>
                building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                building.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                building.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredResults(results.slice(0, 5)); // Máximo 5 resultados
            setShowResults(true);
        } else {
            setFilteredResults([]);
            setShowResults(false);
        }
    }, [searchQuery, buildings]);

    // Cerrar resultados al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectLocation = (building) => {
        onLocationSelect(building);
        onSearchChange('');
        setShowResults(false);
    };

    const handleClearSearch = () => {
        onSearchChange('');
        setShowResults(false);
    };

    return (
        <div className="mobile-search-bar" ref={searchRef}>
            <div className="search-input-container">
                {/* Botón de menú */}
                <button
                    className="menu-button"
                    onClick={onMenuToggle}
                    aria-label="Menú"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                {/* Input de búsqueda */}
                <div className="search-input-wrapper">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar edificios, salas..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                    />

                    {searchQuery && (
                        <button
                            className="clear-button"
                            onClick={handleClearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Resultados de búsqueda */}
            {showResults && filteredResults.length > 0 && (
                <div className="search-results">
                    {filteredResults.map((building) => (
                        <div
                            key={building.id}
                            className="search-result-item"
                            onClick={() => handleSelectLocation(building)}
                        >
                            <div className="result-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="result-content">
                                <div className="result-name">{building.name}</div>
                                {building.category && (
                                    <div className="result-category">{building.category}</div>
                                )}
                            </div>
                            <div className="result-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showResults && filteredResults.length === 0 && searchQuery && (
                <div className="search-results">
                    <div className="no-results">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p>No se encontraron resultados</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MobileSearchBar;
