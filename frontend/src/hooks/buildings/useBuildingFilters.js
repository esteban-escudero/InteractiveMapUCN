// hooks/buildings/useBuildingFilters.js - ACTUALIZADO
import { useMemo } from "react";

/**
 * Hook mejorado para filtros de edificios
 * Ahora incluye filtro de tipo de ruta
 */
export const useBuildingFilters = (buildings, filters, routes = []) => {
  // ========== EDIFICIOS FILTRADOS POR CATEGORÍA ==========
  const filteredBuildings = useMemo(() => {
    if (!filters.category && !filters.routeType) {
      console.log("Sin filtros - mostrando todos los edificios");
      return buildings;
    }

    const filtered = buildings.filter((building) => {
      // Filtro por categoría
      const categoryMatch = filters.category
        ? building.tipo &&
          building.tipo.toLowerCase() === filters.category.toLowerCase()
        : true;

      // Filtro por tipo de ruta (si hay rutas disponibles)
      let routeTypeMatch = true;
      if (filters.routeType && routes.length > 0) {
        // Verificar si el edificio tiene rutas del tipo seleccionado
        const buildingRoutes = routes.filter(
          (route) =>
            (route.origen === building.nombre ||
              route.destino === building.nombre) &&
            route.tipo === filters.routeType
        );
        routeTypeMatch = buildingRoutes.length > 0;
      }

      return categoryMatch && routeTypeMatch;
    });

    console.log(
      `🔍 Filtros activos - Categoría: "${filters.category}", Tipo Ruta: "${filters.routeType}" - Resultados: ${filtered.length} de ${buildings.length} edificios`
    );

    return filtered;
  }, [buildings, filters.category, filters.routeType, routes]);

  // ========== EDIFICIOS DESTACADOS (ORIGEN/DESTINO) ==========
  const highlightedBuildings = useMemo(() => {
    const highlighted = {
      origin: null,
      destination: null,
    };

    if (filters.origin) {
      highlighted.origin = buildings.find((b) => b.nombre === filters.origin);
    }

    if (filters.destination) {
      highlighted.destination = buildings.find(
        (b) => b.nombre === filters.destination
      );
    }

    if (highlighted.origin || highlighted.destination) {
      console.log("Edificios destacados:", {
        origin: highlighted.origin?.nombre || "ninguno",
        destination: highlighted.destination?.nombre || "ninguno",
      });
    }

    return highlighted;
  }, [buildings, filters.origin, filters.destination]);

  // ========== VALIDACIÓN DE FILTROS ==========
  const filtersState = useMemo(() => {
    return {
      hasCategory: !!filters.category,
      hasOrigin: !!filters.origin,
      hasDestination: !!filters.destination,
      hasRouteType: !!filters.routeType,
      hasRouteSelection: !!filters.origin && !!filters.destination,
      originValid: filters.origin
        ? buildings.some((b) => b.nombre === filters.origin)
        : false,
      destinationValid: filters.destination
        ? buildings.some((b) => b.nombre === filters.destination)
        : false,
      routeCalculationReady:
        !!filters.origin &&
        !!filters.destination &&
        buildings.some((b) => b.nombre === filters.origin) &&
        buildings.some((b) => b.nombre === filters.destination),
    };
  }, [buildings, filters]);

  // ========== OPCIONES PARA SELECTORES ==========
  const buildingOptions = useMemo(() => {
    return buildings
      .filter((building) => building.nombre)
      .map((building) => ({
        value: building.nombre,
        label: building.nombre,
        id: building.id || building._id || building.id_edificio,
        tipo: building.tipo,
        coords: building.ubicacion?.coordinates,
      }));
  }, [buildings]);

  // ========== OPCIONES DE CATEGORÍA ==========
  const categoryOptions = useMemo(() => {
    const tipos = [...new Set(buildings.map((b) => b.tipo).filter(Boolean))];
    return tipos.sort();
  }, [buildings]);

  // ========== OPCIONES DE TIPO DE RUTA ==========
  const routeTypeOptions = useMemo(() => {
    const tipos = [...new Set(routes.map((r) => r.tipo).filter(Boolean))];
    return tipos.sort();
  }, [routes]);

  return {
    // Edificios filtrados visualmente (por categoría y tipo de ruta)
    filteredBuildings,

    // Edificios destacados (origen/destino) - NO filtrados
    highlightedBuildings,

    // Estado de filtros
    filtersState,

    // Opciones para selectores
    buildingOptions,
    categoryOptions,
    routeTypeOptions,

    // Estadísticas
    stats: {
      total: buildings.length,
      filtered: filteredBuildings.length,
      highlighted: [
        highlightedBuildings.origin,
        highlightedBuildings.destination,
      ].filter(Boolean).length,
    },
  };
};
