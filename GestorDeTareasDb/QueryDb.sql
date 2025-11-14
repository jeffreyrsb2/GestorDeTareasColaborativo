-- Tabla para los estados de las tareas
CREATE TABLE [Estados] (
    [Id] INT PRIMARY KEY IDENTITY(1, 1),
    [Nombre] NVARCHAR(50) NOT NULL
);
GO

-- Estados definidos para el reto
INSERT INTO [Estados] (Nombre) VALUES ('Pendiente'), ('En Progreso'), ('Completada');
GO

-- Tabla para los usuarios del equipo
CREATE TABLE [Usuarios] (
    [Id] INT PRIMARY KEY IDENTITY(1, 1),
    [NombreCompleto] NVARCHAR(150) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- Tabla principal de Tareas
CREATE TABLE [Tareas] (
    [Id] INT PRIMARY KEY IDENTITY(1, 1),
    [Titulo] NVARCHAR(200) NOT NULL,
    [Descripcion] NVARCHAR(MAX) NULL,
    [FechaVencimiento] DATETIME2 NOT NULL,
    [Eliminado] BIT NOT NULL DEFAULT (0), -- Eliminación lógica
    
    -- Claves Foráneas
    [UsuarioId] INT NOT NULL,
    [EstadoId] INT NOT NULL DEFAULT (1) -- Por defecto, el estado es 'Pendiente' (Id=1)
);
GO

-- Definición de las relaciones (FOREIGN KEYS)
ALTER TABLE [Tareas] ADD CONSTRAINT [FK_Tareas_Usuarios] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuarios] ([Id]);
GO
ALTER TABLE [Tareas] ADD CONSTRAINT [FK_Tareas_Estados] FOREIGN KEY ([EstadoId]) REFERENCES [Estados] ([Id]);
GO

-- Inserción de Usuarios de ejemplo
INSERT INTO [Usuarios] (NombreCompleto, Email) VALUES 
('Ana Torres', 'ana.torres@example.com'),
('Carlos Vega', 'carlos.vega@example.com'),
('Sofia Reyes', 'sofia.reyes@example.com');
GO