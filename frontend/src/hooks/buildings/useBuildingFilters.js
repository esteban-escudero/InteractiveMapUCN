// hooks/buildings/useBuildingFilters.js - MEJORADO
import { useMemo } from "react";

/**
 * Hook mejorado para filtros de edificios
 * Separa lógica de filtrado visual (categoría) vs selección (origen/destino)
 */
export const useBuildingFilters = (buildings, filters) => {
  // ========== EDIFICIOS FILTRADOS POR CATEGORÍA ==========
  // Solo la categoría oculta edificios visualmente
  const filteredBuildings = useMemo(() => {
    if (!filters.category) {
      console.log("Sin filtro de categoría - mostrando todos los edificios");
      return buildings;
    }

    const filtered = buildings.filter((building) => {
      const categoryMatch =
        building.tipo &&
        building.tipo.toLowerCase() === filters.category.toLowerCase();

      return categoryMatch;
    });

    console.log(
      `🔍 Filtro de categoría "${filters.category}": ${filtered.length} de ${buildings.length} edificios`
    );

    return filtered;
  }, [buildings, filters.category]);

  // ========== EDIFICIOS DESTACADOS (ORIGEN/DESTINO) ==========
  // Estos NO se filtran, solo se marcan para resaltado
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
      console.log("📍 Edificios destacados:", {
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
      .filter((building) => building.nombre) // Solo edificios con nombre
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

  return {
    // Edificios filtrados visualmente (solo por categoría)
    filteredBuildings,

    // Edificios destacados (origen/destino) - NO filtrados
    highlightedBuildings,

    // Estado de filtros
    filtersState,

    // Opciones para selectores
    buildingOptions,
    categoryOptions,

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
