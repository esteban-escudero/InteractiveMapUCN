import L from "leaflet";
import {
  MAP_ZOOM_LIMITS,
  UCN_COQUIMBO_BOUNDS,
} from "../../constants/mapConfig";

/**
 * Componente para controles adicionales del mapa
 */
export const MapControls = ({ mapInstance, buildingsCount }) => {
  const handleResetView = () => {
    if (!mapInstance) return;

    try {
      mapInstance.invalidateSize();
      const boundsLatLng = L.latLngBounds(UCN_COQUIMBO_BOUNDS);
      mapInstance.fitBounds(boundsLatLng, {
        padding: [50, 50],
        maxZoom: MAP_ZOOM_LIMITS.default,
        animate: true,
        duration: 0.5,
      });
      console.log("🎯 Vista reseteada al Campus Guayacán");
    } catch (error) {
      console.warn("⚠️ Error al resetear vista:", error);
      // Fallback: usar setView
      const centerLat =
        (UCN_COQUIMBO_BOUNDS[0][0] + UCN_COQUIMBO_BOUNDS[1][0]) / 2;
      const centerLng =
        (UCN_COQUIMBO_BOUNDS[0][1] + UCN_COQUIMBO_BOUNDS[1][1]) / 2;
      mapInstance.setView([centerLat, centerLng], MAP_ZOOM_LIMITS.default, {
        animate: true,
      });
    }
  };

  return (
    <>
      {/* Botón para resetear vista */}
      <button
        onClick={handleResetView}
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#3498db",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#2980b9")}
        onMouseLeave={(e) => (e.target.style.background = "#3498db")}
        title="Volver a la vista del Campus Guayacán"
      >
        🎯 Resetear Vista Campus
      </button>

      {/* Contador de edificios */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(52,152,219,0.9)",
          color: "white",
          padding: "8px 15px",
          borderRadius: "5px",
          fontSize: "13px",
          fontWeight: "bold",
          zIndex: 1000,
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        🏢 Edificios: {buildingsCount}
      </div>
    </>
  );
};
