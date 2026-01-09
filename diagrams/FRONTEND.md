C:.
│   App.css
│   App.js
│   App.test.js
│   index.css
│   index.js
│   Simple.test.js
│
├───assets
│   └───images
│           login-bg.jpg
│
├───components
│   │   index.js
│   │
│   ├───admin
│   │   └───UserManagement
│   │           UserManagement.css
│   │           UserManagement.jsx
│   │
│   ├───auth
│   │       LoginForm.css
│   │       LoginForm.jsx
│   │       ProtectedRoute.jsx
│   │
│   ├───buildings
│   │   │   index.js
│   │   │
│   │   ├───BuildingForm
│   │   │   │   BuildingForm.css
│   │   │   │   BuildingForm.jsx
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingDetailsSection.jsx
│   │   │   │       BuildingFormUI.jsx
│   │   │   │       CoordinateSection.jsx
│   │   │   │       FloorImageList.jsx
│   │   │   │       FloorImageSection.css
│   │   │   │       FloorImageSection.jsx
│   │   │   │       FloorImageUpload.jsx
│   │   │   │       FormActions.jsx
│   │   │   │       TypeStatusSection.css
│   │   │   │       TypeStatusSection.jsx
│   │   │   │
│   │   │   └───hooks
│   │   │           useBuildingForm.jsx
│   │   │           useBuildingValidation.jsx
│   │   │           useCoordinateCapture.jsx
│   │   │
│   │   ├───BuildingList
│   │   │   │   BuildingList.css
│   │   │   │   BuildingList.jsx
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingCard.jsx
│   │   │   │       BuildingListFooter.jsx
│   │   │   │       BuildingListHeader.jsx
│   │   │   │       EmptyState.jsx
│   │   │   │       RoomItem.jsx
│   │   │   │       RoomSection.jsx
│   │   │   │       SearchBar.jsx
│   │   │   │
│   │   │   └───hooks
│   │   │           useBuildingList.jsx
│   │   │
│   │   └───RoomManagement
│   │       │   RoomManagement.css
│   │       │   RoomManagement.jsx
│   │       │
│   │       ├───components
│   │       │       BuildingSelection.jsx
│   │       │       RoomActions.jsx
│   │       │       RoomFields.jsx
│   │       │       RoomForm.jsx
│   │       │       RoomList.jsx
│   │       │       RoomManagementHeader.jsx
│   │       │
│   │       └───hooks
│   │               useRoomForm.jsx
│   │               useRoomManagement.jsx
│   │
│   ├───Map
│   │   │   index.js
│   │   │
│   │   ├───BuildingRenderer
│   │   │   │   BuildingRenderer.jsx
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingMapModal.css
│   │   │   │       BuildingMapModal.jsx
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       useBuildingMarkers.js
│   │   │   │
│   │   │   └───utils
│   │   │           buildingIcons.js
│   │   │           buildingPopup.js
│   │   │
│   │   ├───Map
│   │   │   │   Map.css
│   │   │   │   Map.jsx
│   │   │   │
│   │   │   └───components
│   │   │           index.js
│   │   │           MapContainer.jsx
│   │   │           MapForms.jsx
│   │   │           MapLayers.jsx
│   │   │           MapLists.jsx
│   │   │
│   │   ├───MapIndicators
│   │   │       MapIndicators.jsx
│   │   │
│   │   └───RouteLayer
│   │           RouteLayer.css
│   │           RouteLayer.jsx
│   │
│   ├───routes
│   │   │   index.js
│   │   │
│   │   ├───RouteForm
│   │   │   │   RouteFormPolyline.css
│   │   │   │   RouteFormPolyline.jsx
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       useMapSelection.js
│   │   │   │       usePolylineRoute.js
│   │   │   │       useRouteCalculations.js
│   │   │   │       useRouteForm.js
│   │   │   │
│   │   │   └───utils
│   │   │           polylineGeometry.js
│   │   │           polylineIcons.js
│   │   │           polylineValidation.js
│   │   │
│   │   ├───RouteList
│   │   │       RouteList.css
│   │   │       RouteList.jsx
│   │   │
│   │   └───RouteNetwork
│   │           RouteNetwork.css
│   │           RouteNetwork.jsx
│   │
│   ├───ui
│   │   │   index.js
│   │   │
│   │   ├───ConfirmDialog
│   │   │       ConfirmDialog.css
│   │   │       ConfirmDialog.jsx
│   │   │
│   │   ├───Notification
│   │   │       UINotification.css
│   │   │       UINotification.jsx
│   │   │
│   │   └───SidePanel
│   │           SidePanel.css
│   │           SidePanel.jsx
│   │
│   └───user
│       │   AboutContent.jsx
│       │   dark-mode.css
│       │   HelpContent.jsx
│       │   index.js
│       │   info-modal.css
│       │   InfoModal.jsx
│       │   mobile-components.css
│       │   MobileInfoPanel.jsx
│       │   MobileMapControls.jsx
│       │   MobileMenu.jsx
│       │   MobileRoutePanel.jsx
│       │   MobileSearchBar.jsx
│       │   rounded-search.css
│       │   route-panel-fix.css
│       │   TermsContent.jsx
│       │   UserMapView.css
│       │   UserMapView.jsx
│       │
│       └───hooks
│               useUserMapHandlers.js
│               useUserMapInit.js
│
├───config
│       app.js
│
├───constants
│       constants.ts
│       mapConfig.js
│
├───contexts
│       AuthContext.js
│
├───hooks
│   │   index.js
│   │
│   ├───buildings
│   │       index.js
│   │       useBuildingFilters.js
│   │       useBuildingHandlers.js
│   │       useBuildings.js
│   │       useRoomHandlers.js
│   │
│   ├───common
│   │       useConfirm.js
│   │       useNotification.js
│   │       useProximity.js
│   │
│   ├───geoserver
│   │       index.js
│   │       useGeoServer.js
│   │       useGeoServerAnalytics.js
│   │       useGeoServerData.js
│   │       useGeoServerMap.js
│   │
│   ├───map
│   │       useBusinessHandlers.js
│   │       useCoordinateManagement.js
│   │       useInteractionHandlers.js
│   │       useMap.js
│   │       useMapActions.js
│   │       useMapClickHandler.js
│   │       useMapData.js
│   │       useMapEffects.js
│   │       useMapManagement.js
│   │       useMapOperations.js
│   │       useMapState.js
│   │
│   ├───routes
│   │       index.js
│   │       useRouteAnalytics.js
│   │       useRouteCRUD.js
│   │       useRouteHandlers.js
│   │       useRouteIntelligence.js
│   │       useRouteQueries.js
│   │       useRoutes.js
│   │       useRouteUtils.js
│   │
│   └───user
│           useGeolocation.js
│           useTheme.js
│           useURLParams.js
│
├───services
│   │   api.js
│   │   authService.js
│   │   buildingImageService.js
│   │   buildingService.js
│   │   geoServerAPI.js
│   │   proximityService.js
│   │   roomService.js
│   │   routeService.js
│   │   userService.js
│   │
│   └───api
│           index.js
│
├───styles
│       globals.css
│
└───utils
    │   mapUtils.js
    │   spatialUtils.js
    │
    ├───buildings
    │       buildingAnalytics.js
    │       buildingQueries.js
    │
    └───routing
            graphAlgorithms.js
            routeGeometry.js
    │       buildingAnalytics.js
    │       buildingQueries.js
    │
    └───routing
            graphAlgorithms.js
            routeGeometry.js

    │       buildingAnalytics.js
    │       buildingQueries.js
    │
    └───routing
            graphAlgorithms.js
            routeGeometry.js