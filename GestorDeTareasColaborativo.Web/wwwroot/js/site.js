const apiBaseUrl = 'https://localhost:7258';

document.addEventListener('DOMContentLoaded', function () {
    const btnAnadirTarea = document.querySelector('button.btn-primary');
    btnAnadirTarea.addEventListener('click', abrirModalParaCrear);

    const btnGuardar = document.getElementById('btn-guardar-tarea');
    btnGuardar.addEventListener('click', guardarTarea);

    const tablaBody = document.getElementById('tabla-tareas-body');
    tablaBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-editar')) {
            const id = event.target.dataset.taskId;
            abrirModalParaEditar(id);
        }
        if (event.target.classList.contains('btn-eliminar')) {
            const id = event.target.dataset.taskId;
            confirmarEliminacion(id);
        }
    });

    cargarTareas();
});

function cargarTareas() {
    const tablaBody = document.getElementById('tabla-tareas-body');
    tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando...</td></tr>';

    fetch(`${apiBaseUrl}/api/tareas`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar tareas.');
            return response.json();
        })
        .then(tareas => {
            tablaBody.innerHTML = '';
            if (tareas.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tareas para mostrar.</td></tr>';
            } else {
                tareas.forEach(tarea => {
                    let fila = `<tr>
                                    <td>${escapeHtml(tarea.titulo)}</td>
                                    <td>${escapeHtml(tarea.descripcion || '')}</td>
                                    <td>${escapeHtml(tarea.nombreUsuarioAsignado)}</td>
                                    <td>${obtenerBadgeEstado(tarea.nombreEstado)}</td>
                                    <td>${new Date(tarea.fechaVencimiento).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-info btn-editar" data-task-id="${tarea.id}">Editar</button>
                                        <button class="btn btn-sm btn-danger btn-eliminar" data-task-id="${tarea.id}">Eliminar</button>
                                    </td>
                                </tr>`;
                    tablaBody.innerHTML += fila;
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">No se pudieron cargar las tareas.</td></tr>';
        });
}

function obtenerBadgeEstado(nombreEstado) {
    let badgeClass = 'bg-secondary'; // Color por defecto
    switch (nombreEstado) {
        case 'Pendiente':
            // Añadimos 'text-dark' para que el texto sea legible sobre el fondo amarillo
            badgeClass = 'bg-warning text-dark';
            break;
        case 'En Progreso':
            badgeClass = 'bg-primary';
            break;
        case 'Completada':
            badgeClass = 'bg-success';
            break;
    }
    return `<span class="badge ${badgeClass}">${escapeHtml(nombreEstado)}</span>`;
}

function abrirModalParaCrear() {
    document.getElementById('form-tarea').reset();
    document.getElementById('tareaId').value = '';
    document.getElementById('tareaModalLabel').textContent = 'Añadir Nueva Tarea';
    cargarUsuarios();
    cargarEstados();
    $('#tareaModal').modal('show');
}

async function abrirModalParaEditar(id) {
    document.getElementById('form-tarea').reset();
    document.getElementById('tareaModalLabel').textContent = 'Editar Tarea';
    const tareaResponse = await fetch(`${apiBaseUrl}/api/tareas/${id}`);
    const tarea = await tareaResponse.json();
    await cargarUsuarios();
    await cargarEstados();
    document.getElementById('tareaId').value = tarea.id;
    document.getElementById('titulo').value = tarea.titulo;
    document.getElementById('descripcion').value = tarea.descripcion;
    document.getElementById('fechaVencimiento').value = new Date(tarea.fechaVencimiento).toISOString().split('T')[0];
    const usuarioResponse = await fetch(`${apiBaseUrl}/api/usuarios`);
    const usuarios = await usuarioResponse.json();
    const usuario = usuarios.find(u => u.nombreCompleto === tarea.nombreUsuarioAsignado);
    if (usuario) document.getElementById('usuarioId').value = usuario.id;
    const estadoResponse = await fetch(`${apiBaseUrl}/api/estados`);
    const estados = await estadoResponse.json();
    const estado = estados.find(e => e.nombre === tarea.nombreEstado);
    if (estado) document.getElementById('estadoId').value = estado.id;
    $('#tareaModal').modal('show');
}

function guardarTarea() {
    const form = document.getElementById('form-tarea');
    if (!form.checkValidity()) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    const id = document.getElementById('tareaId').value;
    const esEdicion = id !== '';
    const url = esEdicion ? `${apiBaseUrl}/api/tareas/${id}` : `${apiBaseUrl}/api/tareas`;
    const method = esEdicion ? 'PUT' : 'POST';
    const tareaData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaVencimiento: document.getElementById('fechaVencimiento').value,
        usuarioId: parseInt(document.getElementById('usuarioId').value),
        estadoId: parseInt(document.getElementById('estadoId').value)
    };
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tareaData),
    })
        .then(response => {
            if (!response.ok) throw new Error('Error al guardar la tarea.');
            $('#tareaModal').modal('hide');
            cargarTareas();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No se pudo guardar la tarea.');
        });
}

function confirmarEliminacion(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        fetch(`${apiBaseUrl}/api/tareas/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al eliminar la tarea.');
                cargarTareas();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('No se pudo eliminar la tarea.');
            });
    }
}

async function cargarUsuarios(idSeleccionado) {
    const select = document.getElementById('usuarioId');
    const response = await fetch(`${apiBaseUrl}/api/usuarios`);
    const usuarios = await response.json();
    select.innerHTML = '<option value="">Seleccione un usuario</option>';
    usuarios.forEach(u => {
        const selected = u.id === idSeleccionado ? 'selected' : '';
        select.innerHTML += `<option value="${u.id}" ${selected}>${escapeHtml(u.nombreCompleto)}</option>`;
    });
}

async function cargarEstados(idSeleccionado) {
    const select = document.getElementById('estadoId');
    const response = await fetch(`${apiBaseUrl}/api/estados`);
    const estados = await response.json();
    select.innerHTML = '';
    estados.forEach(e => {
        const selected = e.id === idSeleccionado ? 'selected' : '';
        select.innerHTML += `<option value="${e.id}" ${selected}>${escapeHtml(e.nombre)}</option>`;
    });
}

function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
}
