import { useMemo } from "react";

export const useBuildingFilters = (buildings, filters) => {
  const filteredBuildings = useMemo(() => {
    console.log("🔍 Aplicando filtros:", filters);
    console.log("🏢 Edificios disponibles:", buildings.length);

    // Mostrar tipos de edificios disponibles para debug
    const tiposDisponibles = [...new Set(buildings.map((b) => b.tipo))];
    console.log("📋 Tipos de edificios disponibles:", tiposDisponibles);

    if (!filters.category && !filters.origin && !filters.destination) {
      console.log("✅ Sin filtros - mostrando todos los edificios");
      return buildings;
    }

    const filtered = buildings.filter((building) => {
      // Filtro por categoría (tipo de edificio) - CORREGIDO
      const categoryMatch =
        !filters.category ||
        (building.tipo &&
          building.tipo.toLowerCase() === filters.category.toLowerCase());

      // Filtro por origen (búsqueda en nombre)
      const originMatch =
        !filters.origin ||
        (building.nombre &&
          building.nombre.toLowerCase().includes(filters.origin.toLowerCase()));

      // Filtro por destino (búsqueda en nombre)
      const destinationMatch =
        !filters.destination ||
        (building.nombre &&
          building.nombre
            .toLowerCase()
            .includes(filters.destination.toLowerCase()));

      const matches = categoryMatch && originMatch && destinationMatch;

      if (matches && filters.category) {
        console.log(
          `✅ "${building.nombre}" (tipo: ${building.tipo}) coincide con categoría: ${filters.category}`
        );
      }

      return matches;
    });

    console.log(
      `📊 Resultado del filtro: ${filtered.length} de ${buildings.length} edificios`
    );

    // Debug detallado de qué edificios coincidieron
    if (filtered.length === 0 && filters.category) {
      console.log("❌ Ningún edificio coincidió. Revisando...");
      buildings.forEach((building) => {
        console.log(
          `   - "${building.nombre}": tipo="${building.tipo}", filtro="${filters.category}"`
        );
        console.log(
          `     Coincide?: ${
            building.tipo &&
            building.tipo.toLowerCase() === filters.category.toLowerCase()
          }`
        );
      });
    }

    return filtered;
  }, [buildings, filters.category, filters.origin, filters.destination]);

  const buildingOptions = useMemo(() => {
    return buildings.map((building) => ({
      value: building.id || building._id || building.id_edificio,
      label: building.nombre,
      ...building,
    }));
  }, [buildings]);

  return {
    filteredBuildings,
    buildingOptions,
  };
};
