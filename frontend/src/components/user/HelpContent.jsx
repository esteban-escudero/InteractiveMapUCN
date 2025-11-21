// components/user/HelpContent.jsx
import React from 'react';

function HelpContent() {
    return (
        <div>
            <h3>¿Cómo usar el Mapa Interactivo?</h3>
            <p>
                Esta guía te ayudará a aprovechar al máximo todas las funcionalidades del mapa.
            </p>

            <h3>🔍 Buscar Edificios y Salas</h3>
            <ul>
                <li>Toca el campo de búsqueda en la parte superior</li>
                <li>Escribe el nombre del edificio o sala que buscas</li>
                <li>Selecciona el resultado deseado de la lista</li>
                <li>El mapa se centrará automáticamente en la ubicación</li>
            </ul>

            <h3>🗺️ Calcular Rutas</h3>
            <ul>
                <li>Toca el botón de rutas (icono de dirección)</li>
                <li>Selecciona el punto de origen</li>
                <li>Selecciona el punto de destino</li>
                <li>Elige el tipo de ruta que prefieres</li>
                <li>Toca "Calcular Ruta" para ver el camino</li>
            </ul>

            <h3>📍 Tipos de Rutas Disponibles</h3>
            <ul>
                <li><strong>Peatonal:</strong> Ruta estándar para caminar</li>
                <li><strong>Accesible:</strong> Ruta adaptada para personas con movilidad reducida</li>
                <li><strong>Rápida:</strong> El camino más corto disponible</li>
                <li><strong>Emergencia:</strong> Rutas de evacuación y emergencia</li>
                <li><strong>Vehicular:</strong> Rutas para vehículos autorizados</li>
            </ul>

            <h3>📱 Usar Geolocalización</h3>
            <ul>
                <li>Toca el botón de ubicación (icono de GPS)</li>
                <li>Permite el acceso a tu ubicación cuando se solicite</li>
                <li>El mapa mostrará tu posición actual</li>
            </ul>

            <h3>🌙 Activar Modo Oscuro</h3>
            <ul>
                <li>Abre el menú lateral (icono de hamburguesa)</li>
                <li>Ve a la sección "Configuración"</li>
                <li>Toca "Modo oscuro" para activarlo</li>
            </ul>

            <h3>❓ Preguntas Frecuentes</h3>
            <p><strong>¿Por qué no aparece mi ubicación?</strong></p>
            <p>Asegúrate de haber permitido el acceso a la ubicación en tu navegador y que estés dentro del campus.</p>

            <p><strong>¿Qué hago si no encuentro un edificio?</strong></p>
            <p>Intenta buscar con diferentes términos o verifica la ortografía. Si el problema persiste, contáctanos.</p>

            <p><strong>¿Funciona sin conexión a internet?</strong></p>
            <p>Necesitas conexión a internet para cargar el mapa inicialmente, pero algunas funciones pueden funcionar offline.</p>
        </div>
    );
}

export default HelpContent;
