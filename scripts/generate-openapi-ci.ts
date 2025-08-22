#!/usr/bin/env bun

import { writeFileSync } from "fs";
import { join } from "path";

async function generateOpenAPIForCI() {
  console.log("🔄 Generating OpenAPI schema for CI/CD...");

  try {
    // Import our app components
    const { OpenAPIHono } = await import("@hono/zod-openapi");

    // Create a new app instance for schema generation
    const app = new OpenAPIHono();

    // Add root endpoint (from index.ts)
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

    // Import and mount route modules
    const { dogsRoutes } = await import("../src/routes/dogs");
    const { breedsRoutes } = await import("../src/routes/breeds");
    const { adoptionRoutes } = await import("../src/routes/adoption");
    const { healthRoutes } = await import("../src/routes/health");
    const { trainingRoutes } = await import("../src/routes/training");

    app.route("/dogs", dogsRoutes);
    app.route("/breeds", breedsRoutes);
    app.route("/adoption", adoptionRoutes);
    app.route("/health", healthRoutes);
    app.route("/training", trainingRoutes);

    // Generate the OpenAPI document
    const openAPIDocument = app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Dog API",
        description:
          "A comprehensive API for managing dogs, breeds, adoption, health records, and training data",
      },
    });

    // Add timestamp to the schema
    const schemaWithMetadata = {
      ...openAPIDocument,
      "x-generated-at": new Date().toISOString(),
      "x-generated-by": "dog-api-ci",
    };

    // Write schema to file
    const outputPath = join(process.cwd(), "openapi.json");
    writeFileSync(outputPath, JSON.stringify(schemaWithMetadata, null, 2));

    console.log("✅ OpenAPI schema generated successfully!");
    console.log(`📄 Schema saved to: ${outputPath}`);

    const pathCount = Object.keys(openAPIDocument.paths || {}).length;
    console.log(`📊 Total endpoints: ${pathCount}`);
    console.log(
      `🏷️  API version: ${openAPIDocument.info?.version || "unknown"}`
    );
    console.log(`⏰ Generated at: ${schemaWithMetadata["x-generated-at"]}`);

    // Output GitHub Actions compatible format
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=endpoint-count::${pathCount}`);
      console.log(
        `::set-output name=api-version::${
          openAPIDocument.info?.version || "unknown"
        }`
      );
      console.log(
        `::set-output name=generated-at::${schemaWithMetadata["x-generated-at"]}`
      );
    }

    return {
      success: true,
      endpointCount: pathCount,
      version: openAPIDocument.info?.version,
      generatedAt: schemaWithMetadata["x-generated-at"],
    };
  } catch (error) {
    console.error("❌ Error generating OpenAPI schema:", error);
    process.exit(1);
  }
}

// Run the generation
if (import.meta.main) {
  await generateOpenAPIForCI();
}
