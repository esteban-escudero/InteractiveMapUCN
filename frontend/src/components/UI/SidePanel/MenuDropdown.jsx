/**
 * Componente de dropdown genérico para el menú
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
    <div className={`dropdown ${isActive ? "active" : ""}`}>
      <button
        className="dropdown-toggle"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`menu-${menu.id}`}
      >
        {menu.icon} {menu.label} {isActive ? "▲" : "▼"}
      </button>

      {isActive && (
        <ul className="dropdown-menu" id={`menu-${menu.id}`} role="menu">
          {menu.items.map((item) => (
            <li key={item.id} role="none">
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={item.disabled ? "disabled" : ""}
                title={item.description || item.label}
                role="menuitem"
              >
                {item.icon} {item.label}
                {item.disabled && " (Próximamente)"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
