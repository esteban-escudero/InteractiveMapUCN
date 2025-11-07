// src/components/RouteNetwork/RouteNetwork.js
import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/routeService'; // ✅ CORRECTO
import { SpatialUtils } from '../../utils/spatialUtils'; // ✅ CORRECTO
import './RouteNetwork.css'; // ✅ Este archivo no existe - vamos a crearlo

const RouteNetwork = ({ mapInstance, onNodeClick, onRouteClick }) => {
  const [sharedNodes, setSharedNodes] = useState([]);
  const [networkAnalysis, setNetworkAnalysis] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // ✅ CARGAR NODOS COMPARTIDOS DESDE FRONTEND (sin backend por ahora)
  const loadSharedNodes = async () => {
    setLoading(true);
    try {
      console.log('🔗 Calculando nodos compartidos desde frontend...');
      await calculateSharedNodesFromFrontend();
    } catch (error) {
      console.error('❌ Error cargando nodos compartidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCULAR NODOS COMPARTIDOS DESDE RUTAS EXISTENTES
  const calculateSharedNodesFromFrontend = async () => {
    try {
      const routesResponse = await routeService.getAllRoutes();
      const routes = Array.isArray(routesResponse) ? routesResponse : routesResponse.data;
      
      if (!routes || routes.length === 0) {
        console.log('📭 No hay rutas para analizar');
        setSharedNodes([]);
        return;
      }
      
      const allPoints = [];
      
      // Recopilar todos los puntos de todas las rutas
      routes.forEach(route => {
        if (route.puntos_ruta && Array.isArray(route.puntos_ruta)) {
          route.puntos_ruta.forEach(punto => {
            if (punto.coordenadas && punto.coordenadas.coordinates) {
              const [lng, lat] = punto.coordenadas.coordinates;
              allPoints.push({
                id: `${route.id}-${punto.orden}`,
                routeId: route.id,
                routeName: route.nombre,
                orden: punto.orden,
                tipo_punto: punto.tipo_punto,
                coordenadas: { lng, lat },
                nombre: punto.nombre_punto || `Punto ${punto.orden}`
              });
            }
          });
        }
      });
      
      // Encontrar puntos cercanos (nodos compartidos)
      const sharedNodesMap = new Map();
      const toleranceMeters = 10; // 10 metros de tolerancia
      
      allPoints.forEach(point => {
        const key = `${point.coordenadas.lng.toFixed(6)},${point.coordenadas.lat.toFixed(6)}`;
        
        if (!sharedNodesMap.has(key)) {
          sharedNodesMap.set(key, {
            id: key,
            coordenadas: point.coordenadas,
            rutas: [],
            total_rutas: 0,
            nombres_rutas: []
          });
        }
        
        const node = sharedNodesMap.get(key);
        if (!node.rutas.some(r => r.routeId === point.routeId)) {
          node.rutas.push({
            routeId: point.routeId,
            routeName: point.routeName,
            orden: point.orden,
            tipo_punto: point.tipo_punto
          });
          node.total_rutas = node.rutas.length;
          node.nombres_rutas = node.rutas.map(r => r.routeName);
        }
      });
      
      // Convertir a array y filtrar nodos compartidos (más de 1 ruta)
      const sharedNodesArray = Array.from(sharedNodesMap.values())
        .filter(node => node.total_rutas > 1)
        .sort((a, b) => b.total_rutas - a.total_rutas);
      
      setSharedNodes(sharedNodesArray);
      console.log(`📍 ${sharedNodesArray.length} nodos compartidos calculados`);
      
    } catch (error) {
      console.error('❌ Error calculando nodos compartidos:', error);
      setSharedNodes([]);
    }
  };

  // ✅ ANALIZAR RED
  const analyzeNetwork = () => {
    if (sharedNodes.length === 0) {
      setNetworkAnalysis(null);
      return;
    }
    
    const analysis = {
      total_nodos_compartidos: sharedNodes.length,
      nodos_por_rutas: {},
      ruta_mas_conectada: null,
      conexiones_totales: 0
    };
    
    // Contar nodos por número de rutas
    sharedNodes.forEach(node => {
      analysis.nodos_por_rutas[node.total_rutas] = 
        (analysis.nodos_por_rutas[node.total_rutas] || 0) + 1;
      analysis.conexiones_totales += node.total_rutas;
    });
    
    // Encontrar ruta más conectada
    const routeConnections = {};
    sharedNodes.forEach(node => {
      node.rutas.forEach(route => {
        routeConnections[route.routeId] = 
          (routeConnections[route.routeId] || 0) + 1;
      });
    });
    
    if (Object.keys(routeConnections).length > 0) {
      const mostConnected = Object.entries(routeConnections)
        .sort(([,a], [,b]) => b - a)[0];
      
      // Encontrar nombre de la ruta
      const routeName = sharedNodes
        .flatMap(node => node.rutas)
        .find(route => route.routeId == mostConnected[0])?.routeName || 'Desconocida';
      
      analysis.ruta_mas_conectada = {
        id_ruta: mostConnected[0],
        nombre: routeName,
        conexiones: mostConnected[1]
      };
    }
    
    setNetworkAnalysis(analysis);
    console.log('📊 Análisis de red:', analysis);
  };

  // ✅ RENDERIZAR NODOS EN EL MAPA
  const renderNodesOnMap = () => {
    if (!mapInstance || sharedNodes.length === 0) return;
    
    // Limpiar marcadores anteriores
    clearNodesFromMap();
    
    sharedNodes.forEach(node => {
      try {
        const { lng, lat } = node.coordenadas;
        
        // Crear icono según número de rutas compartidas
        const iconSize = Math.min(20 + (node.total_rutas * 5), 40);
        const color = getNodeColor(node.total_rutas);
        
        const icon = window.L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              width: ${iconSize}px;
              height: ${iconSize}px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 12px;
            ">${node.total_rutas}</div>
          `,
          iconSize: [iconSize + 6, iconSize + 6],
          className: 'shared-node-marker'
        });
        
        const marker = window.L.marker([lat, lng], { icon })
          .addTo(mapInstance);
        
        // Popup informativo
        const popupContent = `
          <div class="node-popup">
            <h4>🔗 Nodo Compartido</h4>
            <p><strong>Rutas que comparten:</strong> ${node.total_rutas}</p>
            <p><strong>Coordenadas:</strong><br>
            ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
            <div class="route-list">
              <strong>Rutas:</strong>
              <ul>
                ${node.rutas.map(route => 
                  `<li>${route.routeName} (${route.tipo_punto})</li>`
                ).join('')}
              </ul>
            </div>
            <div class="node-actions">
              <button class="node-btn zoom-btn" data-lat="${lat}" data-lng="${lng}">
                🔍 Zoom
              </button>
              <button class="node-btn select-btn" data-node-id="${node.id}">
                📋 Detalles
              </button>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Eventos
        marker.on('click', (e) => {
          window.L.DomEvent.stopPropagation(e);
          setSelectedNode(node);
          onNodeClick?.(node);
        });
        
        // Guardar referencia
        node.marker = marker;
        
      } catch (error) {
        console.error('❌ Error renderizando nodo:', error);
      }
    });
    
    console.log(`🗺️ ${sharedNodes.length} nodos renderizados en el mapa`);
  };

  // ✅ OBTENER COLOR SEGÚN NÚMERO DE RUTAS
  const getNodeColor = (numRoutes) => {
    const colors = {
      2: '#3498db',  // Azul para 2 rutas
      3: '#f39c12',  // Naranja para 3 rutas  
      4: '#e74c3c',  // Rojo para 4+ rutas
      5: '#9b59b6'   // Púrpura para 5+ rutas
    };
    return colors[numRoutes] || colors[5] || '#27ae60';
  };

  // ✅ LIMPIAR NODOS DEL MAPA
  const clearNodesFromMap = () => {
    if (!mapInstance) return;
    
    sharedNodes.forEach(node => {
      if (node.marker && mapInstance.hasLayer(node.marker)) {
        mapInstance.removeLayer(node.marker);
      }
    });
  };

  // ✅ MANEJAR CLIC EN BOTONES DEL POPUP
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = (e) => {
      const button = e.target;
      
      if (button.classList.contains('node-btn')) {
        if (button.classList.contains('zoom-btn')) {
          // Zoom al nodo
          const lat = parseFloat(button.getAttribute('data-lat'));
          const lng = parseFloat(button.getAttribute('data-lng'));
          
          mapInstance.setView([lat, lng], 18);
          console.log(`🔍 Zoom a nodo: ${lat}, ${lng}`);
          
        } else if (button.classList.contains('select-btn')) {
          // Mostrar detalles del nodo
          const nodeId = button.getAttribute('data-node-id');
          const node = sharedNodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            onNodeClick?.(node);
          }
        }
      }
    };

    const mapContainer = mapInstance.getContainer();
    mapContainer.addEventListener('click', handleMapClick);

    return () => {
      mapContainer.removeEventListener('click', handleMapClick);
    };
  }, [mapInstance, sharedNodes, onNodeClick]);

  // ✅ EFECTOS
  useEffect(() => {
    if (visible) {
      loadSharedNodes();
    } else {
      clearNodesFromMap();
      setSharedNodes([]);
      setSelectedNode(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && sharedNodes.length > 0) {
      renderNodesOnMap();
      analyzeNetwork();
    }
  }, [sharedNodes, visible]);

  if (!visible) return null;

  return (
    <div className="route-network-panel">
      <div className="network-header">
        <h3>🔗 Red de Rutas</h3>
        <button 
          className="close-btn"
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      </div>

      <div className="network-controls">
        <button 
          className="refresh-btn"
          onClick={loadSharedNodes}
          disabled={loading}
        >
          {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
        </button>
        
        <button 
          className="analyze-btn"
          onClick={analyzeNetwork}
          disabled={sharedNodes.length === 0}
        >
          📊 Analizar Red
        </button>
      </div>

      {loading && (
        <div className="loading-message">
          Cargando nodos compartidos...
        </div>
      )}

      {networkAnalysis && (
        <div className="network-analysis">
          <h4>Estadísticas de la Red</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Nodos compartidos:</span>
              <span className="stat-value">{networkAnalysis.total_nodos_compartidos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Conexiones totales:</span>
              <span className="stat-value">{networkAnalysis.conexiones_totales}</span>
            </div>
            {networkAnalysis.ruta_mas_conectada && (
              <div className="stat-item">
                <span className="stat-label">Ruta más conectada:</span>
                <span className="stat-value">
                  {networkAnalysis.ruta_mas_conectada.nombre} ({networkAnalysis.ruta_mas_conectada.conexiones})
                </span>
              </div>
            )}
          </div>
          
          <div className="distribution">
            <h5>Distribución por rutas:</h5>
            {Object.entries(networkAnalysis.nodos_por_rutas)
              .sort(([a], [b]) => b - a)
              .map(([numRutas, count]) => (
                <div key={numRutas} className="dist-item">
                  <span className="dist-label">{numRutas} ruta(s):</span>
                  <span className="dist-value">{count} nodos</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div className="nodes-list">
        <h4>Nodos Compartidos ({sharedNodes.length})</h4>
        <div className="nodes-container">
          {sharedNodes.map(node => (
            <div 
              key={node.id}
              className={`node-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedNode(node);
                onNodeClick?.(node);
                
                // Zoom al nodo en el mapa
                if (mapInstance) {
                  mapInstance.setView([node.coordenadas.lat, node.coordenadas.lng], 18);
                }
              }}
            >
              <div 
                className="node-color" 
                style={{ backgroundColor: getNodeColor(node.total_rutas) }}
              >
                {node.total_rutas}
              </div>
              <div className="node-info">
                <div className="node-coords">
                  {node.coordenadas.lat.toFixed(4)}, {node.coordenadas.lng.toFixed(4)}
                </div>
                <div className="node-routes">
                  {node.total_rutas} ruta(s) compartida(s)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="node-details">
          <h4>Detalles del Nodo</h4>
          <div className="detail-item">
            <strong>Coordenadas:</strong> 
            {selectedNode.coordenadas.lat.toFixed(6)}, {selectedNode.coordenadas.lng.toFixed(6)}
          </div>
          <div className="detail-item">
            <strong>Rutas que pasan por aquí:</strong>
          </div>
          <div className="routes-list">
            {selectedNode.rutas.map(route => (
              <div 
                key={`${route.routeId}-${route.orden}`}
                className="route-item"
                onClick={() => onRouteClick?.(route)}
              >
                <span className="route-name">{route.routeName}</span>
                <span className="route-type">{route.tipo_punto}</span>
                <span className="route-order">Orden: {route.orden}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estilos CSS INLINE porque el archivo CSS no existe */}
      <style>
        {`
          .route-network-panel {
            position: absolute;
            top: 100px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            overflow-y: auto;
            padding: 15px;
          }
          
          .network-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          
          .network-header h3 {
            margin: 0;
            color: #2c3e50;
          }
          
          .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #7f8c8d;
          }
          
          .network-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .network-controls button {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
          }
          
          .refresh-btn { background: #3498db; color: white; }
          .analyze-btn { background: #27ae60; color: white; }
          .network-controls button:disabled { background: #bdc3c7; cursor: not-allowed; }
          
          .network-analysis {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
          }
          
          .stats-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }
          
          .stat-label { color: #666; }
          .stat-value { font-weight: bold; color: #2c3e50; }
          
          .distribution {
            margin-top: 10px;
          }
          
          .dist-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin: 4px 0;
          }
          
          .nodes-list h4 {
            margin: 15px 0 10px 0;
            color: #2c3e50;
          }
          
          .nodes-container {
            max-height: 200px;
            overflow-y: auto;
          }
          
          .node-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid #eee;
            border-radius: 5px;
            margin-bottom: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .node-item:hover {
            background-color: #f8f9fa;
          }
          
          .node-item.selected {
            background-color: #e3f2fd;
            border-color: #2196f3;
          }
          
          .node-color {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
          }
          
          .node-info {
            flex: 1;
          }
          
          .node-coords {
            font-size: 11px;
            color: #666;
          }
          
          .node-routes {
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
          }
          
          .node-details {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
          
          .detail-item {
            margin-bottom: 8px;
            font-size: 13px;
          }
          
          .routes-list {
            max-height: 150px;
            overflow-y: auto;
          }
          
          .route-item {
            padding: 6px;
            border: 1px solid #eee;
            border-radius: 4px;
            margin-bottom: 5px;
            cursor: pointer;
            font-size: 12px;
          }
          
          .route-item:hover {
            background-color: #f0f0f0;
          }
          
          .route-name {
            font-weight: bold;
            display: block;
          }
          
          .route-type, .route-order {
            font-size: 11px;
            color: #666;
          }
          
          .loading-message {
            text-align: center;
            padding: 20px;
            color: #666;
          }
        `}
      </style>
    </div>
  );
};

export default RouteNetwork;