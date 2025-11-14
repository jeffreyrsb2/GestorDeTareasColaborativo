namespace GestorDeTareasColaborativo.Core.DTOs
{
    public class TareaDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string? Descripcion { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public string NombreEstado { get; set; }
        public string NombreUsuarioAsignado { get; set; }
    }
}
