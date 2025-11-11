const MapIndicators = ({
  coordinateDetection = false,
  validationErrors = [],
  buildingsLoading = false,
  buildingsError = null,
  routesError = null,
  onClearValidationErrors = () => {},
}) => {
  return (
    <>
      {coordinateDetection && (
        <div
          className="coordinate-detection-indicator"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}>
          Modo Captura - Haz clic en el mapa
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
