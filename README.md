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

## Despliegue en GitHub Pages

```bash
npm run build
```

Sube el contenido de `dist/` a GitHub Pages. Los QR apuntarán automáticamente a la URL de producción.

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
