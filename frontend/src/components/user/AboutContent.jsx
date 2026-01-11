// components/user/AboutContent.jsx
import React from 'react';

function AboutContent() {
    return (
        <div>
            <h3>Mapa Interactivo UCN - Coquimbo</h3>
            <p>
                El Mapa Interactivo de la Universidad Católica del Norte (Sede Coquimbo) es una herramienta diseñada
                para facilitar la navegación dentro del campus universitario, permitiendo a estudiantes,
                profesores y visitantes encontrar edificios, salas y servicios de manera rápida y eficiente.
            </p>

            <h3>Características Principales</h3>
            <ul>
                <li><strong>Búsqueda Inteligente:</strong> Encuentra edificios y salas por nombre o tipo</li>
                <li><strong>Cálculo de Rutas:</strong> Obtén la mejor ruta entre dos puntos</li>
                <li><strong>Tipos de Ruta:</strong> Peatonal y accesible para diferentes necesidades</li>
                <li><strong>Geolocalización:</strong> Encuentra tu ubicación actual en el campus</li>
                <li><strong>Modo Oscuro:</strong> Interfaz adaptable para mayor comodidad</li>
            </ul>

            <h3>Información del Proyecto</h3>
            <p>
                <strong>Versión:</strong> 1.1.3<br />
                <strong>Universidad:</strong> Universidad Católica del Norte<br />
                <strong>Campus:</strong> Guayacán, Coquimbo
            </p>

            <h3>Contacto</h3>
            <p>
                Para consultas, sugerencias o reportar problemas, puedes contactarnos a través de:<br />
                <strong>Email:</strong> @ucn.cl<br />
                <strong>Web:</strong> <a href="https://www.ucn.cl" target="_blank" rel="noopener noreferrer">www.ucn.cl</a>
            </p>
        </div>
    );
}

export default AboutContent;
