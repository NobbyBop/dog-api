import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { TrainingRecordSchema, CreateTrainingRecordSchema, ErrorSchema } from '../schemas'
import { mockTrainingRecords, mockDogs, findById, generateId, generateTimestamps } from '../data/mockData'

export const trainingRoutes = new OpenAPIHono()

// In-memory storage for training records
let trainingRecords = [...mockTrainingRecords]

// GET /training/records - List all training records
const listTrainingRecordsRoute = createRoute({
  method: 'get',
  path: '/records',
  tags: ['Training'],
  summary: 'List training records',
  description: 'Retrieve training records with optional filtering',
  request: {
    query: z.object({
      dogId: z.string().uuid().optional(),
      type: z.enum(['basic-obedience', 'advanced-obedience', 'agility', 'therapy', 'service', 'behavioral', 'socialization']).optional(),
      trainer: z.string().optional(),
      status: z.enum(['in-progress', 'completed', 'discontinued']).optional(),
      progress: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10)
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(TrainingRecordSchema),
            pagination: z.object({
              page: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
              totalPages: z.number().int()
            })
          })
        }
      },
      description: 'List of training records'
    }
  }
})

trainingRoutes.openapi(listTrainingRecordsRoute, (c) => {
  const query = c.req.valid('query')
  let filteredRecords = trainingRecords

  if (query.dogId) {
    filteredRecords = filteredRecords.filter(record => record.dogId === query.dogId)
  }
  if (query.type) {
    filteredRecords = filteredRecords.filter(record => record.type === query.type)
  }
  if (query.trainer) {
    filteredRecords = filteredRecords.filter(record => 
      record.trainer.toLowerCase().includes(query.trainer!.toLowerCase())
    )
  }
  if (query.status) {
    filteredRecords = filteredRecords.filter(record => record.status === query.status)
  }
  if (query.progress) {
    filteredRecords = filteredRecords.filter(record => record.progress === query.progress)
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

// POST /training/records - Create training record
const createTrainingRecordRoute = createRoute({
  method: 'post',
  path: '/records',
  tags: ['Training'],
  summary: 'Create training record',
  description: 'Add a new training record for a dog',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTrainingRecordSchema
        }
      }
    }
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: TrainingRecordSchema
        }
      },
      description: 'Training record created successfully'
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

trainingRoutes.openapi(createTrainingRecordRoute, (c) => {
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
  const newRecord: typeof trainingRecords[0] = {
    id: generateId(),
    ...recordData,
    ...timestamps
  }
  
  trainingRecords.push(newRecord)
  
  return c.json(newRecord, 201)
})

// GET /training/records/:id - Get specific training record
const getTrainingRecordRoute = createRoute({
  method: 'get',
  path: '/records/{id}',
  tags: ['Training'],
  summary: 'Get training record',
  description: 'Retrieve a specific training record by ID',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid record ID format')
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TrainingRecordSchema
        }
      },
      description: 'Training record details'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Training record not found'
    }
  }
})

trainingRoutes.openapi(getTrainingRecordRoute, (c) => {
  const { id } = c.req.valid('param')
  const record = findById(trainingRecords, id)
  
  if (!record) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Training record with ID ${id} not found`
    }, 404)
  }
  
  return c.json(record)
})

// PUT /training/records/:id - Update training record
const updateTrainingRecordRoute = createRoute({
  method: 'put',
  path: '/records/{id}',
  tags: ['Training'],
  summary: 'Update training record',
  description: 'Update an existing training record',
  request: {
    params: z.object({
      id: z.string().uuid('Invalid record ID format')
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['in-progress', 'completed', 'discontinued']).optional(),
            progress: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
            endDate: z.string().date().optional(),
            skills: z.array(z.string().min(1).max(100)).max(20).optional(),
            notes: z.string().max(1000).optional(),
            certificates: z.array(z.string().url()).max(5).optional()
          })
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TrainingRecordSchema
        }
      },
      description: 'Training record updated successfully'
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema
        }
      },
      description: 'Training record not found'
    }
  }
})

trainingRoutes.openapi(updateTrainingRecordRoute, (c) => {
  const { id } = c.req.valid('param')
  const updateData = c.req.valid('json')
  
  const recordIndex = trainingRecords.findIndex(record => record.id === id)
  if (recordIndex === -1) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Training record with ID ${id} not found`
    }, 404)
  }
  
  const updatedRecord = {
    ...trainingRecords[recordIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  
  trainingRecords[recordIndex] = updatedRecord
  
  return c.json(updatedRecord)
})

