// components/user/MobileSearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import './mobile-components.css';

/**
 * Barra de búsqueda flotante para móviles
 * Busca en edificios y salas
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
            const query = searchQuery.toLowerCase();
            const results = [];

            // Buscar en edificios
            buildings.forEach(building => {
                const buildingMatches =
                    building.nombre?.toLowerCase().includes(query) ||
                    building.categoria?.toLowerCase().includes(query) ||
                    building.descripcion?.toLowerCase().includes(query);

                if (buildingMatches) {
                    results.push({
                        id: `building-${building.id}`,
                        type: 'building',
                        data: building,
                        name: building.nombre,
                        category: building.categoria || 'Edificio',
                        floor: null
                    });
                }

                // Buscar en salas del edificio (usando nombre_sala y tipo_sala)
                if (building.salas && Array.isArray(building.salas)) {
                    building.salas.forEach(sala => {
                        const salaMatches =
                            sala.nombre_sala?.toLowerCase().includes(query) ||
                            sala.tipo_sala?.toLowerCase().includes(query) ||
                            sala.capacidad?.toString().includes(query);

                        if (salaMatches) {
                            results.push({
                                id: `sala-${sala.id}`,
                                type: 'sala',
                                data: sala,
                                building: building,
                                name: sala.nombre_sala,
                                category: `${building.nombre} - ${sala.tipo_sala || 'Sala'}`,
                                floor: sala.piso ? `Piso ${sala.piso}` : null
                            });
                        }
                    });
                }
            });

            setFilteredResults(results.slice(0, 8)); // Máximo 8 resultados
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

    const handleSelectLocation = (result) => {
        if (result.type === 'building') {
            onLocationSelect(result.data);
        } else if (result.type === 'sala') {
            // Para salas, seleccionar el edificio y pasar info de la sala
            onLocationSelect({
                ...result.building,
                selectedSala: result.data
            });
        }
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
                    {filteredResults.map((result) => (
                        <div
                            key={result.id}
                            className="search-result-item"
                            onClick={() => handleSelectLocation(result)}
                        >
                            <div className="result-icon">
                                {result.type === 'building' ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="9" y1="3" x2="9" y2="21"></line>
                                    </svg>
                                )}
                            </div>
                            <div className="result-content">
                                <div className="result-name">{result.name}</div>
                                <div className="result-category">
                                    {result.category}
                                    {result.floor && ` • ${result.floor}`}
                                </div>
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

            {/* Sin resultados */}
            {showResults && filteredResults.length === 0 && searchQuery && (
                <div className="search-results">
                    <div className="no-results">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <p>No se encontraron resultados</p>
                        <span>Intenta buscar con otros términos</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MobileSearchBar;
