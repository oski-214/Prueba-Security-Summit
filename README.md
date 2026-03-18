# Security Summit — Tu perfil en seguridad

Aplicación web interactiva para el stand de **Microsoft Security Summit**. A través de 3 escenarios de seguridad, asigna un perfil al participante (Defender, Sentinel, Entra, Purview o Security Copilot) y genera una imagen descargable con un código QR.

## Requisitos

- [Node.js](https://nodejs.org/) 18+

## Instalación

```bash
npm install
```

## Ejecución en local

```bash
npm run dev
```

Abre http://localhost:5173 en el navegador.

### Acceso desde el móvil (red local)

Para que los códigos QR funcionen al escanearlos con el móvil, ejecuta el servidor expuesto a la red:

```bash
npx vite --host
```

Verás algo como:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.43:5173/
```

Abre la URL de **Network** en tu PC. Los QR generados usarán esa IP y serán accesibles desde cualquier dispositivo en la misma Wi-Fi.

## Despliegue en GitHub Pages (Acceso Público)

Para que el QR funcione desde **cualquier lugar** (sin necesidad de estar en la misma red WiFi), despliega la app en GitHub Pages:

### Opción 1: Despliegue automático (recomendado)

1. Sube el código a un repositorio en GitHub llamado `SecuritySummit` (o cambia el nombre en `vite.config.mts`)
2. Ve a **Settings > Pages** en tu repositorio
3. En "Build and deployment" selecciona **GitHub Actions**
4. Haz push a la rama `main` — el workflow desplegará automáticamente

Tu app estará disponible en: `https://tu-usuario.github.io/SecuritySummit/`

### Opción 2: Despliegue manual

```bash
npm run build
```

Sube el contenido de `dist/` a GitHub Pages o cualquier hosting estático.

> **Nota:** Asegúrate de que el nombre del repositorio coincida con el valor de `base` en `vite.config.mts`. Si tu repositorio se llama diferente, actualiza el valor.

## Estructura

```
src/
├── App.tsx                  # Flujo principal del quiz
├── DownloadView.tsx         # Vista de descarga (abierta al escanear QR)
├── generateProfileImage.ts  # Generación de imagen PNG con Canvas
├── state.ts                 # Estado y lógica de puntuación
├── styles.css               # Estilos Microsoft Fluent
├── components/Avatar.tsx    # Avatar SVG del perfil
└── data/
    ├── profiles.ts          # Definición de perfiles de seguridad
    └── scenarios.ts         # Escenarios y opciones
```