// GET /training/dogs/:dogId/progress - Get training progress for a dog
const getDogTrainingProgressRoute = createRoute({
  method: 'get',
  path: '/dogs/{dogId}/progress',
  tags: ['Training'],
  summary: 'Get dog training progress',
  description: 'Retrieve all training records and progress for a specific dog',
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
            totalTrainings: z.number().int(),
            completedTrainings: z.number().int(),
            inProgressTrainings: z.number().int(),
            overallProgress: z.enum(['poor', 'fair', 'good', 'excellent']),
            skills: z.array(z.string()),
            trainingRecords: z.array(TrainingRecordSchema)
          })
        }
      },
      description: 'Dog training progress summary'
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

trainingRoutes.openapi(getDogTrainingProgressRoute, (c) => {
  const { dogId } = c.req.valid('param')
  
  // Check if dog exists
  const dog = findById(mockDogs, dogId)
  if (!dog) {
    return c.json({
      error: 'NOT_FOUND',
      message: `Dog with ID ${dogId} not found`
    }, 404)
  }
  
  const dogTrainings = trainingRecords.filter(record => record.dogId === dogId)
  const completedTrainings = dogTrainings.filter(record => record.status === 'completed')
  const inProgressTrainings = dogTrainings.filter(record => record.status === 'in-progress')
  
  // Collect all unique skills
  const allSkills = new Set<string>()
  dogTrainings.forEach(record => {
    record.skills.forEach(skill => allSkills.add(skill))
  })
  
  // Calculate overall progress (simplified logic)
  const progressScores = dogTrainings.map(record => {
    switch (record.progress) {
      case 'poor': return 1
      case 'fair': return 2
      case 'good': return 3
      case 'excellent': return 4
      default: return 2
    }
  })
  
  const avgScore = progressScores.length > 0 
    ? progressScores.reduce((a, b) => a + b, 0) / progressScores.length 
    : 2
  
  let overallProgress: 'poor' | 'fair' | 'good' | 'excellent'
  if (avgScore <= 1.5) overallProgress = 'poor'
  else if (avgScore <= 2.5) overallProgress = 'fair'
  else if (avgScore <= 3.5) overallProgress = 'good'
  else overallProgress = 'excellent'
  
  return c.json({
    dogId,
    totalTrainings: dogTrainings.length,
    completedTrainings: completedTrainings.length,
    inProgressTrainings: inProgressTrainings.length,
    overallProgress,
    skills: Array.from(allSkills),
    trainingRecords: dogTrainings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  })
})

// GET /training/trainers - Get list of trainers
const getTrainersRoute = createRoute({
  method: 'get',
  path: '/trainers',
  tags: ['Training'],
  summary: 'Get trainers',
  description: 'Retrieve a list of trainers and their specialties',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            trainers: z.array(z.object({
              name: z.string(),
              facility: z.string().optional(),
              specialties: z.array(z.string()),
              recordCount: z.number().int(),
              averageProgress: z.enum(['poor', 'fair', 'good', 'excellent'])
            }))
          })
        }
      },
      description: 'List of trainers'
    }
  }
})

trainingRoutes.openapi(getTrainersRoute, (c) => {
  const trainerMap = new Map<string, {
    name: string,
    facility?: string,
    specialties: Set<string>,
    recordCount: number,
    progressScores: number[]
  }>()

  trainingRecords.forEach(record => {
    const key = record.trainer
    if (!trainerMap.has(key)) {
      trainerMap.set(key, {
        name: record.trainer,
        facility: record.facility,
        specialties: new Set(),
        recordCount: 0,
        progressScores: []
      })
    }
    const trainer = trainerMap.get(key)!
    trainer.recordCount++
    trainer.specialties.add(record.type)
    
    // Add progress score
    const progressScore = {
      'poor': 1,
      'fair': 2,
      'good': 3,
      'excellent': 4
    }[record.progress]
    trainer.progressScores.push(progressScore)
  })

  const trainers = Array.from(trainerMap.values()).map(trainer => {
    const avgScore = trainer.progressScores.reduce((a, b) => a + b, 0) / trainer.progressScores.length
    let averageProgress: 'poor' | 'fair' | 'good' | 'excellent'
    if (avgScore <= 1.5) averageProgress = 'poor'
    else if (avgScore <= 2.5) averageProgress = 'fair'
    else if (avgScore <= 3.5) averageProgress = 'good'
    else averageProgress = 'excellent'

    return {
      name: trainer.name,
      facility: trainer.facility,
      specialties: Array.from(trainer.specialties),
      recordCount: trainer.recordCount,
      averageProgress
    }
  })

  return c.json({ trainers })
})