## Configuración de entorno

Verifique primero su archivo de variable de entorno dentro de la carpeta del backend
(Sea que use o no vaya a usar un contenedor).

## Usando docker

### Prerequisitos

- Docker y Docker compose instalados en su sistema.
- Si desea, puede decargar la imagen desde [docker hub](https://hub.docker.com/layers/slmnnrr/backend-go-app/final/images/sha256-2b45717e5294c93a5f69ed36d9d9272c8f5e8bdc13675f59e564c1bd07d0626c)   

### Pasos para la creación del contenedor.
1. Construya su contenedor:
   ```bash
   docker compose build
   ```

2. Inicie la aplicación:
   ```bash
   docker compose up
   ```

### Frontend Dependencies
Install the necessary frontend dependencies:

```bash
npm install
npm install vite
npm install axios
```

### Corriendo la aplicación
En el caso que quiera usar la aplicación sin el contenedor del back, le recomendamos entonces cambiar el string de conexión a la base de datos o usar bien el .env en el back.
Por otro lado, siga los procedimientos de ejecución que se hacen normalmente.
