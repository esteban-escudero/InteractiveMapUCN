import { useState } from "react";
import L from "leaflet";

export const useGeoServer = () => {
  const [status, setStatus] = useState("checking");
  const [features, setFeatures] = useState([]);

  const loadWFSData = async (map, layerName = "edificio") => {
    if (!map || !map.getCenter) {
      console.error("Mapa no está listo");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const wfsUrl = `http://localhost:8080/geoserver/InteractiveMap/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=InteractiveMap:${layerName}&outputFormat=application/json`;

      console.log("📡 Cargando datos de GeoServer...");
      const response = await fetch(wfsUrl);

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      console.log("✅ Datos GeoServer recibidos:", data.features?.length || 0);

      if (!data.features || data.features.length === 0) {
        setStatus("empty");
        return;
      }

      setFeatures(data.features);
      setStatus("success");

      processGeoJSONData(map, data.features);
    } catch (error) {
      console.error("❌ Error cargando capa:", error);
      setStatus("error");
    }
  };

  const processGeoJSONData = (map, features) => {
    try {
      if (!map || !map.addLayer) {
        console.error("Mapa no disponible para agregar capas");
        return;
      }

      // ✅ Función onEachFeature para los popups
      const onEachFeature = (feature, layer) => {
        if (feature.properties) {
          let popupContent = `<div style='min-width: 200px;'><h4>🏛️ ${
            feature.properties.nombre || "Edificio"
          }</h4>`;
          for (let prop in feature.properties) {
            if (
              feature.properties.hasOwnProperty(prop) &&
              feature.properties[prop] !== null
            ) {
              popupContent += `<b>${prop}:</b> ${feature.properties[prop]}<br>`;
            }
          }
          popupContent += "</div>";
          layer.bindPopup(popupContent);
        }
      };

      // Función determineStyle MODIFICADA
      const determineStyle = (feature) => {
        if (feature.geometry.type === "Point") {
          return {
            radius: 0, // Círculo invisible
            fill: false,
            stroke: false,
          };
        } else if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          // ✅ Opcional: mostrar polígonos con estilo sutil
          return {
            color: "#ff7800",
            weight: 2,
            fillColor: "#ff7800",
            fillOpacity: 0.1, // Muy transparente
            opacity: 0.6,
          };
        } else if (feature.geometry.type === "LineString") {
          return {
            color: "#3388ff",
            weight: 3,
            opacity: 0.6,
          };
        } else {
          return {
            color: "#3388ff",
            weight: 2,
            fillColor: "#3388ff",
            fillOpacity: 0.1,
          };
        }
      };

      const pointToLayer = function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 0, // Invisible
          fill: false,
          stroke: false,
        });
      };

      const geoJsonLayer = L.geoJSON(features, {
        pointToLayer: pointToLayer,
        style: determineStyle,
        onEachFeature: onEachFeature,
      }).addTo(map);

      console.log("Capa GeoJSON procesada y agregada al mapa (sin iconos)");

      // ✅ Opcional: Ajustar el mapa a los bounds de los datos
      if (geoJsonLayer.getBounds && geoJsonLayer.getBounds().isValid()) {
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
      }
    } catch (error) {
      console.error("❌ Error procesando GeoJSON:", error);
    }
  };

  return {
    status,
    features,
    loadWFSData,
  };
};
