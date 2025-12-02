import React from "react";

const SearchBar = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="search-bar-container">
            <span className="material-icons search-icon">search</span>
            <input
                type="text"
                className="search-input"
                placeholder="Buscar edificios..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
                <button
                    className="clear-search-btn"
                    onClick={() => onSearchChange("")}
                    aria-label="Limpiar búsqueda"
                >
                    <span className="material-icons">close</span>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
