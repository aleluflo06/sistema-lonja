-- Ejecutar UNA vez como administrador de MariaDB.
-- Las tablas las crea Sequelize automaticamente al iniciar la aplicacion.
CREATE DATABASE IF NOT EXISTS lonja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usuario dedicado (en Linux 'root' usa autenticacion por socket y Node no puede entrar con clave)
CREATE USER IF NOT EXISTS 'lonja_user'@'localhost' IDENTIFIED BY 'Lonja_2026!';
CREATE USER IF NOT EXISTS 'lonja_user'@'127.0.0.1' IDENTIFIED BY 'Lonja_2026!';
GRANT ALL PRIVILEGES ON lonja.* TO 'lonja_user'@'localhost';
GRANT ALL PRIVILEGES ON lonja.* TO 'lonja_user'@'127.0.0.1';
FLUSH PRIVILEGES;
