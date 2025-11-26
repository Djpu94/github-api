# GitHub Metrics Service

Microservicio en NestJS con arquitectura hexagonal para calcular métricas de perfiles de GitHub.

## Características

- **Arquitectura hexagonal** (puertos y adaptadores)
- **Cache en memoria** con TTL de 5 minutos
- **Manejo de errores** (404, 429, 503)
- **Validación y sanitización** de entradas
- **Logging** de operaciones
- **Pruebas unitarias y E2E**
- **Variables de entorno** configurables
- **Documentación con Swagger** (bonus)

## Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de GitHub (opcional, para token de API)

## Instalación y Setup

### 1. Clonar y instalar dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd github-metrics-service

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env
```

### 3. Configuración de variables de entorno

```env
# .env
PORT=3000
NODE_ENV=development

# GitHub API Configuration
GITHUB_TOKEN=ghp_your_github_token_here
USER_AGENT=GitHub-Metrics-Service

# Cache Configuration
CACHE_TTL=300
```

### Obtención de GitHub Token (Opcional pero recomendado)

1. Ve a [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Haz clic en "Generate new token" → "Generate new token (classic)"
3. Asigna un nombre (ej: "GitHub Metrics Service")
4. **No es necesario seleccionar scopes** - la API pública funciona sin permisos
5. Si quieres rate limits más altos, selecciona scopes públicos solamente
6. Copia el token y agrégalo a tu `.env`

**Sin token**: 60 requests por hora  
**Con token**: 5000 requests por hora

## Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

### Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Todos los tests
npm run test:all
```

## Endpoints API

### Health Check
Verifica el estado del servicio.

```bash
curl -X GET "http://localhost:3000/api/health"
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "github-metrics-service"
}
```

### Obtener Perfil
Obtiene información básica del perfil de GitHub.

```bash
curl -X GET "http://localhost:3000/api/profile/octocat"
```

**Respuesta:**
```json
{
  "username": "octocat",
  "name": "The Octocat",
  "avatar": "https://avatars.githubusercontent.com/u/583231?v=4",
  "bio": "This is my bio",
  "publicRepos": 8,
  "followers": 3939,
  "profileUrl": "https://github.com/octocat"
}
```

### Obtener Métricas
Calcula y retorna las métricas del perfil.

```bash
curl -X GET "http://localhost:3000/api/metrics/octocat"
```

**Respuesta:**
```json
{
  "username": "octocat",
  "metrics": {
    "totalStars": 1340,
    "followersToReposRatio": 492.38,
    "lastPushDaysAgo": 15
  }
}
```

## Ejemplos Curl Completos

### Ejemplo 1: Perfil básico
```bash
curl -X GET "http://localhost:3000/api/profile/torvalds" \
  -H "Content-Type: application/json"
```

### Ejemplo 2: Métricas con formato bonito
```bash
curl -X GET "http://localhost:3000/api/metrics/torvalds" \
  -H "Content-Type: application/json" | jq
```

### Ejemplo 3: Usuario inexistente
```bash
curl -X GET "http://localhost:3000/api/profile/usuario-inexistente-12345" \
  -H "Content-Type: application/json"
```

**Respuesta de error:**
```json
{
  "statusCode": 404,
  "message": "GitHub user not found",
  "error": "Not Found"
}
```

### Ejemplo 4: Rate limit excedido
```bash
curl -X GET "http://localhost:3000/api/metrics/octocat" \
  -H "Content-Type: application/json"
```

**Respuesta de error:**
```json
{
  "statusCode": 429,
  "message": "GitHub API rate limit exceeded",
  "error": "Too Many Requests"
}
```

## Testing

### Ejecutar todos los tests
```bash
npm run test
```

### Ejecutar tests con cobertura
```bash
npm run test:cov
```

### Ejecutar tests E2E
```bash
npm run test:e2e
```

### Ejemplo de test manual
```bash
# Health check
curl http://localhost:3000/api/health

# Perfil existente
curl http://localhost:3000/api/profile/octocat

# Métricas
curl http://localhost:3000/api/metrics/torvalds

# Usuario inválido
curl http://localhost:3000/api/profile/invalid-user-@#$
```

## Docker (Bonus)

### Construir la imagen
```bash
docker-compose build
```

### Ejecutar en segundo plano
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

## Swagger Documentation (Bonus)

Una vez ejecutado el servicio, accede a la documentación interactiva:

```
http://localhost:3000/api/docs
```

## Manejo de Errores

| Código | Descripción |
|--------|-------------|
| `200` | Success |
| `400` | Invalid username format |
| `404` | GitHub user not found |
| `429` | GitHub API rate limit exceeded |
| `503` | GitHub API service unavailable |
| `500` | Internal server error |

## Cache

El servicio incluye cache en memoria con:
- **TTL**: 5 minutos (configurable)
- **Estrategia**: Time-based expiration
- **Limpieza automática** de entradas expiradas

## Métricas Calculadas

1. **Total Stars**: Suma de estrellas en todos los repositorios públicos
2. **Followers/Repos Ratio**: Relación entre seguidores y repositorios (2 decimales)
3. **Last Push Days Ago**: Días desde la última actividad en cualquier repositorio

---
