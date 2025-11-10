import { useMemo } from "react";

export const useBuildingFilters = (buildings, filters) => {
  const filteredBuildings = useMemo(() => {
    if (!filters.category && !filters.origin && !filters.destination) {
      return buildings;
    }

    return buildings.filter((building) => {
      const categoryMatch =
        !filters.category ||
        building.categoria === filters.category ||
        building.tipo === filters.category;

      const originMatch =
        !filters.origin ||
        building.nombre.toLowerCase().includes(filters.origin.toLowerCase());

      const destinationMatch =
        !filters.destination ||
        building.nombre
          .toLowerCase()
          .includes(filters.destination.toLowerCase());

      return categoryMatch && originMatch && destinationMatch;
    });
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
