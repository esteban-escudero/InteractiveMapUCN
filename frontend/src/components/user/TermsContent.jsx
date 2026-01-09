// components/user/TermsContent.jsx
import React from 'react';

function TermsContent() {
    return (
        <div>
            <h3>Términos y Condiciones de Uso</h3>
            <p>
                Al utilizar el Mapa Interactivo de la Universidad Católica del Norte, aceptas los
                siguientes términos y condiciones:
            </p>

            <h3>1. Uso de la Aplicación</h3>
            <p>
                Esta aplicación está destinada exclusivamente para facilitar la navegación dentro del
                campus de la UCN. El uso indebido de la plataforma está prohibido.
            </p>

            <h3>2. Privacidad y Datos de Ubicación</h3>
            <ul>
                <li>La geolocalización solo se usa para mostrarte tu posición en el mapa</li>
                <li>No almacenamos tu ubicación ni compartimos tus datos con terceros</li>
                <li>Puedes denegar el acceso a la ubicación en cualquier momento</li>
                <li>Los datos de navegación son anónimos y se usan solo para mejorar el servicio</li>
            </ul>

            <h3>3. Exactitud de la Información</h3>
            <p>
                Nos esforzamos por mantener la información actualizada y precisa, pero no garantizamos
                que todos los datos sean 100% exactos en todo momento. Las rutas y ubicaciones pueden
                variar debido a obras, eventos o cambios en el campus.
            </p>

            <h3>4. Limitación de Responsabilidad</h3>
            <p>
                La Universidad Católica del Norte no se hace responsable por:
            </p>
            <ul>
                <li>Errores en las rutas o ubicaciones mostradas</li>
                <li>Problemas técnicos o interrupciones del servicio</li>
                <li>Daños derivados del uso de la aplicación</li>
                <li>Decisiones tomadas basándose en la información proporcionada</li>
            </ul>

            <h3>5. Propiedad Intelectual</h3>
            <p>
                Todos los contenidos, diseños, logotipos y marcas son propiedad de la Universidad
                Católica del Norte. Está prohibida su reproducción sin autorización expresa.
            </p>

            <h3>6. Modificaciones</h3>
            <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                entrarán en vigor inmediatamente después de su publicación.
            </p>

            <h3>7. Contacto Legal</h3>
            <p>
                Para consultas legales o relacionadas con estos términos:<br />
                <strong>Email:</strong> @ucn.cl<br />
                <strong>Dirección:</strong> Larrondo 1281, Coquimbo, Chile
            </p>

            <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#888' }}>
                Última actualización: Enero 2026
            </p>
        </div>
    );
}

export default TermsContent;
