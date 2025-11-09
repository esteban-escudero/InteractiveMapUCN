const MapIndicators = ({
  coordinateDetection,
  validationErrors,
  buildingsLoading,
  buildingsError,
  routesError,
  onClearValidationErrors,
}) => {
  return (
    <>
      {coordinateDetection && (
        <div className="coordinate-detection-indicator">
          Modo Captura - Haz clic en el mapa
          <span style={{ color: "#27ae60", marginLeft: "10px" }}>
            Turf.js activado
          </span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="error-indicator" style={{ top: "110px" }}>
          {validationErrors.length} advertencia(s) de validación
          <button
            onClick={onClearValidationErrors}
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}>
            ×
          </button>
        </div>
      )}

      {buildingsLoading && (
        <div className="loading-indicator">Cargando edificios...</div>
      )}

      {buildingsError && (
        <div className="error-indicator">Error: {buildingsError}</div>
      )}

      {routesError && (
        <div className="error-indicator">Error rutas: {routesError}</div>
      )}
    </>
  );
};

export default MapIndicators;
