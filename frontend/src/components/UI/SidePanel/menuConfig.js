/**
 * Configuración del menú lateral
 */

export const menuConfig = [
  {
    id: "buildings",
    label: "Edificios",
    icon: "🏢",
    items: [
      {
        id: "add-building",
        label: "Agregar Edificio",
        icon: "➕",
        action: "onAddBuilding",
      },
      {
        id: "manage-buildings",
        label: "Gestionar Edificios",
        icon: "✏️",
        action: "onEditBuildings",
      },
    ],
  },
  {
    id: "rooms",
    label: "Salas",
    icon: "🚪",
    items: [
      {
        id: "create-rooms",
        label: "Crear Nuevas Salas",
        icon: "➕",
        action: "onManageRooms",
      },
      {
        id: "manage-rooms",
        label: "Gestionar Salas",
        icon: "✏️",
        action: "onEditBuildings",
        description: "Editar o eliminar salas existentes",
      },
    ],
  },
  {
    id: "routes",
    label: "Rutas",
    icon: "🗺️",
    items: [
      {
        id: "add-route",
        label: "Agregar Ruta",
        icon: "➕",
        action: "onAddRoute",
        disabled: true,
      },
      {
        id: "manage-routes",
        label: "Gestionar Rutas",
        icon: "✏️",
        action: "onManageRoutes",
        disabled: true,
      },
    ],
  },
];

/**
 * Estado del backend y sus mensajes
 */
export const statusConfig = {
  checking: {
    text: "🔍 Conectando...",
    color: "#3498db",
  },
  loading: {
    text: "⏳ Cargando edificios...",
    color: "#3498db",
  },
  success: {
    text: "✅ Conectado",
    color: "#2ecc71",
  },
  empty: {
    text: "⚠️ Base de datos vacía",
    color: "#f39c12",
  },
  error: {
    text: "❌ Error de conexión",
    color: "#e74c3c",
  },
};
