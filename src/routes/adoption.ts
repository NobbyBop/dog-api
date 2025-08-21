import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { AdoptionApplicationSchema, CreateAdoptionApplicationSchema, ErrorSchema, DogSchema } from '../schemas'
import { mockAdoptionApplications, mockDogs, findById, generateId, generateTimestamps } from '../data/mockData'

export const adoptionRoutes = new OpenAPIHono()

// In-memory storage for adoption applications
let adoptionApplications = [...mockAdoptionApplications]

// GET /adoption/applications - List all adoption applications
const listAdoptionApplicationsRoute = createRoute({
  method: 'get',
  path: '/applications',
  tags: ['Adoption'],
  summary: 'List adoption applications',
  description: 'Retrieve all adoption applications with optional status filtering',
  request: {
    query: z.object({
      status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']).optional(),
      dogId: z.string().uuid().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10)
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(AdoptionApplicationSchema),
            pagination: z.object({
              page: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
              totalPages: z.number().int()
            })
          })
        }
      },
      description: 'List of adoption applications'
    }
  }
})

adoptionRoutes.openapi(listAdoptionApplicationsRoute, (c) => {
  const query = c.req.valid('query')
  let filteredApplications = adoptionApplications

  if (query.status) {
    filteredApplications = filteredApplications.filter(app => app.status === query.status)
  }
  if (query.dogId) {
    filteredApplications = filteredApplications.filter(app => app.dogId === query.dogId)
  }

  // Pagination
  const page = query.page
  const limit = query.limit
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

  return c.json({
    data: paginatedApplications,
    pagination: {
      page,
      limit,
      total: filteredApplications.length,
      totalPages: Math.ceil(filteredApplications.length / limit)
    }
  })
})

// POST /adoption/applications - Submit adoption application
const createAdoptionApplicationRoute = createRoute({
  method: 'post',
  path: '/applications',
  tags: ['Adoption'],
  summary: 'Submit adoption application',
  description: 'Submit a new adoption application for a dog',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateAdoptionApplicationSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: AdoptionApplicationSchema
        }
      },
      description: 'Adoption application created successfully'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Invalid input data'
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

adoptionRoutes.openapi(createAdoptionApplicationRoute, (c) => {
  const applicationData = c.req.valid('json')
  
  // Check if dog exists
  const dog = findById(mockDogs, applicationData.dogId)
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${applicationData.dogId} not found`
    }, 404)
  }
  
  const timestamps = generateTimestamps()
  const newApplication: typeof adoptionApplications[0] = {
    id: generateId(),
    ...applicationData,
    status: 'pending',
    ...timestamps
  }
  
  adoptionApplications.push(newApplication)
  
  return c.json(newApplication, 201)
})

// GET /adoption/applications/:id - Get specific adoption application
const getAdoptionApplicationRoute = createRoute({
  method: 'get',
  path: '/applications/{id}',
  tags: ['Adoption'],
  summary: 'Get adoption application',
  description: 'Retrieve a specific adoption application by ID',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid application ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdoptionApplicationSchema
        }
      },
      description: 'Adoption application details'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Application not found'
    }
  }
})

adoptionRoutes.openapi(getAdoptionApplicationRoute, (c) => {
  const { id } = c.req.valid('param')
  const application = findById(adoptionApplications, id)
  
  if (!application) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Adoption application with ID ${id} not found`
    }, 404)
  }
  
  return c.json(application)
})

// PUT /adoption/applications/:id/status - Update application status
const updateApplicationStatusRoute = createRoute({
  method: 'put',
  path: '/applications/{id}/status',
  tags: ['Adoption'],
  summary: 'Update application status',
  description: 'Update the status of an adoption application (approve, reject, etc.)',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid application ID format')
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['pending', 'approved', 'rejected', 'withdrawn']),
            notes: z.string().max(1000).optional()
          })
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdoptionApplicationSchema
        }
      },
      description: 'Application status updated successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Application not found'
    }
  }
})

adoptionRoutes.openapi(updateApplicationStatusRoute, (c) => {
  const { id } = c.req.valid('param')
  const { status, notes } = c.req.valid('json')
  
  const applicationIndex = adoptionApplications.findIndex(app => app.id === id)
  if (applicationIndex === -1) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Adoption application with ID ${id} not found`
    }, 404)
  }
  
  const updatedApplication = {
    ...adoptionApplications[applicationIndex],
    status,
    notes: notes || adoptionApplications[applicationIndex].notes,
    updatedAt: new Date().toISOString()
  }
  
  adoptionApplications[applicationIndex] = updatedApplication
  
  return c.json(updatedApplication)
})

// GET /adoption/available - Get available dogs for adoption
const getAvailableDogsRoute = createRoute({
  method: 'get',
  path: '/available',
  tags: ['Adoption'],
  summary: 'Get available dogs',
  description: 'Retrieve dogs that are available for adoption (no approved applications)',
  request: {
    query: z.object({
      breed: z.string().optional(),
      size: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
      age_max: z.coerce.number().int().positive().optional(),
      goodWithKids: z.coerce.boolean().optional()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(DogSchema)
        }
      },
      description: 'Available dogs for adoption'
    }
  }
})

adoptionRoutes.openapi(getAvailableDogsRoute, (c) => {
  const query = c.req.valid('query')
  
  // Get dogs that don't have approved adoption applications
  const approvedDogIds = adoptionApplications
    .filter(app => app.status === 'approved')
    .map(app => app.dogId)
  
  let availableDogs = mockDogs.filter(dog => !approvedDogIds.includes(dog.id))

  // Apply filters
  if (query.breed) {
    availableDogs = availableDogs.filter(dog => 
      dog.breed.toLowerCase().includes(query.breed!.toLowerCase())
    )
  }
  if (query.size) {
    availableDogs = availableDogs.filter(dog => dog.size === query.size)
  }
  if (query.age_max !== undefined) {
    availableDogs = availableDogs.filter(dog => dog.age <= query.age_max!)
  }

  return c.json(availableDogs)
})

// GET /adoption/stats - Get adoption statistics
const getAdoptionStatsRoute = createRoute({
  method: 'get',
  path: '/stats',
  tags: ['Adoption'],
  summary: 'Get adoption statistics',
  description: 'Retrieve statistics about adoptions and applications',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            totalDogs: z.number().int(),
            availableForAdoption: z.number().int(),
            totalApplications: z.number().int(),
            pendingApplications: z.number().int(),
            approvedApplications: z.number().int(),
            rejectedApplications: z.number().int(),
            adoptionRate: z.number()
          })
        }
      },
      description: 'Adoption statistics'
    }
  }
})

adoptionRoutes.openapi(getAdoptionStatsRoute, (c) => {
  const approvedCount = adoptionApplications.filter(app => app.status === 'approved').length
  const pendingCount = adoptionApplications.filter(app => app.status === 'pending').length
  const rejectedCount = adoptionApplications.filter(app => app.status === 'rejected').length
  const adoptionRate = mockDogs.length > 0 ? (approvedCount / mockDogs.length) * 100 : 0

  return c.json({
    totalDogs: mockDogs.length,
    availableForAdoption: mockDogs.length - approvedCount,
    totalApplications: adoptionApplications.length,
    pendingApplications: pendingCount,
    approvedApplications: approvedCount,
    rejectedApplications: rejectedCount,
    adoptionRate: Math.round(adoptionRate * 100) / 100
  })
})