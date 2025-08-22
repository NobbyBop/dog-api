import { v4 as uuidv4 } from "uuid";
import type {
  Dog,
  Breed,
  AdoptionApplication,
  HealthRecord,
  TrainingRecord,
} from "../schemas";

// Utility function to generate random date
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString();
};

const randomPastDate = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split("T")[0];
};

// Mock Dogs Data
export const mockDogs: Dog[] = [
  {
    id: uuidv4(),
    name: "Buddy",
    breed: "Golden Retriever",
    age: 3,
    weight: 65,
    gender: "male",
    color: "Golden",
    size: "large",
    temperament: ["friendly", "energetic", "loyal"],
    isNeutered: true,
    microchipId: "123456789012345",
    photos: [
      "https://example.com/photos/buddy1.jpg",
      "https://example.com/photos/buddy2.jpg",
    ],
    description:
      "Buddy is a lovable Golden Retriever who loves playing fetch and swimming. He's great with kids and other dogs.",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "Luna",
    breed: "Border Collie",
    age: 2,
    weight: 45,
    gender: "female",
    color: "Black and White",
    size: "medium",
    temperament: ["intelligent", "active", "responsive"],
    isNeutered: true,
    microchipId: "987654321098765",
    photos: ["https://example.com/photos/luna1.jpg"],
    description:
      "Luna is a brilliant Border Collie who excels at agility training. She needs an active family who can keep up with her energy.",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "Max",
    breed: "German Shepherd",
    age: 5,
    weight: 75,
    gender: "male",
    color: "Brown and Black",
    size: "large",
    temperament: ["protective", "confident", "courageous"],
    isNeutered: true,
    photos: [
      "https://example.com/photos/max1.jpg",
      "https://example.com/photos/max2.jpg",
      "https://example.com/photos/max3.jpg",
    ],
    description:
      "Max is a noble German Shepherd with excellent training. He would make a great guard dog and family companion.",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "Bella",
    breed: "French Bulldog",
    age: 1,
    weight: 22,
    gender: "female",
    color: "Cream",
    size: "small",
    temperament: ["adaptable", "playful", "alert"],
    isNeutered: false,
    photos: ["https://example.com/photos/bella1.jpg"],
    description:
      "Bella is a charming French Bulldog puppy who loves attention and cuddles. Perfect for apartment living.",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "Rocky",
    breed: "Pitbull Terrier",
    age: 4,
    weight: 55,
    gender: "male",
    color: "Brindle",
    size: "medium",
    temperament: ["loyal", "affectionate", "strong"],
    isNeutered: true,
    microchipId: "456789123456789",
    photos: [
      "https://example.com/photos/rocky1.jpg",
      "https://example.com/photos/rocky2.jpg",
    ],
    description:
      "Rocky is a gentle giant who loves children and playing tug-of-war. He's looking for a loving forever home.",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
];

// Mock Broods Data
export const mockBroods: Breed[] = [
  {
    id: uuidv4(),
    name: "Golden Retriever",
    group: "sporting",
    origin: "Scotland",
    size: "large",
    lifeSpan: { min: 10, max: 12 },
    temperament: ["friendly", "intelligent", "devoted", "trustworthy"],
    exerciseNeeds: "high",
    groomingNeeds: "moderate",
    trainability: "high",
    goodWithKids: true,
    goodWithPets: true,
    description:
      "Golden Retrievers are friendly, intelligent dogs that are devoted to their families. They were originally bred to retrieve waterfowl for hunters.",
    image: "https://example.com/broods/golden-retriever.jpg",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "Border Collie",
    group: "herding",
    origin: "United Kingdom",
    size: "medium",
    lifeSpan: { min: 12, max: 15 },
    temperament: ["intelligent", "energetic", "responsive", "alert"],
    exerciseNeeds: "very-high",
    groomingNeeds: "moderate",
    trainability: "very-high",
    goodWithKids: true,
    goodWithPets: true,
    description:
      "Border Collies are extremely intelligent and energetic dogs that excel at herding and agility sports.",
    image: "https://example.com/broods/border-collie.jpg",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "German Shepherd",
    group: "herding",
    origin: "Germany",
    size: "large",
    lifeSpan: { min: 9, max: 13 },
    temperament: ["confident", "courageous", "smart", "versatile"],
    exerciseNeeds: "high",
    groomingNeeds: "moderate",
    trainability: "very-high",
    goodWithKids: true,
    goodWithPets: false,
    description:
      "German Shepherds are large, athletic dogs known for their loyalty, courage, and versatility as working dogs.",
    image: "https://example.com/broods/german-shepherd.jpg",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    name: "French Bulldog",
    group: "non-sporting",
    origin: "France",
    size: "small",
    lifeSpan: { min: 10, max: 12 },
    temperament: ["adaptable", "playful", "smart", "alert"],
    exerciseNeeds: "low",
    groomingNeeds: "low",
    trainability: "moderate",
    goodWithKids: true,
    goodWithPets: true,
    description:
      "French Bulldogs are small, muscular dogs with a calm nature and require minimal exercise, making them excellent city dogs.",
    image: "https://example.com/broods/french-bulldog.jpg",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
];

// Mock Adoption Applications
export const mockAdoptionApplications: AdoptionApplication[] = [
  {
    id: uuidv4(),
    dogId: mockDogs[0].id,
    applicantName: "John Smith",
    applicantEmail: "john.smith@email.com",
    applicantPhone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
    housingType: "house",
    hasYard: true,
    hasOtherPets: false,
    experience: "experienced",
    workSchedule: "9-5 weekdays, home evenings and weekends",
    reason:
      "Looking for a loyal family companion for our children. We have experience with Golden Retrievers and love their temperament.",
    status: "pending",
    notes: "Strong application, good references",
    createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    dogId: mockDogs[1].id,
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah.j@email.com",
    applicantPhone: "+1-555-0456",
    address: {
      street: "456 Oak Ave",
      city: "Denver",
      state: "CO",
      zipCode: "80202",
    },
    housingType: "house",
    hasYard: true,
    hasOtherPets: true,
    otherPetsDetails: "One cat named Whiskers, very dog-friendly",
    experience: "very-experienced",
    workSchedule: "Work from home, very flexible schedule",
    reason:
      "I'm an agility trainer and Luna would be perfect for my training programs. I have experience with Border Collies.",
    status: "approved",
    notes: "Perfect match - applicant is professional dog trainer",
    createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date()),
  },
];

// Mock Health Records
export const mockHealthRecords: HealthRecord[] = [
  {
    id: uuidv4(),
    dogId: mockDogs[0].id,
    type: "vaccination",
    date: randomPastDate(30),
    veterinarian: "Dr. Emily Chen",
    clinic: "Happy Paws Veterinary Clinic",
    description: "Annual vaccination including rabies, DHPP, and bordetella",
    medications: [
      { name: "Rabies Vaccine", dosage: "1ml", frequency: "Annual" },
      { name: "DHPP Vaccine", dosage: "1ml", frequency: "Annual" },
    ],
    cost: 150,
    followUpDate: new Date(
      new Date().getFullYear() + 1,
      new Date().getMonth(),
      new Date().getDate()
    )
      .toISOString()
      .split("T")[0],
    notes: "Dog tolerated vaccines well, no adverse reactions",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    dogId: mockDogs[0].id,
    type: "checkup",
    date: randomPastDate(90),
    veterinarian: "Dr. Michael Rodriguez",
    clinic: "Happy Paws Veterinary Clinic",
    description: "Routine wellness examination and health screening",
    cost: 85,
    notes: "Overall excellent health, slight tartar buildup on teeth",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    dogId: mockDogs[1].id,
    type: "treatment",
    date: randomPastDate(45),
    veterinarian: "Dr. Lisa Park",
    clinic: "Mountain View Animal Hospital",
    description: "Treatment for minor ear infection",
    medications: [
      {
        name: "Antibiotic Ear Drops",
        dosage: "3 drops",
        frequency: "Twice daily for 10 days",
      },
    ],
    cost: 65,
    notes: "Infection cleared up well, no follow-up needed",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
];

// Mock Training Records
export const mockTrainingRecords: TrainingRecord[] = [
  {
    id: uuidv4(),
    dogId: mockDogs[0].id,
    type: "basic-obedience",
    trainer: "Mark Thompson",
    facility: "Happy Tails Training Center",
    startDate: randomPastDate(120),
    endDate: randomPastDate(60),
    status: "completed",
    skills: ["sit", "stay", "down", "come", "heel", "leave it"],
    progress: "excellent",
    cost: 300,
    notes: "Buddy was an exceptional student, learned all commands quickly",
    certificates: [
      "https://example.com/certificates/buddy-basic-obedience.pdf",
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    dogId: mockDogs[1].id,
    type: "agility",
    trainer: "Sarah Johnson",
    facility: "Mountain Agility Club",
    startDate: randomPastDate(90),
    status: "in-progress",
    skills: ["tunnel", "weave poles", "A-frame", "jump", "pause table"],
    progress: "excellent",
    cost: 450,
    notes: "Luna is a natural at agility, very fast learner",
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: uuidv4(),
    dogId: mockDogs[2].id,
    type: "advanced-obedience",
    trainer: "Robert Miller",
    facility: "Elite K9 Academy",
    startDate: randomPastDate(200),
    endDate: randomPastDate(140),
    status: "completed",
    skills: [
      "heel off-leash",
      "distance commands",
      "emergency recall",
      "advanced stay",
      "protection work",
    ],
    progress: "excellent",
    cost: 800,
    notes: "Max completed advanced protection training with honors",
    certificates: [
      "https://example.com/certificates/max-advanced-obedience.pdf",
    ],
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
];

// Helper function to get data by ID
export const findById = <T extends { id: string }>(
  data: T[],
  id: string
): T | undefined => {
  return data.find((item) => item.id === id);
};

// Helper function to generate new ID
export const generateId = (): string => uuidv4();

// Helper function to generate timestamps
export const generateTimestamps = () => {
  const now = new Date().toISOString();
  return { createdAt: now, updatedAt: now };
};
