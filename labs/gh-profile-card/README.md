# GitHub Profile Card (web)

Formulario de perfil de GitHub que, al enviarse, genera una card con esa informacion.

Incluye unicamente la parte web: `public/` (HTML + CSS + JS), servida con Express.
La obtencion de datos con `gh` CLI y el llenado automatico con Playwright se
construyen durante el taller.

## Puesta en marcha

```bash
npm install
npm start          # http://localhost:3000
```

Otros comandos:

```bash
npm run dev        # servidor con recarga (node --watch)
PORT=4000 npm start
```

## Estructura

```
server.js              Servidor Express (solo archivos estaticos)
public/index.html      Formulario y card
public/styles.css      Estilos
public/app.js          Lectura del formulario, validacion y render de la card
```

## Campos del formulario

| Campo            | id            | Tipo      |
| ---------------- | ------------- | --------- |
| Usuario          | `login`       | texto (obligatorio) |
| Nombre           | `name`        | texto |
| URL del avatar   | `avatarUrl`   | url |
| Biografia        | `bio`         | texto multilinea |
| Empresa          | `company`     | texto |
| Ubicacion        | `location`    | texto |
| Sitio web        | `blog`        | texto |
| Twitter / X      | `twitter`     | texto |
| Lenguajes        | `languages`   | texto (separados por coma) |
| Seguidores       | `followers`   | numero |
| Siguiendo        | `following`   | numero |
| Repos publicos   | `publicRepos` | numero |
| Hireable         | `hireable`    | checkbox |

Al enviar el formulario la card aparece en el panel derecho con avatar, bio,
chips de contexto, lenguajes y metricas. El boton **Limpiar** la oculta.