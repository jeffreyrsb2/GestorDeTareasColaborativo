// URL base de API
const apiBaseUrl = 'https://localhost:7258';

document.addEventListener('DOMContentLoaded', function () {
    cargarTareas();
});

function cargarTareas() {
    const spinner = document.getElementById('loading-spinner');
    const tablaBody = document.getElementById('tabla-tareas-body');

    spinner.style.display = 'block'; // Muestra el spinner
    tablaBody.innerHTML = ''; // Limpia la tabla

    fetch(`${apiBaseUrl}/api/tareas`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos desde la API');
            }
            return response.json();
        })
        .then(tareas => {
            if (tareas.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas para mostrar.</td></tr>';
            } else {
                tareas.forEach(tarea => {
                    let fila = `<tr>
                                    <td>${escapeHtml(tarea.titulo)}</td>
                                    <td>${escapeHtml(tarea.descripcion || '')}</td>
                                    <td>${escapeHtml(tarea.nombreUsuarioAsignado)}</td>
                                    <td>${escapeHtml(tarea.nombreEstado)}</td>
                                    <td>${new Date(tarea.fechaVencimiento).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-info">Editar</button>
                                        <button class="btn btn-sm btn-danger">Eliminar</button>
                                    </td>
                                </tr>`;
                    tablaBody.innerHTML += fila;
                });
            }
            spinner.style.display = 'none'; // Oculta el spinner
        })
        .catch(error => {
            console.error('Hubo un error:', error);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">No se pudieron cargar las tareas. Revisa la conexión con la API.</td></tr>';
            spinner.style.display = 'none'; // Oculta el spinner en caso de error
        });
}

// Función para evitar inyecciones XSS simples
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
