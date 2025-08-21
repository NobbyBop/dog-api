import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { Broodschema, ErrorSchema } from "../schemas";
import { mockBroods, findById } from "../data/mockData";

export const broodsRoutes = new OpenAPIHono();

// GET /broods - List all broods
const listBroodsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ['Broods'],
  summary: "List all dog broods",
  description:
    "Retrieve a list of all available dog broods with their characteristics",
  request: {
    query: z.object({
      group: z
        .enum([
          "sporting",
          "hound",
          "working",
          "terrier",
          "toy",
          "non-sporting",
          "herding",
          "mixed",
        ])
        .optional(),
      size: z.enum(["small", "medium", "large", "extra-large"]).optional(),
      exerciseNeeds: z
        .enum(["low", "moderate", "high", "very-high"])
        .optional(),
      goodWithKids: z.coerce.boolean().optional(),
      goodWithPets: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(Broodschema),
        },
      },
      description: "List of dog broods",
    },
  },
});

broodsRoutes.openapi(listBroodsRoute, (c) => {
  const query = c.req.valid("query");
  let filteredBroods = mockBroods;

  if (query.group) {
    filteredBroods = filteredBroods.filter(
      (breed) => breed.group === query.group
    );
  }
  if (query.size) {
    filteredBroods = filteredBroods.filter(
      (breed) => breed.size === query.size
    );
  }
  if (query.exerciseNeeds) {
    filteredBroods = filteredBroods.filter(
      (breed) => breed.exerciseNeeds === query.exerciseNeeds
    );
  }
  if (query.goodWithKids !== undefined) {
    filteredBroods = filteredBroods.filter(
      (breed) => breed.goodWithKids === query.goodWithKids
    );
  }
  if (query.goodWithPets !== undefined) {
    filteredBroods = filteredBroods.filter(
      (breed) => breed.goodWithPets === query.goodWithPets
    );
  }

  return c.json(filteredBroods);
});

// GET /broods/:id - Get specific breed
const getBreedRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ['Broods'],
  summary: "Get breed by ID",
  description: "Retrieve detailed information about a specific dog breed",
  request: {
    params: z.object({
      id: z.string().uuid("Invalid breed ID format"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: Broodschema,
        },
      },
      description: "Breed details",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Breed not found",
    },
  },
});

broodsRoutes.openapi(getBreedRoute, (c) => {
  const { id } = c.req.valid("param");
  const breed = findById(mockBroods, id);

  if (!breed) {
    return c.json(
      {
        error: "NOT_FOUND",
        message: `Breed with ID ${id} not found`,
      },
      404
    );
  }

  return c.json(breed);
});

// GET /broods/search - Search broods by name
const searchBroodsRoute = createRoute({
  method: "get",
  path: "/search",
  tags: ['Broods'],
  summary: "Search broods by name",
  description: "Search for dog broods by name or partial name match",
  request: {
    query: z.object({
      q: z.string().min(1).max(100),
      limit: z.coerce.number().int().positive().max(50).default(10),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(Broodschema),
        },
      },
      description: "Matching broods",
    },
  },
});

broodsRoutes.openapi(searchBroodsRoute, (c) => {
  const { q, limit } = c.req.valid("query");

  const matchingBroods = mockBroods
    .filter((breed) => breed.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit);

  return c.json(matchingBroods);
});

// GET /broods/groups - Get all breed groups
const getBreedGroupsRoute = createRoute({
  method: "get",
  path: "/groups",
  tags: ['Broods'],
  summary: "Get all breed groups",
  description: "Retrieve a list of all available dog breed groups",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            groups: z.array(
              z.object({
                name: z.string(),
                description: z.string(),
                count: z.number().int().nonnegative(),
              })
            ),
          }),
        },
      },
      description: "List of breed groups with counts",
    },
  },
});

broodsRoutes.openapi(getBreedGroupsRoute, (c) => {
  const groupCounts = mockBroods.reduce((acc, breed) => {
    acc[breed.group] = (acc[breed.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const groupDescriptions = {
    sporting: "Dogs bred for hunting and retrieving game",
    hound: "Dogs bred for hunting by scent or sight",
    working:
      "Dogs bred for specific jobs like guarding, pulling sleds, or water rescue",
    terrier: "Dogs bred to hunt and kill vermin",
    toy: "Small companion dogs bred primarily for companionship",
    "non-sporting":
      "Diverse group of dogs that don't fit into other categories",
    herding: "Dogs bred to control the movement of livestock",
    mixed: "Dogs with mixed breed heritage",
  };

  const groups = Object.entries(groupCounts).map(([name, count]) => ({
    name,
    description:
      groupDescriptions[name as keyof typeof groupDescriptions] ||
      "Mixed breed dogs",
    count,
  }));

  return c.json({ groups });
});
