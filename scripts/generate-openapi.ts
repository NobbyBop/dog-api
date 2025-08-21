#!/usr/bin/env bun

import { writeFileSync } from "fs";
import { join } from "path";

// Import the app to get the OpenAPI spec
async function generateOpenAPISchema() {
  try {
    console.log("🔄 Starting OpenAPI schema generation...");

    // We'll start a temporary server to fetch the schema
    const { spawn } = await import("child_process");

    // Start the server in the background
    console.log("🚀 Starting temporary server...");
    const serverProcess = spawn("bun", ["run", "index.ts"], {
      stdio: "pipe",
      detached: false,
    });

    // Wait for server to start
    await new Promise((resolve) => {
      setTimeout(resolve, 3000); // Give it 3 seconds to start
    });

    try {
      // Fetch the OpenAPI schema
      console.log("📥 Fetching OpenAPI schema from server...");
      const response = await fetch("http://localhost:3000/openapi");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const schema = await response.json();

      // Write schema to file
      const outputPath = join(process.cwd(), "openapi.json");
      writeFileSync(outputPath, JSON.stringify(schema, null, 2));

      console.log("✅ OpenAPI schema generated successfully!");
      console.log(`📄 Schema saved to: ${outputPath}`);
      console.log(
        `📊 Total endpoints: ${Object.keys(schema.paths || {}).length}`
      );
      console.log(`🏷️  API version: ${schema.info?.version || "unknown"}`);
    } finally {
      // Always kill the server process
      console.log("🛑 Stopping temporary server...");
      serverProcess.kill("SIGTERM");

      // Give it a moment to cleanup
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }
  } catch (error) {
    console.error("❌ Error generating OpenAPI schema:", error);
    process.exit(1);
  }
}

// Alternative approach: Generate schema without running server
async function generateSchemaDirectly() {
  try {
    console.log("🔄 Generating OpenAPI schema directly...");

    // Import the OpenAPI spec from our app
    const { OpenAPIHono } = await import("@hono/zod-openapi");

    // Import our route modules to get their schemas
    const { dogsRoutes } = await import("../src/routes/dogs");
    const { broodsRoutes } = await import("../src/routes/broods");
    const { adoptionRoutes } = await import("../src/routes/adoption");
    const { healthRoutes } = await import("../src/routes/health");
    const { trainingRoutes } = await import("../src/routes/training");

    // Create a temporary app just for schema generation
    const tempApp = new OpenAPIHono();

    // Add all routes
    tempApp.route("/dogs", dogsRoutes);
    tempApp.route("/broods", broodsRoutes);
    tempApp.route("/adoption", adoptionRoutes);
    tempApp.route("/health", healthRoutes);
    tempApp.route("/training", trainingRoutes);

    // Generate the OpenAPI document
    const openAPIDocument = tempApp.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Dog API",
        description:
          "A comprehensive API for managing dogs, broods, adoption, health records, and training data",
      },
    });

    // Write schema to file
    const outputPath = join(process.cwd(), "openapi.json");
    writeFileSync(outputPath, JSON.stringify(openAPIDocument, null, 2));

    console.log("✅ OpenAPI schema generated successfully!");
    console.log(`📄 Schema saved to: ${outputPath}`);
    console.log(
      `📊 Total endpoints: ${Object.keys(openAPIDocument.paths || {}).length}`
    );
    console.log(
      `🏷️  API version: ${openAPIDocument.info?.version || "unknown"}`
    );
  } catch (error) {
    console.error("❌ Error generating OpenAPI schema directly:", error);
    console.log("🔄 Falling back to server-based generation...");
    await generateOpenAPISchema();
  }
}

// Run the generation
if (import.meta.main) {
  await generateSchemaDirectly();
}
