import L from "leaflet";
import { useEffect, useState, useCallback } from "react";
import "./GPSTracker.css";

const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `
    <div class="pulse-marker">
      <div class="pulse-inner"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function GPSTracker({ mapInstance, isActive, onToggle }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [marker, setMarker] = useState(null);
  const [accuracyCircle, setAccuracyCircle] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const centerOnUserLocation = useCallback(() => {
    if (mapInstance && position) {
      mapInstance.flyTo([position.lat, position.lng], 17, {
        duration: 1.5,
      });
    }
  }, [mapInstance, position]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada por tu navegador");
      return;
    }

    setError(null);
    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);
        setError(null);
      },
      (err) => {
        let errorMessage = "Error obteniendo ubicación";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Permiso de geolocalización denegado";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible";
            break;
          case err.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
          default:
            errorMessage = err.message;
        }
        setError(errorMessage);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setPosition(null);
    setAccuracy(null);
    setError(null);
  }, [watchId]);

  useEffect(() => {
    if (!mapInstance || !position) return;

    if (!marker) {
      const newMarker = L.marker([position.lat, position.lng], {
        icon: userLocationIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      newMarker.bindPopup(`
        <div style="text-align: center;">
          <strongTu ubicación</strong><br/>
          <small>Lat: ${position.lat.toFixed(6)}</small><br/>
          <small>Lng: ${position.lng.toFixed(6)}</small><br/>
          ${
            accuracy ? `<small>Precisión: ${Math.round(accuracy)}m</small>` : ""
          }
        </div>
      `);

      setMarker(newMarker);
    } else {
      marker.setLatLng([position.lat, position.lng]);
      marker.setPopupContent(`
        <div style="text-align: center;">
          <strong>Tu ubicación</strong><br/>
          <small>Lat: ${position.lat.toFixed(6)}</small><br/>
          <small>Lng: ${position.lng.toFixed(6)}</small><br/>
          ${
            accuracy ? `<small>Precisión: ${Math.round(accuracy)}m</small>` : ""
          }
        </div>
      `);
    }

    if (accuracy) {
      if (!accuracyCircle) {
        const circle = L.circle([position.lat, position.lng], {
          radius: accuracy,
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(mapInstance);
        setAccuracyCircle(circle);
      } else {
        accuracyCircle.setLatLng([position.lat, position.lng]);
        accuracyCircle.setRadius(accuracy);
      }
    }
  }, [mapInstance, position, accuracy, marker, accuracyCircle]);

  useEffect(() => {
    if (!isTracking && marker) {
      marker.remove();
      setMarker(null);
    }
    if (!isTracking && accuracyCircle) {
      accuracyCircle.remove();
      setAccuracyCircle(null);
    }
  }, [isTracking, marker, accuracyCircle]);

  useEffect(() => {
    return () => {
      stopTracking();
      if (marker) marker.remove();
      if (accuracyCircle) accuracyCircle.remove();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    } else if (!isActive && isTracking) {
      stopTracking();
    }
  }, [isActive, isTracking, startTracking, stopTracking]);

  if (!mapInstance) return null;

  return (
    <>
      <div className="gps-controls">
        <button
          className={`gps-button ${isTracking ? "active" : ""}`}
          onClick={() => onToggle && onToggle()}
          title={isTracking ? "Desactivar GPS" : "Activar GPS"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {isTracking && position && (
          <button
            className="gps-center-button"
            onClick={centerOnUserLocation}
            title="Centrar en mi ubicación"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="gps-error">
          <span>{error}</span>
        </div>
      )}

      {isTracking && position && (
        <div className="gps-info">
          <div className="gps-info-item">
            <strong>Ubicación GPS</strong>
          </div>
          <div className="gps-info-item">
            <small>
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </small>
          </div>
          {accuracy && (
            <div className="gps-info-item">
              <small>Precisión: ±{Math.round(accuracy)}m</small>
            </div>
          )}
        </div>
      )}
    </>
  );
}
