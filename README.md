# Piloto Automático con GitHub: Automatizando el Ciclo de Vida del Software con IA, Skills y MCP

Guía integral y repositorio de referencia para el taller técnico presentado en la comunidad de Microsoft. Este material documenta la transición arquitectónica desde el autocompletado pasivo hasta agentes de desarrollo autónomos, contextualizados y seguros.

---

## 🎯 Resumen Ejecutivo

* **Duración:** 45 a 60 minutos.
* **Modalidad:** Charla práctica / Live Coding a 2 voces (*Arquitecto & Piloto*).
* **Objetivo:** Enseñar a desarrolladores y líderes técnicos cómo construir un entorno aumentado conectando agentes de terminal (`OpenCode`, `Claude Code`), herramientas nativas de bajo consumo de contexto (`gh CLI`), servidores de integración estandarizados (**Model Context Protocol - MCP**) y automatización en la nube (**GitHub Actions**).

---

## 👥 Dinámica de Ponentes

El taller implementa el patrón **Conductor y Piloto** para maximizar la fluidez y eliminar tiempos muertos de tipeo en pantalla:

* **Ponente 1 (Arquitecto / Narrador):** 
  * Explica la fundamentación teórica, cuellos de botella de contexto y compensaciones arquitectónicas (*trade-offs*).
  * Conecta con la audiencia y modera preguntas de gobernanza, seguridad y costos de tokens.
* **Ponente 2 (Piloto de Terminal):** 
  * Ejecuta los agentes en tiempo real desde la consola.
  * Muestra inspección de logs crudos, llamadas al protocolo MCP y validaciones locales.
  * Mantiene ramas y scripts de respaldo listos ante eventualidades de red.

---

## 🗺️ Mapa de la Progresión Técnica (Nivel 0 al Nivel 4)


```

[Nivel 0: Aislado]       Chatbot web sin contexto ni acceso a archivos
│
▼
[Nivel 1: Ojos Locales]   Agent CLI + gh CLI (inspección de código y git)
│
▼
[Nivel 2: Superpoderes]   Model Context Protocol (Azure MCP, Learn MCP, MarkItDown)
│
▼
[Nivel 3: Criterio]       Skills, Rules y Directivas de Equipo (.agent-rules)
│
▼
[Nivel 4: Producción]     GitHub Actions y CI Desatendido (Human-in-the-loop)

```

---

## 📚 Estructura Detallada por Niveles

### Nivel 0: El Agente Aislado (El límite del Chatbot)
* **Problema:** Copiar y pegar fragmentos en ventanas web pierde el contexto de arquitecturas completas, ramas activas e historial de Git.
* **Falla habitual:** Respuestas sintácticamente válidas pero desconectadas del contrato de API o de las dependencias reales del repositorio.

---

### Nivel 1: Ojos Locales (Agent CLI + `gh` CLI)
* **Principio:** Entregar herramientas de ejecución local al LLM para consultar el repositorio directamente.
* **Por qué `gh` CLI supera al MCP oficial de GitHub en tareas operativas:**
  * **Consumo de tokens:** El MCP de GitHub inyecta decenas de esquemas de OpenAPI en cada llamada del sistema, elevando la latencia y la factura de tokens.
  * **Eficiencia de shell:** `gh` CLI permite consultar metadatos con filtrado granular en origen.
* **Comandos esenciales optimizados para agentes:**
  ```bash
  # Consulta ligera de issues (solo campos necesarios)
  gh issue list --state open --json number,title,labels --limit 5

  # Inspección de PR sin saturar contexto con diffs masivos
  gh pr diff <PR_NUMBER> --name-only```

---
### Nivel 2: Superpoderes Estandarizados (Model Context Protocol - MCP)

* **Concepto:** MCP desacopla las herramientas del modelo. Un servidor expone herramientas estandarizadas sin necesidad de programar conectores propietarios.
* **MCPs de Microsoft seleccionados para el taller:**
* **Azure MCP Server (`@azure/mcp`):** Permite al agente consultar el estado de despliegues y entornos de staging en Azure Resource Graph.
* **Microsoft Learn MCP:** Inyección de documentación canónica y patrones de arquitectura actualizados en tiempo real.
* **MarkItDown (`microsoft/markitdown`):** Conversión de requerimientos en DOCX, PDF o PPTX a Markdown limpio consumible por el modelo.



#### Configuración de Servidores MCP (`mcp_config.json`)

