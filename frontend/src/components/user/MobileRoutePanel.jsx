// components/user/MobileRoutePanel.jsx
import React from 'react';
import './mobile-components.css';
import './route-panel-fix.css';
import { tiposRuta } from '../../constants/constants.ts';

/* ---- Dropdown con Autocomplete ---- */
function AutocompleteSelect({ value, options, onChange, placeholder }) {
    const [open, setOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef(null);

    const selectedOption = options.find(o => o.value === value);
    const displayText = isFocused ? searchText : (selectedOption?.label || '');

    // Filtrar opciones basándose en el texto de búsqueda
    const filteredOptions = searchText
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchText.toLowerCase())
        )
        : options;

    const handleInputChange = (e) => {
        setSearchText(e.target.value);
        setOpen(true);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        setSearchText('');
        setOpen(true);
    };

    const handleInputBlur = () => {
        // Delay para permitir que el click en una opción se registre
        setTimeout(() => {
            setIsFocused(false);
            setSearchText('');
            setOpen(false);
        }, 200);
    };

    const handleOptionClick = (optValue) => {
        onChange(optValue);
        setOpen(false);
        setIsFocused(false);
        setSearchText('');
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    return (
        <div className={`custom-select-wrapper ${open ? 'open' : ''}`}>
            <input
                ref={inputRef}
                type="text"
                className="custom-select-input"
                value={displayText}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
            />

            {open && filteredOptions.length > 0 && (
                <>
                    <div
                        className="custom-select-overlay"
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9998
                        }}
                    />
                    <div className="custom-select-dropdown">
                        {filteredOptions.map(opt => (
                            <div
                                key={opt.value}
                                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {open && filteredOptions.length === 0 && searchText && (
                <div className="custom-select-dropdown">
                    <div className="custom-select-option no-results">
                        No se encontraron resultados
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---- PANEL DE RUTAS ---- */
function MobileRoutePanel({
    origin,
    destination,
    route,
    buildings,
    routeType = "peatonal",
    onOriginChange,
    onDestinationChange,
    onRouteTypeChange,
    onCalculate,
    onClose,
    onGPSRequest
}) {
    return (
        <>
            <div className="panel-overlay" onClick={onClose} />

            <div className="mobile-route-panel">
                <div className="panel-header">
                    <h2>Calcular Ruta</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="route-selectors">

                    {/* -------- ORIGEN -------- */}
                    <div className="route-input-group">
                        <div className="input-icon origin">
                            <span className="material-icons" style={{ fontSize: "24px" }}>
                                radio_button_checked
                            </span>
                        </div>

                        <AutocompleteSelect
                            value={origin?.id || origin === 'gps' ? (origin === 'gps' ? 'gps' : origin.id) : ""}
                            placeholder="Seleccionar Origen"
                            options={[
                                { value: "gps", label: "Mi ubicación" },
                                ...buildings.map(b => ({
                                    value: b.id,
                                    label: b.nombre
                                }))
                            ]}
                            onChange={(id) => {
                                if (id === 'gps') {
                                    onOriginChange('gps');
                                    if (typeof onGPSRequest === 'function') {
                                        onGPSRequest();
                                    }
                                } else {
                                    const b = buildings.find(x => x.id === id);
                                    onOriginChange(b);
                                }
                            }}
                        />
                    </div>

                    {/* -------- DESTINO -------- */}
                    <div className="route-input-group">
                        <div className="input-icon destination">
                            <span className="material-icons" style={{ fontSize: "26px" }}>
                                place
                            </span>
                        </div>

                        <AutocompleteSelect
                            value={destination?.id || ""}
                            placeholder="Seleccionar Destino"
                            options={buildings.map(b => ({
                                value: b.id,
                                label: b.nombre
                            }))}
                            onChange={(id) => {
                                const b = buildings.find(x => x.id === id);
                                onDestinationChange(b);
                            }}
                        />
                    </div>

                    {/* -------- TIPO DE RUTA -------- */}
                    <div className="route-input-group">
                        <div className="input-icon route-type">
                            <span className="material-icons" style={{ fontSize: "26px" }}>
                                alt_route
                            </span>
                        </div>

                        <AutocompleteSelect
                            value={routeType}
                            placeholder="Tipo de Ruta"
                            options={tiposRuta.map(tipo => ({
                                value: tipo.value,
                                label: tipo.label
                            }))}
                            onChange={(value) => onRouteTypeChange(value)}
                        />
                    </div>

                    <button
                        className="calculate-button"
                        onClick={onCalculate}
                        disabled={!origin || !destination}
                    >
                        Calcular Ruta
                    </button>
                </div>

            </div>
        </>
    );
}

export default MobileRoutePanel;
