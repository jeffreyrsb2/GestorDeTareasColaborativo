using GestorDeTareasColaborativo.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace GestorDeTareasColaborativo.Data.Data
{
    public class GestorDbContext : DbContext
    {
        public GestorDbContext(DbContextOptions<GestorDbContext> options) : base(options)
        {
        }

        public DbSet<Tarea> Tareas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Estado> Estados { get; set; }

        // Inserciones de prueba (seed data)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed para la tabla Estados
            modelBuilder.Entity<Estado>().HasData(
                new Estado { Id = 1, Nombre = "Pendiente" },
                new Estado { Id = 2, Nombre = "En Progreso" },
                new Estado { Id = 3, Nombre = "Completada" }
            );

            // Seed para la tabla Usuarios
            modelBuilder.Entity<Usuario>().HasData(
                new Usuario { Id = 1, NombreCompleto = "Ana Torres", Email = "ana.torres@example.com" },
                new Usuario { Id = 2, NombreCompleto = "Carlos Vega", Email = "carlos.vega@example.com" },
                new Usuario { Id = 3, NombreCompleto = "Sofia Reyes", Email = "sofia.reyes@example.com" }
            );
        }
    }
}
