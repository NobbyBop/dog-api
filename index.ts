import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";

// Import route modules
import { dogsRoutes } from "./src/routes/dogs";
import { breedsRoutes } from "./src/routes/breeds";
import { adoptionRoutes } from "./src/routes/adoption";
import { healthRoutes } from "./src/routes/health";
import { trainingRoutes } from "./src/routes/training";

const app = new OpenAPIHono();

// Middleware
app.use("*", cors());

// Root endpoint
app.openapi(
  {
    method: "get",
    path: "/",
    summary: "Welcome to Dog API",
    responses: {
      200: {
        description: "Welcome message",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                version: { type: "string" },
                docs: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  (c) => {
    return c.json({
      message: "Welcome to the Dog API! 🐕",
      version: "1.0.0",
      docs: "/swagger",
    });
  }
);

// Route groups
app.route("/dogs", dogsRoutes);
app.route("/breeds", breedsRoutes);
app.route("/adoption", adoptionRoutes);
app.route("/health", healthRoutes);
app.route("/training", trainingRoutes);

// OpenAPI spec endpoint
app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Dog API",
    description:
      "A comprehensive API for managing dogs, breeds, adoption, health records, and training data",
  },
});

// Swagger UI
app.get("/swagger", swaggerUI({ url: "/openapi" }));

const port = process.env.PORT || 3000;
console.log(`🐕 Dog API running on http://localhost:${port}`);
console.log(`📖 Swagger docs at http://localhost:${port}/swagger`);
console.log(`📄 OpenAPI spec at http://localhost:${port}/openapi`);

export default {
  port,
  fetch: app.fetch,
};
