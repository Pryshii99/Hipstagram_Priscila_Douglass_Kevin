-- Database: Hisptagram

-- DROP DATABASE IF EXISTS "Hisptagram";

CREATE DATABASE "Hisptagram"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Guatemala.1252'
    LC_CTYPE = 'Spanish_Guatemala.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


	CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user'
);

SELECT * FROM usuarios;


TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

-- 1. Tabla de USUARIOS (Tabla Padre)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY, -- SERIAL es el AUTO_INCREMENT de Postgres
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) CHECK (rol IN ('ADMIN', 'USER')) DEFAULT 'USER',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de PUBLICACION (Tabla Hija)
CREATE TABLE IF NOT EXISTS publicacion (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    s3_key VARCHAR(255) NOT NULL, -- Aquí guardarás el nombre de la foto local
    descripcion VARCHAR(128), -- El límite de 128 del Ing. Morales
    esta_moderado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT 
);

-- 3. TABLA DE HASHTAGS
CREATE TABLE IF NOT EXISTS hashtags (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 4. RELACIÓN MUCHOS A MUCHOS
CREATE TABLE IF NOT EXISTS publicacion_hashtags (
    publicacion_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    PRIMARY KEY (publicacion_id, hashtag_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicacion(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
);

-- 5. TABLA DE VOTOS (Likes/Dislikes)
CREATE TABLE IF NOT EXISTS votos (
    id SERIAL PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_voto SMALLINT NOT NULL, -- 1 para Like, 0 para Dislike
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unico_voto_por_usuario UNIQUE (usuario_id, publicacion_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicacion(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. TABLA DE COMENTARIOS
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicacion(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- 7. TABLA DE AUDITORÍA (Para el ADMIN)
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    detalles TEXT,
    direccion_ip VARCHAR(45),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

SELECT * FROM publicacion;
SELECT * FROM hashtags;
SELECT * FROM publicacion_hashtags;
SELECT * FROM votos;
SELECT * FROM comentarios;
SELECT * FROM auditoria;

DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) CHECK (rol IN ('ADMIN', 'USER')) DEFAULT 'USER',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar 3 usuarios de prueba para Hipstagram
INSERT INTO usuarios (nombre_usuario, correo, password_hash, rol) VALUES 
('puebras_admin', 'admin@hipstagram.com', '12300', 'ADMIN'),
('juan_el_pro', 'juan@correo.com', 'clave123', 'USER'),
('maria_fotos', 'maria@test.com', 'maria2026', 'USER');

-- Consultar para verificar que se guardaron
SELECT * FROM usuarios;