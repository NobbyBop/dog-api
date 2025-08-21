import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { DogSchema, CreateDogSchema, UpdateDogSchema, DogQuerySchema, ErrorSchema, PaginatedResponseSchema } from '../schemas'
import { mockDogs, findById, generateId, generateTimestamps } from '../data/mockData'

export const dogsRoutes = new OpenAPIHono()

// In-memory storage (for demo purposes)
let dogs = [...mockDogs]

// GET /dogs - List all dogs with filtering and pagination
const listDogsRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'List all dogs',
  description: 'Retrieve a paginated list of dogs with optional filtering',
  request: {
    query: DogQuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PaginatedResponseSchema(DogSchema)
        }
      },
      description: 'List of dogs with pagination'
    }
  }
})

dogsRoutes.openapi(listDogsRoute, (c) => {
  const query = c.req.valid('query')
  let filteredDogs = dogs

  // Apply filters
  if (query.breed) {
    filteredDogs = filteredDogs.filter(dog => 
      dog.breed.toLowerCase().includes(query.breed!.toLowerCase())
    )
  }
  if (query.age_min !== undefined) {
    filteredDogs = filteredDogs.filter(dog => dog.age >= query.age_min!)
  }
  if (query.age_max !== undefined) {
    filteredDogs = filteredDogs.filter(dog => dog.age <= query.age_max!)
  }
  if (query.weight_min !== undefined) {
    filteredDogs = filteredDogs.filter(dog => dog.weight >= query.weight_min!)
  }
  if (query.weight_max !== undefined) {
    filteredDogs = filteredDogs.filter(dog => dog.weight <= query.weight_max!)
  }
  if (query.gender) {
    filteredDogs = filteredDogs.filter(dog => dog.gender === query.gender)
  }
  if (query.size) {
    filteredDogs = filteredDogs.filter(dog => dog.size === query.size)
  }
  if (query.isNeutered !== undefined) {
    filteredDogs = filteredDogs.filter(dog => dog.isNeutered === query.isNeutered)
  }

  // Pagination
  const page = query.page
  const limit = query.limit
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedDogs = filteredDogs.slice(startIndex, endIndex)

  return c.json({
    data: paginatedDogs,
    pagination: {
      page,
      limit,
      total: filteredDogs.length,
      totalPages: Math.ceil(filteredDogs.length / limit)
    }
  })
})

// GET /dogs/:id - Get a specific dog
const getDogRoute = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get dog by ID',
  description: 'Retrieve a specific dog by its ID',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid dog ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DogSchema
        }
      },
      description: 'Dog details'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Dog not found'
    }
  }
})

dogsRoutes.openapi(getDogRoute, (c) => {
  const { id } = c.req.valid('param')
  const dog = findById(dogs, id)
  
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${id} not found`
    }, 404)
  }
  
  return c.json(dog)
})

// POST /dogs - Create a new dog
const createDogRoute = createRoute({
  method: 'post',
  path: '/',
  summary: 'Create a new dog',
  description: 'Add a new dog to the database',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateDogSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: DogSchema
        }
      },
      description: 'Dog created successfully'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid input data'
    }
  }
})

dogsRoutes.openapi(createDogRoute, (c) => {
  const dogData = c.req.valid('json')
  const timestamps = generateTimestamps()
  
  const newDog: typeof dogs[0] = {
    id: generateId(),
    ...dogData,
    ...timestamps
  }
  
  dogs.push(newDog)
  
  return c.json(newDog, 201)
})

// PUT /dogs/:id - Update a dog
const updateDogRoute = createRoute({
  method: 'put',
  path: '/{id}',
  summary: 'Update dog',
  description: 'Update an existing dog\'s information',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid dog ID format')
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateDogSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DogSchema
        }
      },
      description: 'Dog updated successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Dog not found'
    }
  }
})

dogsRoutes.openapi(updateDogRoute, (c) => {
  const { id } = c.req.valid('param')
  const updateData = c.req.valid('json')
  
  const dogIndex = dogs.findIndex(dog => dog.id === id)
  if (dogIndex === -1) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${id} not found`
    }, 404)
  }
  
  const updatedDog = {
    ...dogs[dogIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  
  dogs[dogIndex] = updatedDog
  
  return c.json(updatedDog)
})

// DELETE /dogs/:id - Delete a dog
const deleteDogRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: 'Delete dog',
  description: 'Remove a dog from the database',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid dog ID format')
    })
  },
  responses: {
    204: {
      description: 'Dog deleted successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Dog not found'
    }
  }
})

dogsRoutes.openapi(deleteDogRoute, (c) => {
  const { id } = c.req.valid('param')
  
  const dogIndex = dogs.findIndex(dog => dog.id === id)
  if (dogIndex === -1) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${id} not found`
    }, 404)
  }
  
  dogs.splice(dogIndex, 1)
  
  return c.body(null, 204)
})

// GET /dogs/:id/photos - Get dog photos
const getDogPhotosRoute = createRoute({
  method: 'get',
  path: '/{id}/photos',
  summary: 'Get dog photos',
  description: 'Get all photos for a specific dog',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid dog ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            dogId: z.string().uuid(),
            photos: z.array(z.string().url())
          })
        }
      },
      description: 'Dog photos'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Dog not found'
    }
  }
})

dogsRoutes.openapi(getDogPhotosRoute, (c) => {
  const { id } = c.req.valid('param')
  const dog = findById(dogs, id)
  
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${id} not found`
    }, 404)
  }
  
  return c.json({
    dogId: id,
    photos: dog.photos
  })
})