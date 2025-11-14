namespace GestorDeTareasColaborativo.Core.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; }
        public string Email { get; set; }
        public ICollection<Tarea> Tareas { get; set; } = new List<Tarea>();
    }
}
