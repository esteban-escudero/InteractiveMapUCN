# Glosario Técnico - InteractiveMapUCN

Este documento define los términos técnicos clave utilizados en el desarrollo y arquitectura del proyecto InteractiveMapUCN.

## A

### API (Application Programming Interface)
Conjunto de definiciones y protocolos que permite que el Frontend y el Backend se comuniquen entre sí. En este proyecto se utiliza una API RESTful.

### Autenticación JWT
Mecanismo de seguridad que utiliza **JSON Web Tokens** para validar la identidad de los administradores. Permite que el servidor confíe en las peticiones del cliente sin mantener sesiones en memoria.

## B

### Backend
La parte del servidor de la aplicación. Maneja la lógica de negocio, la base de datos y la seguridad. Construido con **Node.js** y **Express**.

### bcryptjs
Librería utilizada para el **hashing de contraseñas**. Asegura que las contraseñas de los usuarios no se guarden en texto plano en la base de datos.

## C

### Componente (React)
Bloque de construcción fundamental de la interfaz de usuario en **React**. Pieza de código reutilizable que devuelve elementos HTML (JSX).

### CORS (Cross-Origin Resource Sharing)
Mecanismo de seguridad que permite que recursos restringidos en una página web sean solicitados desde otro dominio fuera del dominio desde el cual se sirvió el primer recurso.

### CRUD
Acrónimo de **Create, Read, Update, Delete**. Se refiere a las cuatro operaciones básicas de almacenamiento persistente (Crear, Leer, Actualizar, Eliminar).

## D

### Dijkstra (Algoritmo)
Algoritmo utilizado para encontrar el camino más corto entre nodos en un grafo. Se utiliza en el servicio de rutas para calcular la navegación óptima dentro del campus.

### Docker
Plataforma que utiliza contenedores a nivel de sistema operativo para entregar software en paquetes llamados contenedores. Facilita el despliegue del proyecto.

## E

### Express
Framework web para Node.js, diseñado para construir aplicaciones web y APIs de manera robusta y escalable.

## F

### Frontend
La parte cliente de la aplicación que interactúa con el usuario. Construida con **React**.

## G

### GeoJSON
Formato estándar basado en JSON para codificar estructuras de datos geográficos. Se utiliza para representar edificios (polígonos) y puntos de interés.

### Grafo
Estructura de datos que consiste en nodos (vértices) conectados por aristas (edges). En este proyecto, se usa para representar la red de rutas del campus para el cálculo de navegación.

## H

### Hook (React)
Función que permite "enganchar" el estado de React y el ciclo de vida desde componentes funcionales (ej. `useState`, `useEffect`).

## J

### JSX (JavaScript XML)
Extensión de sintaxis para JavaScript que permite escribir código similar a HTML dentro de JavaScript. Es fundamental en React para definir la estructura de los componentes.

## L

### Leaflet
Biblioteca JavaScript de código abierto para mapas interactivos aptos para móviles. Es el núcleo de la visualización del mapa en este proyecto.

### Let's Encrypt
Autoridad de certificación gratuita, automatizada y abierta que proporciona certificados SSL/TLS para habilitar HTTPS en sitios web.

## M

### Middleware
Software que actúa como un puente entre una petición HTTP y la función controladora final. Se usa para validaciones, autenticación y manejo de errores.

### Multer
Middleware de Node.js para manejar `multipart/form-data`, utilizado principalmente para la carga de archivos. En este proyecto se usa para subir imágenes de planos de edificios.

## N

### Nginx
Servidor web de alto rendimiento y proxy inverso. Se utiliza en producción para servir la aplicación y manejar certificados SSL.

### Node.js
Entorno de ejecución para JavaScript construido con el motor V8 de Chrome. Permite ejecutar JavaScript en el servidor.

## P

### PM2
Gestor de procesos de producción para aplicaciones Node.js. Mantiene la aplicación activa ininterrumpidamente.

### Polígono
Forma geométrica cerrada definida por una serie de coordenadas. En este proyecto, los edificios se representan como polígonos en el mapa.

### Polyline
Línea compuesta por múltiples segmentos conectados. Las rutas del campus se representan como polylines en el mapa.

### PostGIS
Extensión de base de datos para **PostgreSQL** que añade soporte para objetos geográficos, permitiendo consultas espaciales (distancia, intersección, etc.).

### PostgreSQL
Sistema de gestión de bases de datos relacional de objetos. Es el almacenamiento principal de datos del proyecto.

### Proximidad (Análisis de)
Conjunto de herramientas geoespaciales que permiten calcular distancias entre edificios y rutas, encontrar elementos cercanos y analizar relaciones espaciales.

### PWA (Progressive Web App)
Aplicación web que utiliza capacidades modernas de la web para ofrecer una experiencia similar a una aplicación nativa (instalable, offline, notificaciones).

## R

### React
Librería de JavaScript para construir interfaces de usuario, desarrollada por Facebook.

### REST (Representational State Transfer)
Estilo de arquitectura de software para sistemas hipermedia distribuidos como la World Wide Web.

## S

### Service Worker
Script que el navegador ejecuta en segundo plano, separado de la página web. Es clave para las funcionalidades de PWA como el soporte offline.

### SIG/GIS (Sistema de Información Geográfica)
Sistema diseñado para capturar, almacenar, manipular, analizar, gestionar y presentar datos geográficos o espaciales.

### SPA (Single Page Application)
Aplicación web que interactúa con el usuario reescribiendo dinámicamente la página web actual con nuevos datos del servidor web, en lugar de cargar páginas enteras.

### SSL/TLS
Protocolos criptográficos que proporcionan comunicaciones seguras a través de una red. Se utiliza para habilitar HTTPS en el sitio web.

## T

### Turf.js
Librería JavaScript de análisis geoespacial avanzado. Proporciona funciones para calcular distancias, áreas, intersecciones, rutas óptimas y otros análisis espaciales.

## W

### Web App Manifest
Archivo JSON que proporciona información sobre la aplicación (nombre, autor, icono, descripción) en un archivo de texto JSON estándar. Necesario para que la PWA sea instalable.
