using System.ComponentModel.DataAnnotations;

namespace GestorDeTareasColaborativo.Core.DTOs
{
    // DTO para las operaciones de Crear y Actualizar Tareas.
    public class UpsertTareaDto
    {
        [Required(ErrorMessage = "El título es obligatorio.")]
        [StringLength(200)]
        public string Titulo { get; set; }

        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "La fecha de vencimiento es obligatoria.")]
        public DateTime FechaVencimiento { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        public int EstadoId { get; set; }
    }
}
