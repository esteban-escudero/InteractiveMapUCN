import React from 'react';

/**
 * Componente de menú mejorado con diseño tipo card
 * Responsabilidad: Renderizar un menú con cards visuales intuitivas
 */
export const MenuDropdown = ({ menu, isActive, onToggle, handlers }) => {
  const handleItemClick = (item) => {
    if (item.disabled) {
      alert("Funcionalidad en desarrollo");
      return;
    }

    const handler = handlers[item.action];
    if (handler) {
      console.log(`🔘 Acción: ${item.label} (${item.action})`);
      handler();
    } else {
      console.warn(`⚠️ Handler no encontrado para: ${item.action}`);
    }
  };

  return (
    <div className={`menu-section ${isActive ? "expanded" : ""}`}>
      <button
        className="menu-header"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`menu-${menu.id}`}
      >
        <div className="menu-header-content">
          <span className="menu-icon">{menu.icon}</span>
          <span className="menu-label">{menu.label}</span>
        </div>
        <span className="menu-arrow">{isActive ? "▲" : "▼"}</span>
      </button>

      <div className={`menu-items-container ${isActive ? 'show' : ''}`}>
        <div className="menu-items-grid" id={`menu-${menu.id}`}>
          {menu.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`menu-item-card ${item.disabled ? "disabled" : ""}`}
              title={item.description || item.label}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              {item.disabled && <span className="item-badge">Pronto</span>}
              {item.description && !item.disabled && (
                <span className="item-description">{item.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
