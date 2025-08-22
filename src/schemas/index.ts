import { z } from "zod";

// Dog schema
export const DogSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  breed: z.string().min(1).max(50),
  age: z.number().int().min(0).max(30),
  weight: z.number().positive().max(200),
  gender: z.enum(["male", "female"]),
  color: z.string().min(1).max(50),
  size: z.enum(["small", "medium", "large", "extra-large"]),
  temperament: z.array(z.string()).max(10),
  isNeutered: z.boolean(),
  microchipId: z.string().optional(),
  photos: z.array(z.string().url()).max(10),
  description: z.string().max(1000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateDogSchema = DogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDogSchema = CreateDogSchema.partial();

// Breed schema
export const Broodschema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  group: z.enum([
    "sporting",
    "hound",
    "working",
    "terrier",
    "toy",
    "non-sporting",
    "herding",
    "mixed",
  ]),
  origin: z.string().min(1).max(100),
  size: z.enum(["small", "medium", "large", "extra-large"]),
  lifeSpan: z.object({
    min: z.number().int().min(1).max(30),
    max: z.number().int().min(1).max(30),
  }),
  temperament: z.array(z.string()).max(15),
  exerciseNeeds: z.enum(["low", "moderate", "high", "very-high"]),
  groomingNeeds: z.enum(["low", "moderate", "high"]),
  trainability: z.enum(["low", "moderate", "high", "very-high"]),
  goodWithKids: z.boolean(),
  goodWithPets: z.boolean(),
  description: z.string().max(2000),
  image: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Adoption schema
export const AdoptionApplicationSchema = z.object({
  id: z.string().uuid(),
  dogId: z.string().uuid(),
  applicantName: z.string().min(1).max(100),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().min(10).max(20),
  address: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(50),
    zipCode: z.string().min(5).max(10),
  }),
  housingType: z.enum(["apartment", "house", "condo", "farm", "other"]),
  hasYard: z.boolean(),
  hasOtherPets: z.boolean(),
  otherPetsDetails: z.string().max(500).optional(),
  experience: z.enum(["none", "some", "experienced", "very-experienced"]),
  workSchedule: z.string().max(200),
  reason: z.string().min(10).max(1000),
  status: z.enum(["pending", "approved", "rejected", "withdrawn"]),
  notes: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateAdoptionApplicationSchema = AdoptionApplicationSchema.omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});

// Health record schema
export const HealthRecordSchema = z.object({
  id: z.string().uuid(),
  dogId: z.string().uuid(),
  type: z.enum([
    "vaccination",
    "checkup",
    "treatment",
    "surgery",
    "emergency",
    "dental",
    "grooming",
  ]),
  date: z.string().date(),
  veterinarian: z.string().min(1).max(100),
  clinic: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  medications: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        dosage: z.string().min(1).max(50),
        frequency: z.string().min(1).max(100),
      })
    )
    .optional(),
  cost: z.number().nonnegative().optional(),
  followUpDate: z.string().date().optional(),
  notes: z.string().max(1000).optional(),
  attachments: z.array(z.string().url()).max(5).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateHealthRecordSchema = HealthRecordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Training record schema
export const TrainingRecordSchema = z.object({
  id: z.string().uuid(),
  dogId: z.string().uuid(),
  type: z.enum([
    "basic-obedience",
    "advanced-obedience",
    "agility",
    "therapy",
    "service",
    "behavioral",
    "socialization",
  ]),
  trainer: z.string().min(1).max(100),
  facility: z.string().min(1).max(200).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  status: z.enum(["in-progress", "completed", "discontinued"]),
  skills: z.array(z.string().min(1).max(100)).max(20),
  progress: z.enum(["poor", "fair", "good", "excellent"]),
  cost: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  certificates: z.array(z.string().url()).max(5).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTrainingRecordSchema = TrainingRecordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Response schemas
export const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const PaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.object({
    data: z.array(itemSchema),
    pagination: PaginationSchema,
  });

// Query parameter schemas
export const DogQuerySchema = z.object({
  breed: z.string().optional(),
  age_min: z.coerce.number().int().nonnegative().optional(),
  age_max: z.coerce.number().int().nonnegative().optional(),
  weight_min: z.coerce.number().nonnegative().optional(),
  weight_max: z.coerce.number().nonnegative().optional(),
  gender: z.enum(["male", "female"]).optional(),
  size: z.enum(["small", "medium", "large", "extra-large"]).optional(),
  isNeutered: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type Dog = z.infer<typeof DogSchema>;
export type CreateDog = z.infer<typeof CreateDogSchema>;
export type UpdateDog = z.infer<typeof UpdateDogSchema>;
export type Breed = z.infer<typeof Broodschema>;
export type AdoptionApplication = z.infer<typeof AdoptionApplicationSchema>;
export type CreateAdoptionApplication = z.infer<
  typeof CreateAdoptionApplicationSchema
>;
export type HealthRecord = z.infer<typeof HealthRecordSchema>;
export type CreateHealthRecord = z.infer<typeof CreateHealthRecordSchema>;
export type TrainingRecord = z.infer<typeof TrainingRecordSchema>;
export type CreateTrainingRecord = z.infer<typeof CreateTrainingRecordSchema>;
export type DogQuery = z.infer<typeof DogQuerySchema>;
