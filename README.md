# Sistema Lonja – Lonja de Veracruz

Registro y gestión de las compras diarias de los compradores.

## Requerimientos que cubre
1. **Registro y almacenamiento de ventas**: catálogos (tipos, compradores, lotes, especies con imagen) y registro de compras con validación en servidor. El total se calcula en el servidor (kilos del lote × precio final por kilo). Un lote solo se puede comprar una vez.
2. **Control de acceso**: registro con confirmación por correo + autorización del administrador, sesión con JWT en cookie `httpOnly`, y roles (`admin` / `usuario`). Solo el admin elimina registros y gestiona usuarios.
3. **Reporte diario**: `/reportes/diario?fecha=AAAA-MM-DD` con detalle por compra, totales y resumen por comprador (imprimible).

## Puesta en marcha
```bash
# 1. Base de datos (una vez, como administrador de MariaDB)
mariadb < database/crear_bd.sql

# 2. Configuración
cp .env.example .env      # y edita los valores (SC_JWT, correo, etc.)

# 3. Dependencias y arranque
npm install
npm run server            # o: npm start
```
Abrir http://localhost:2800 e iniciar sesión con el administrador definido en `.env`.
Las tablas se crean solas al arrancar.

## Flujo de uso
1. Admin: crear **Tipos**, **Compradores** y **Lotes**; luego **Especies** (cada una pertenece a un lote).
2. **Compras → Registrar compra**: elegir lote disponible, comprador y precio final por kilo.
3. **Reporte diario** para ver lo comprado en el día.
4. Usuarios nuevos: se registran → confirman su correo → el admin los autoriza en **Usuarios**.

## Reglas de integridad
- Un lote comprado no puede editarse (cambiaría los kilos y el total ya no coincidiría con el reporte). Para corregirlo, el admin elimina la compra y la vuelve a registrar.
- No se puede eliminar un lote, tipo o comprador que tenga datos relacionados.
