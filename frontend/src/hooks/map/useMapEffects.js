// frontend/src/hooks/map/useMapEffects.js
import React, { useEffect } from "react";
import L from "leaflet";
import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig.js";

export const useMapEffects = (
  mapRef,
  mapInstance,
  isMapReady,
  mapInitialized,
  setMapInitialized,
  initializeMap,
  showUINotification,
  loadBuildings,
  loadRoutes,
  geoServerStatus,
  loadWFSData
) => {
  // ========== CONFIGURACIÓN DE LEAFLET ==========
  useEffect(() => {
    // Configuración de íconos de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // ========== INICIALIZACIÓN DEL MAPA ==========
  const hasInitialized = React.useRef(false);
  
  // Efecto que se ejecuta al montar y verifica si el contenedor está disponible
  useEffect(() => {
    // Si ya está inicializado, no hacer nada
    if (hasInitialized.current || mapInitialized || mapInstance) {
      return;
    }

    // Función para intentar inicializar
    const tryInitialize = () => {
      if (mapRef.current && !hasInitialized.current) {
        hasInitialized.current = true;
        console.log("Inicializando mapa...");

        const initialize = () => {
          try {
            const initializedMap = initializeMap(UCN_COQUIMBO_BOUNDS);
            if (initializedMap) {
              setMapInitialized(true);
              console.log("Mapa inicializado exitosamente");
            } else {
              hasInitialized.current = false; // Permitir reintento si falla
            }
          } catch (error) {
            console.error("Error inicializando mapa:", error);
            showUINotification("Error al inicializar el mapa", "error");
            hasInitialized.current = false; // Permitir reintento
          }
        };

        setTimeout(initialize, 100);
      }
    };

    // Intentar inmediatamente
    tryInitialize();

    // Si no está disponible, intentar después de un breve delay
    if (!mapRef.current) {
      const timer = setTimeout(() => {
        tryInitialize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []); // Solo ejecutar al montar

  // ========== CARGA DE DATOS ==========
  // Usar useRef para evitar loops infinitos
  const hasLoadedData = React.useRef(false);
  const loadBuildingsRef = React.useRef(loadBuildings);
  const loadRoutesRef = React.useRef(loadRoutes);
  const loadWFSDataRef = React.useRef(loadWFSData);
  const showUINotificationDataRef = React.useRef(showUINotification);
  
  // Actualizar refs cuando cambian las funciones
  useEffect(() => {
    loadBuildingsRef.current = loadBuildings;
    loadRoutesRef.current = loadRoutes;
    loadWFSDataRef.current = loadWFSData;
    showUINotificationDataRef.current = showUINotification;
  }, [loadBuildings, loadRoutes, loadWFSData, showUINotification]);
  
  useEffect(() => {
    // Solo cargar datos una vez cuando el mapa esté listo
    if (isMapReady && mapInstance && !hasLoadedData.current) {
      console.log("Mapa listo, cargando datos...");
      hasLoadedData.current = true;

      const loadData = async () => {
        try {
          await loadBuildingsRef.current();
          await loadRoutesRef.current();

          if (geoServerStatus === "checking") {
            await loadWFSDataRef.current(mapInstance, "edificio");
          }

          console.log("Datos cargados exitosamente");
        } catch (error) {
          console.error("Error cargando datos:", error);
          showUINotificationDataRef.current("Error cargando datos del mapa", "error");
          hasLoadedData.current = false; // Permitir reintento en caso de error
        }
      };

      loadData();
    }
  }, [isMapReady, mapInstance, geoServerStatus]); // Dependencias correctas

  // ========== EFECTOS PARA ACTUALIZACIÓN DE UI ==========

  // ELIMINAR O COMENTAR ESTE EFECTO QUE CAUSA EL BUCLE INFINITO
  /*
  // Efecto para forzar actualización del BuildingList cuando cambian los filtros
  useEffect(() => {
    if (mapState.showBuildingList) {
      // Forzar re-render del BuildingList cerrando y abriendo
      mapState.handleCloseBuildingList();
      setTimeout(() => {
        mapState.handleManageBuildings();
      }, 100);
    }
  }, [
    mapState.filters.category,
    mapState.filters.origin,
    mapState.filters.destination,
    mapState.showBuildingList,
    mapState.handleCloseBuildingList,
    mapState.handleManageBuildings
  ]);
  */

  // ========== EFECTOS PARA DEBUG ==========
  // Removidos para evitar loops infinitos
  // Los logs de debug se pueden hacer directamente en los componentes cuando sea necesario

  return {};
};
