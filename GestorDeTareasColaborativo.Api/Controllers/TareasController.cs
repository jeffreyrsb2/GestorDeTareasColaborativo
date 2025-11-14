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
    }
}