```json
{
  "mcpServers": {
    "azure": {
      "command": "npx",
      "args": ["-y", "@azure/mcp-server"]
    },
    "markitdown": {
      "command": "python",
      "args": ["-m", "markitdown.mcp"]
    },
    "microsoft-learn": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-microsoft-learn"]
    }
  }
}

```

---

### Nivel 3: Criterio Propio (Skills y Reglas de Equipo)

* **Definición:** Las herramientas determinan qué *puede* hacer el agente; las **Skills y Rules** definen *cómo debe comportarse* según las políticas del equipo.
* **Implementación práctica:** Archivo `.agent-rules` o directiva de proyecto (`CLAUDE.md` / `.cursorrules`).

#### Plantilla de Reglas de Equipo (`.agent-rules`)

# Convenciones de Desarrollo y Automatización

## Uso de GitHub CLI (Eficiencia de Contexto)
- NUNCA ejecutes `gh pr diff` completo; usa `--name-only` primero para evaluar el alcance.
- En `gh issue list`, SIEMPRE restringe con `--json number,title,labels` y `--limit 5`.

## Ciclo de Ramas y Commits
- Nombres de ramas obligatorios: `feat/<issue-id>-descripcion` o `fix/<issue-id>-descripcion`.
- Commits bajo especificación Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`.

## Gobernanza y Seguridad
- NUNCA hagas push directo a `main` o `master`.
- Todo cambio requiere un PR vinculado con `gh pr create --fill --issue <ID>`.
- Revisa dependencias críticas antes de sugerir comandos de instalación global.

---

### Nivel 4: Llevarlo a Producción (GitHub Actions y CI Desatendido)

* **Objetivo:** Extender la asistencia de la terminal local a la infraestructura compartida del equipo.
* **Patrón de diseño:** **Human-in-the-loop**. El agente audita, etiqueta, sugiere diffs y valida lineamientos, pero la decisión de merge recae siempre en un revisor humano.

#### Pipeline de Auditoría de PRs (`.github/workflows/agent-pr-audit.yml`)

```yaml
name: Agent PR Review & Governance

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Instalación de GitHub CLI
        run: type -p gh >/dev/null || sudo apt install -y gh

      - name: Auditoría Asistida de Convenciones
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          echo "Inspeccionando metadatos del PR #${PR_NUMBER}..."
          
          # Extracción del listado de archivos modificados
          CHANGED_FILES=$(gh pr diff "$PR_NUMBER" --name-only)
          echo "Archivos en este cambio:"
          echo "$CHANGED_FILES"
          
          # Validación de presencia de tests si se modificó lógica de negocio
          if echo "$CHANGED_FILES" \vert{} grep -q "src/" && ! echo "$CHANGED_FILES" | grep -q "tests/"; then
            gh pr comment "$PR_NUMBER" --body "⚠️ **Alerta del Asistente:** Este Pull Request modifica archivos en \`src/\` pero no incluye pruebas asociadas en \`tests/\`. Por favor, valida la cobertura antes de solicitar aprobación."
          fi
```
---

## 🛠️ Matriz Comparativa: `gh CLI` vs. MCP Directo de GitHub

| Dimensión | `gh` CLI en Terminal | MCP Server de GitHub |
| --- | --- | --- |
| **Consumo de Tokens** | 🟢 **Mínimo:** Solo el output del comando filtrado entra al prompt. | 🔴 **Elevado:** Inyecta esquemas de API completos en cada turno. |
| **Latencia** | 🟢 Ejecución binaria nativa local (< 200 ms). | 🟡 Múltiples saltos RPC y procesamiento de payloads JSON masivos. |
| **Gobernanza / Permisos** | 🟢 Usa la sesión activa de `gh auth status` local. | 🟡 Requiere gestión de PAT o tokens con alcance amplio. |
| **Caso de Uso Ideal** | Operaciones CRUD del repositorio (issues, PRs, diffs, checks). | Consultas semánticas complejas entre múltiples fuentes externas. |

---

## 🧰 Requisitos Previos para el Taller

1. **Herramientas de línea de comandos:**
* Git instalado y configurado: `git --version`
* GitHub CLI autenticado: `gh auth login`
* Node.js v18+ o Python 3.10+ para la ejecución de servidores MCP vía `npx` / `uvx`.


2. **Agente de terminal:**
* `opencode` o `claude-code` instalado y vinculado al proveedor de inferencia correspondiente.


3. **Suscripción y permisos:**
   * Acceso de lectura/escritura a un repositorio de prueba para la ejecución en vivo.
   * Cuenta activa de Azure (opcional, para la demo del servidor Azure MCP).



---

## 🧩 Demo en Vivo: `GitHub Profile Card` (`labs/gh-profile-card`)

Aplicación web mínima (**Express + HTML/CSS/JS puro**) que actúa como banco de pruebas para el **Nivel 1**. Incluye únicamente la capa web: el formulario y la card resultante. La obtención de datos con `gh` CLI y el llenado automático con Playwright se construyen en vivo durante el taller.

### Puesta en marcha

```bash
cd labs/gh-profile-card
npm install
npm start        # http://localhost:3000
```

| Script            | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm start`       | Levanta el servidor (Express).           |
| `npm run dev`     | Servidor con recarga (`node --watch`).   |

