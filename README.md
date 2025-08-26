# 🐕 Dog API

A comprehensive REST API for managing dogs, broods, adoption, health records, and training data. Built with [Hono](https://hono.dev/) and full OpenAPI 3.0 support.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start production server
bun run start
```

The API will be available at:

- **API**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/swagger`
- **OpenAPI Schema**: `http://localhost:3000/openapi`

## 📋 API Endpoints

### Dogs (`/dogs`)

- `GET /dogs` - List all dogs with filtering and pagination
- `POST /dogs` - Create a new dog
- `GET /dogs/{id}` - Get dog by ID
- `PUT /dogs/{id}` - Update dog information
- `DELETE /dogs/{id}` - Delete a dog
- `GET /dogs/{id}/photos` - Get dog photos

### Broods (`/broods`)

- `GET /broods` - List all dog broods
- `GET /broods/{id}` - Get breed details
- `GET /broods/search` - Search broods by name
- `GET /broods/groups` - Get breed groups

### Adoption (`/adoption`)

- `GET /adoption/applications` - List adoption applications
- `POST /adoption/applications` - Submit adoption application
- `GET /adoption/applications/{id}` - Get application details
- `PUT /adoption/applications/{id}/status` - Update application status
- `GET /adoption/available` - Get available dogs
- `GET /adoption/stats` - Get adoption statistics

### Health (`/health`)

- `GET /health/records` - List health records
- `POST /health/records` - Create health record
- `GET /health/records/{id}` - Get health record
- `GET /health/dogs/{dogId}/vaccination-history` - Get vaccination history
- `GET /health/veterinarians` - Get veterinarians list

### Training (`/training`)

- `GET /training/records` - List training records
- `POST /training/records` - Create training record
- `GET /training/records/{id}` - Get training record
- `PUT /training/records/{id}` - Update training record
- `GET /training/dogs/{dogId}/progress` - Get training progress
- `GET /training/trainers` - Get trainers list

## 🔄 Automated OpenAPI Generation

This repository includes GitHub Actions workflows that automatically generate and update the OpenAPI schema on every push.

### Features:

- **Automatic Generation**: Schema updates on code changes
- **GitHub Releases**: Tagged releases with schema artifacts
- **PR Comments**: Schema info in pull request comments
- **Webhook Support**: External trigger via repository dispatch

### Manual Generation:

```bash
# Generate OpenAPI schema locally
bun run generate:openapi

# Generate for CI/CD (no server needed)
bun run scripts/generate-openapi-ci.ts
```

### Webhook Trigger:

```bash
# Trigger via GitHub API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{"event_type":"generate-openapi"}'
```

## 🛠️ Development

### Project Structure:

```
src/
├── routes/          # API route handlers
│   ├── dogs.ts
│   ├── broods.ts
│   ├── adoption.ts
│   ├── health.ts
│   └── training.ts
├── schemas/         # Zod validation schemas
│   └── index.ts
└── data/           # Mock data for development
    └── mockData.ts
scripts/            # Build and generation scripts
.github/workflows/  # GitHub Actions workflows
```

### Adding New Endpoints:

1. Define schemas in `src/schemas/index.ts`
2. Create route handlers in `src/routes/`
3. Import and mount routes in `index.ts`
4. The OpenAPI schema will be automatically generated!

## 📊 API Statistics

- **Total Endpoints**: 21
- **API Version**: 1.0.0
- **OpenAPI Version**: 3.0.0

## 🏷️ Use Cases

This API is perfect for:

- **Postman Collection Testing**: Comprehensive endpoints for agent testing
- **OpenAPI Workflow Development**: Automated schema generation examples
- **Pet Management Systems**: Real-world data models and operations
- **API Documentation**: Full Swagger UI integration

## 📄 License

MIT License - Feel free to use this for your projects!
