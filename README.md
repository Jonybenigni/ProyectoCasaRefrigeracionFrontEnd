# Casa de Refrigeración: frontend

Frontend del sistema para un local de refrigeración. Trabajo de EDI 3.
Hecho con Quasar, Vue 3, TypeScript, Pinia y Axios.

La API está en [ProyectoCasaRefrigeracion](https://github.com/Jonybenigni/ProyectoCasaRefrigeracion). **Hay que tenerla corriendo antes de entrar.**

## Qué hace falta

- **Node.js** 22.12 o más nuevo (o la versión 24)

## Cómo levantarlo

En la carpeta del proyecto:

```bash
npm install
```

```bash
npm run dev
```

Se abre solo en `http://localhost:9000`. La API acepta pedidos del puerto 9000 y del 9001.

## Usuario para entrar

- Email: `admin@refrigeracion.com`
- Contraseña: `Refri2026!`

## Qué tiene

Login con JWT y ABM de Proveedores, Clientes, Productos, Tareas, Trabajos pendientes, Pagos a proveedores y Productos por proveedor.