### Estructura

```
labs/gh-profile-card/
├── server.js              Servidor Express (solo archivos estáticos)
├── public/
│   ├── index.html         Formulario y card
│   ├── styles.css         Estilos
│   └── app.js             Lectura del formulario, validación y render de la card
└── package.json
```

### Campos del formulario

Cada campo tiene un `id` estable y coincide 1:1 con un campo de la API de GitHub, para que el mapeo desde `gh` sea directo:

| Campo          | `id`          | Tipo                  | Origen en la API                          |
| -------------- | ------------- | --------------------- | ----------------------------------------- |
| Usuario        | `login`       | texto (obligatorio)   | `user.login`                              |
| Nombre         | `name`        | texto                 | `user.name`                               |
| URL del avatar | `avatarUrl`   | url                   | `user.avatar_url`                         |
| Biografía      | `bio`         | texto multilínea      | `user.bio`                                |
| Empresa        | `company`     | texto                 | `user.company`                            |
| Ubicación      | `location`    | texto                 | `user.location`                           |
| Sitio web      | `blog`        | texto                 | `user.blog`                               |
| Twitter / X    | `twitter`     | texto                 | `user.twitter_username`                   |
| Lenguajes      | `languages`   | texto (con comas)     | agregado desde `users/{login}/repos`      |
| Seguidores     | `followers`   | número                | `user.followers`                          |
| Siguiendo      | `following`   | número                | `user.following`                          |
| Repos públicos | `publicRepos` | número                | `user.public_repos`                       |
| Hireable       | `hireable`    | checkbox              | `user.hireable`                           |

Al enviar el formulario, la card se renderiza en el panel derecho con avatar (o iniciales de fallback), biografía, *chips* de contexto, lenguajes y métricas. El botón **Limpiar** oculta la card y restablece los valores por defecto.

### Puntos de extensión (lo que se arma en el taller)

1. **Extracción con `gh` CLI** — filtrar en origen para no gastar tokens:
   ```bash
   gh api user --jq '{login,name,bio,company,location,blog,avatar_url,twitter_username,followers,following,public_repos,hireable}'

   gh api "users/$LOGIN/repos?per_page=100" \
     --jq '[.[].language | select(. != null)] | group_by(.) | map({l: .[0], n: length}) | sort_by(-.n) | .[0:3]'
   ```
2. **Endpoint en el servidor** — `GET /api/profile?login=<usuario>` ejecutando `gh` con `child_process.execFile` y un arreglo de argumentos (evita por completo los errores de *quoting* de PowerShell con `--jq`).
3. **Automatización con Playwright** — un script que recorra los `id` del formulario, envíe el `submit` y verifique que la card quedó renderizada (`#profile-card[data-state="ready"]`), y cierre con un screenshot como evidencia.

> **Trampa común:** si la clase de estilos del componente define `display` (por ejemplo `display: grid`), anula el atributo `hidden` del navegador. Agrega `[hidden] { display: none !important; }` a la hoja de estilos.


---

## 🔐 Buenas Prácticas de Seguridad y Gobernanza

1. **Principio de menor privilegio:** En GitHub Actions, configura siempre `permissions: contents: read` por defecto y otorga solo `pull-requests: write` cuando sea estrictamente necesario.
2. **Confirmación obligatoria (Human-in-the-loop):** Configura los agentes de terminal para requerir aprobación manual antes de ejecutar comandos destructivos (`git push --force`, `rm -rf`, `gh repo delete`).
3. **Aislamiento de secretos:** Jamás expongas variables de entorno con tokens en el historial del agente. Utiliza GitHub Secrets y variables de entorno del sistema operativo.
