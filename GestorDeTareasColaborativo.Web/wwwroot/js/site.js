const apiBaseUrl = 'https://localhost:7258';
document.addEventListener('DOMContentLoaded', function () {
    // Asignamos el evento al botón de añadir tarea
    const btnAnadirTarea = document.querySelector('.btn-primary');
    btnAnadirTarea.addEventListener('click', abrirModalParaCrear);

    // Asignamos el evento al botón de guardar del modal
    const btnGuardar = document.getElementById('btn-guardar-tarea');
    btnGuardar.addEventListener('click', guardarTarea);

    cargarTareas();
});

function cargarTareas() {
    const spinner = document.getElementById('loading-spinner');
    const tablaBody = document.getElementById('tabla-tareas-body');

    spinner.style.display = 'block';
    tablaBody.innerHTML = '';

    fetch(`${apiBaseUrl}/api/tareas`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar los datos desde la API');
            return response.json();
        })
        .then(tareas => {
            spinner.style.display = 'none';
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
        })
        .catch(error => {
            spinner.style.display = 'none';
            console.error('Hubo un error:', error);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">No se pudieron cargar las tareas.</td></tr>';
        });
}

function abrirModalParaCrear() {
    // Reseteamos el formulario por si tenía datos previos
    document.getElementById('form-tarea').reset();
    document.getElementById('tareaModalLabel').textContent = 'Añadir Nueva Tarea';

    // Cargamos los datos para los dropdowns
    cargarUsuarios();
    cargarEstados();

    // Mostramos el modal usando jQuery
    $('#tareaModal').modal('show');
}

function cargarUsuarios() {
    const selectUsuarios = document.getElementById('usuarioId');
    selectUsuarios.innerHTML = '<option value="">Cargando...</option>';

    fetch(`${apiBaseUrl}/api/usuarios`)
        .then(response => response.json())
        .then(usuarios => {
            selectUsuarios.innerHTML = '<option value="">Seleccione un usuario</option>';
            usuarios.forEach(u => {
                selectUsuarios.innerHTML += `<option value="${u.id}">${escapeHtml(u.nombreCompleto)}</option>`;
            });
        });
}

function cargarEstados() {
    const selectEstados = document.getElementById('estadoId');
    selectEstados.innerHTML = '<option value="">Cargando...</option>';

    fetch(`${apiBaseUrl}/api/estados`)
        .then(response => response.json())
        .then(estados => {
            selectEstados.innerHTML = '';
            estados.forEach(e => {
                selectEstados.innerHTML += `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`;
            });
        });
}

function guardarTarea() {
    const form = document.getElementById('form-tarea');
    // Simple validación para campos requeridos
    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    const tareaData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaVencimiento: document.getElementById('fechaVencimiento').value,
        usuarioId: parseInt(document.getElementById('usuarioId').value),
        estadoId: parseInt(document.getElementById('estadoId').value)
    };

    fetch(`${apiBaseUrl}/api/tareas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tareaData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar la tarea.');
            }
            // Si la respuesta es exitosa (ejemplo: 201 Created)
            $('#tareaModal').modal('hide'); // Ocultamos el modal
            cargarTareas(); // Recargamos la lista de tareas para ver la nueva
        })
        .catch(error => {
            console.error('Error al crear la tarea:', error);
            alert('No se pudo guardar la tarea. Inténtelo de nuevo.');
        });
}

// Función para evitar inyecciones XSS simples
function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
}
