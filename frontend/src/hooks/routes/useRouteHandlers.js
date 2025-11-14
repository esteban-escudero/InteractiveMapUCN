/**
 * Handlers específicos para rutas
 */
import { useCallback } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRouteHandlers = (
  showUINotification,
  showConfirm,
  validateCoordinates,
  createRoute,
  updateRoute,
  deleteRoute,
  loadRoutes,
  mapState
) => {
  /**
   * Guardar ruta (crear o actualizar) con validaciones
   */
  const handleSaveRoute = useCallback(
    async (routeData) => {
      try {
        console.log("🔍 INICIANDO GUARDADO DE RUTA - DEBUG:");
        console.log("📊 Datos recibidos:", routeData);
        console.log("📍 Geometría:", routeData.geometria);
        console.log(
          "🔢 Puntos en geometría:",
          routeData.geometria?.coordinates?.length || 0
        );
        console.log("🗂️ Puntos_ruta:", routeData.puntos_ruta?.length || 0);

        // Validación simplificada - solo verificar que tenemos geometría con puntos
        if (!routeData.geometria || !routeData.geometria.coordinates) {
          console.log("❌ FALTA GEOMETRÍA - Bloqueando guardado");
          showUINotification(
            "Error: La ruta no tiene geometría válida",
            "error"
          );
          return;
        }

        const coordinates = routeData.geometria.coordinates;
        console.log("📐 Coordenadas a validar:", coordinates);

        if (coordinates.length < 2) {
          console.log("❌ MENOS DE 2 PUNTOS - Bloqueando guardado");
          showUINotification("La ruta debe tener al menos 2 puntos", "error");
          return;
        }

        // Validar coordenadas fuera de límites (pero permitir guardar con advertencia)
        const invalidPoints = coordinates.filter((coord) => {
          const [lng, lat] = coord;
          return !validateCoordinates(lat, lng);
        });

        if (invalidPoints.length > 0) {
          console.log("⚠️ Puntos fuera de límites:", invalidPoints.length);
          const confirmSave = window.confirm(
            `${invalidPoints.length} puntos están fuera de los límites del campus. ¿Deseas guardar de todas formas?`
          );
          if (!confirmSave) {
            console.log("❌ USUARIO CANCELÓ POR PUNTOS FUERA DE LÍMITES");
            return;
          }
        }

        // Validar con SpatialUtils (pero si falla, solo mostrar advertencia)
        let isValidGeometry = true;
        try {
          isValidGeometry = SpatialUtils.isValidLineString(coordinates);
          console.log("✅ Validación SpatialUtils:", isValidGeometry);
        } catch (error) {
          console.warn("⚠️ Error en validación SpatialUtils:", error);
          isValidGeometry = false;
        }

        if (!isValidGeometry) {
          const confirmSave = window.confirm(
            "La geometría de la ruta podría no ser válida. ¿Deseas guardar de todas formas?"
          );
          if (!confirmSave) {
            console.log("❌ USUARIO CANCELÓ POR GEOMETRÍA INVÁLIDA");
            return;
          }
        }

        console.log(
          "✅ TODAS LAS VALIDACIONES PASARON - Procediendo a guardar..."
        );

        // Guardar ruta
        if (mapState.editingRoute) {
          console.log("🔄 Actualizando ruta existente...");
          await updateRoute(mapState.editingRoute.id, routeData);
          showUINotification("Ruta actualizada correctamente", "success");
        } else {
          console.log("🆕 Creando nueva ruta...");
          await createRoute(routeData);
          showUINotification("Ruta creada correctamente", "success");
        }

        console.log("✅ RUTA GUARDADA EXITOSAMENTE");
        mapState.setEditingRoute(null);
        mapState.setShowRouteForm(false);
        await loadRoutes();
      } catch (error) {
        console.error("❌ ERROR CRÍTICO al guardar ruta:", error);
        showUINotification(`Error al guardar ruta: ${error.message}`, "error");
      }
    },
    [
      validateCoordinates,
      mapState,
      showUINotification,
      createRoute,
      updateRoute,
      loadRoutes,
    ]
  );

  /**
   * Eliminar ruta con confirmación
   */
  const handleDeleteRoute = useCallback(
    (route) => {
      showConfirm(
        "Eliminar Ruta",
        `¿Estás seguro de eliminar la ruta "${route.nombre}"?\n\nEsta acción no se puede deshacer.`,
        async () => {
          try {
            await deleteRoute(route.id);
            showUINotification("Ruta eliminada correctamente", "success");
            if (
              mapState.selectedRoute &&
              mapState.selectedRoute.id === route.id
            ) {
              mapState.setSelectedRoute(null);
            }
          } catch (err) {
            console.error("Error al eliminar ruta:", err);
            showUINotification("Error al eliminar ruta", "error");
          }
        },
        {
          type: "warning",
          confirmText: "Eliminar Ruta",
          cancelText: "Cancelar",
        }
      );
    },
    [showConfirm, deleteRoute, showUINotification, mapState]
  );

  return {
    handleSaveRoute,
    handleDeleteRoute,
  };
};

