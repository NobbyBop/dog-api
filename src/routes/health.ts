import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { HealthRecordSchema, CreateHealthRecordSchema, ErrorSchema } from '../schemas'
import { mockHealthRecords, mockDogs, findById, generateId, generateTimestamps } from '../data/mockData'

export const healthRoutes = new OpenAPIHono()

// In-memory storage for health records
let healthRecords = [...mockHealthRecords]

// GET /health/records - List all health records
const listHealthRecordsRoute = createRoute({
  method: 'get',
  path: '/records',
  summary: 'List health records',
  description: 'Retrieve health records with optional filtering by dog or record type',
  request: {
    query: z.object({
      dogId: z.string().uuid().optional(),
      type: z.enum(['vaccination', 'checkup', 'treatment', 'surgery', 'emergency', 'dental', 'grooming']).optional(),
      veterinarian: z.string().optional(),
      dateFrom: z.string().date().optional(),
      dateTo: z.string().date().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10)
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(HealthRecordSchema),
            pagination: z.object({
              page: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
              totalPages: z.number().int()
            })
          })
        }
      },
      description: 'List of health records'
    }
  }
})

healthRoutes.openapi(listHealthRecordsRoute, (c) => {
  const query = c.req.valid('query')
  let filteredRecords = healthRecords

  if (query.dogId) {
    filteredRecords = filteredRecords.filter(record => record.dogId === query.dogId)
  }
  if (query.type) {
    filteredRecords = filteredRecords.filter(record => record.type === query.type)
  }
  if (query.veterinarian) {
    filteredRecords = filteredRecords.filter(record => 
      record.veterinarian.toLowerCase().includes(query.veterinarian!.toLowerCase())
    )
  }
  if (query.dateFrom) {
    filteredRecords = filteredRecords.filter(record => record.date >= query.dateFrom!)
  }
  if (query.dateTo) {
    filteredRecords = filteredRecords.filter(record => record.date <= query.dateTo!)
  }

  // Pagination
  const page = query.page
  const limit = query.limit
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  return c.json({
    data: paginatedRecords,
    pagination: {
      page,
      limit,
      total: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    }
  })
})

// POST /health/records - Create health record
const createHealthRecordRoute = createRoute({
  method: 'post',
  path: '/records',
  summary: 'Create health record',
  description: 'Add a new health record for a dog',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateHealthRecordSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: HealthRecordSchema
        }
      },
      description: 'Health record created successfully'
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

healthRoutes.openapi(createHealthRecordRoute, (c) => {
  const recordData = c.req.valid('json')
  
  // Check if dog exists
  const dog = findById(mockDogs, recordData.dogId)
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${recordData.dogId} not found`
    }, 404)
  }
  
  const timestamps = generateTimestamps()
  const newRecord: typeof healthRecords[0] = {
    id: generateId(),
    ...recordData,
    ...timestamps
  }
  
  healthRecords.push(newRecord)
  
  return c.json(newRecord, 201)
})

// GET /health/records/:id - Get specific health record
const getHealthRecordRoute = createRoute({
  method: 'get',
  path: '/records/{id}',
  summary: 'Get health record',
  description: 'Retrieve a specific health record by ID',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid record ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthRecordSchema
        }
      },
      description: 'Health record details'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Health record not found'
    }
  }
})

healthRoutes.openapi(getHealthRecordRoute, (c) => {
  const { id } = c.req.valid('param')
  const record = findById(healthRecords, id)
  
  if (!record) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Health record with ID ${id} not found`
    }, 404)
  }
  
  return c.json(record)
})

// GET /health/dogs/:dogId/vaccination-history - Get vaccination history for a dog
const getDogVaccinationHistoryRoute = createRoute({
  method: 'get',
  path: '/dogs/{dogId}/vaccination-history',
  summary: 'Get dog vaccination history',
  description: 'Retrieve vaccination history for a specific dog',
  request: {
    params: z.object({
      dogId: z.string().uuid('Invalid dog ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            dogId: z.string().uuid(),
            vaccinations: z.array(HealthRecordSchema),
            upToDate: z.boolean(),
            nextDue: z.string().date().optional()
          })
        }
      },
      description: 'Dog vaccination history'
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

healthRoutes.openapi(getDogVaccinationHistoryRoute, (c) => {
  const { dogId } = c.req.valid('param')
  
  // Check if dog exists
  const dog = findById(mockDogs, dogId)
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${dogId} not found`
    }, 404)
  }
  
  const vaccinations = healthRecords
    .filter(record => record.dogId === dogId && record.type === 'vaccination')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Simple logic to determine if vaccinations are up to date
  const lastVaccination = vaccinations[0]
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const upToDate = lastVaccination && new Date(lastVaccination.date) > oneYearAgo
  const nextDue = lastVaccination?.followUpDate || undefined
  
  return c.json({
    dogId,
    vaccinations,
    upToDate,
    nextDue
  })
})

// GET /health/veterinarians - Get list of veterinarians
const getVeterinariansRoute = createRoute({
  method: 'get',
  path: '/veterinarians',
  summary: 'Get veterinarians',
  description: 'Retrieve a list of veterinarians and their clinics from health records',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            veterinarians: z.array(z.object({
              name: z.string(),
              clinic: z.string(),
              recordCount: z.number().int(),
              specialties: z.array(z.string())
            }))
          })
        }
      },
      description: 'List of veterinarians'
    }
  }
})

healthRoutes.openapi(getVeterinariansRoute, (c) => {
  const vetMap = new Map<string, {
    name: string,
    clinic: string,
    recordCount: number,
    specialties: Set<string>
  }>()

  healthRecords.forEach(record => {
    const key = `${record.veterinarian}-${record.clinic}`
    if (!vetMap.has(key)) {
      vetMap.set(key, {
        name: record.veterinarian,
        clinic: record.clinic,
        recordCount: 0,
        specialties: new Set()
      })
    }
    const vet = vetMap.get(key)!
    vet.recordCount++
    vet.specialties.add(record.type)
  })

  const veterinarians = Array.from(vetMap.values()).map(vet => ({
    name: vet.name,
    clinic: vet.clinic,
    recordCount: vet.recordCount,
    specialties: Array.from(vet.specialties)
  }))

  return c.json({ veterinarians })
})