using GestorDeTareasColaborativo.Core.DTOs;
using GestorDeTareasColaborativo.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestorDeTareasColaborativo.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TareasController : ControllerBase
    {
        private readonly GestorDbContext _context;

        // Inyección de DbContext
        public TareasController(GestorDbContext context)
        {
            _context = context;
        }

        // GET: api/tareas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TareaDto>>> GetTareas()
        {
            var tareas = await _context.Tareas
                .Include(t => t.Usuario)
                .Include(t => t.Estado)
                .Where(t => !t.Eliminado) // Filtro para no mostrar las borradas lógicamente
                .Select(t => new TareaDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
                    FechaVencimiento = t.FechaVencimiento,
                    NombreEstado = t.Estado.Nombre,
                    NombreUsuarioAsignado = t.Usuario.NombreCompleto
                })
                .ToListAsync();

            return Ok(tareas);
        }

        // GET: api/usuarios
        [HttpGet("/api/usuarios")]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Select(u => new UsuarioDto { Id = u.Id, NombreCompleto = u.NombreCompleto })
                .ToListAsync();

            return Ok(usuarios);
        }

        // GET: api/estados
        [HttpGet("/api/estados")]
        public async Task<ActionResult<IEnumerable<EstadoDto>>> GetEstados()
        {
            var estados = await _context.Estados
                .Select(e => new EstadoDto { Id = e.Id, Nombre = e.Nombre })
                .ToListAsync();

            return Ok(estados);
        }

        // GET: api/tareas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TareaDto>> GetTarea(int id)
        {
            var tarea = await _context.Tareas
                .Include(t => t.Usuario)
                .Include(t => t.Estado)
                .Where(t => t.Id == id && !t.Eliminado)
                .Select(t => new TareaDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
                    FechaVencimiento = t.FechaVencimiento,
                    NombreEstado = t.Estado.Nombre,
                    NombreUsuarioAsignado = t.Usuario.NombreCompleto
                })
                .FirstOrDefaultAsync();

            if (tarea == null)
            {
                return NotFound(); // Retorna 404 si la tarea no se encuentra
            }

            return Ok(tarea);
        }

        // POST: api/tareas
        [HttpPost]
        public async Task<ActionResult<TareaDto>> PostTarea(UpsertTareaDto tareaDto)
        {
            // Mapeamos el DTO a la entidad de dominio
            var nuevaTarea = new GestorDeTareasColaborativo.Core.Models.Tarea
            {
                Titulo = tareaDto.Titulo,
                Descripcion = tareaDto.Descripcion,
                FechaVencimiento = tareaDto.FechaVencimiento,
                UsuarioId = tareaDto.UsuarioId,
                EstadoId = tareaDto.EstadoId,
                Eliminado = false // Por defecto al crear
            };

            _context.Tareas.Add(nuevaTarea);
            await _context.SaveChangesAsync();

            // Datos relacionados
            await _context.Entry(nuevaTarea).Reference(t => t.Usuario).LoadAsync();
            await _context.Entry(nuevaTarea).Reference(t => t.Estado).LoadAsync();

            var resultadoDto = new TareaDto
            {
                Id = nuevaTarea.Id,
                Titulo = nuevaTarea.Titulo,
                Descripcion = nuevaTarea.Descripcion,
                FechaVencimiento = nuevaTarea.FechaVencimiento,
                NombreEstado = nuevaTarea.Estado.Nombre,
                NombreUsuarioAsignado = nuevaTarea.Usuario.NombreCompleto
            };

            // 201 Created con la ubicación del nuevo recurso y el objeto creado
            return CreatedAtAction(nameof(GetTarea), new { id = nuevaTarea.Id }, resultadoDto);
        }

        // PUT: api/tareas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarea(int id, UpsertTareaDto tareaDto)
        {
            var tareaExistente = await _context.Tareas.FindAsync(id);

            if (tareaExistente == null || tareaExistente.Eliminado)
            {
                return NotFound();
            }

            // Actualizamos los campos del objeto existente
            tareaExistente.Titulo = tareaDto.Titulo;
            tareaExistente.Descripcion = tareaDto.Descripcion;
            tareaExistente.FechaVencimiento = tareaDto.FechaVencimiento;
            tareaExistente.UsuarioId = tareaDto.UsuarioId;
            tareaExistente.EstadoId = tareaDto.EstadoId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tareas.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // 204 No Content, estándar para PUT exitoso
        }

        // DELETE: api/tareas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarea(int id)
        {
            var tarea = await _context.Tareas.FindAsync(id);
            if (tarea == null)
            {
                return NotFound();
            }

            // Aplicamos la eliminación lógica
            tarea.Eliminado = true;
            await _context.SaveChangesAsync();

            return NoContent(); // Retornamos 204 No Content
        }
    }
}
