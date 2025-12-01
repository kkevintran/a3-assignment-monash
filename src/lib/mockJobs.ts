import type { JobListing, Location, SalaryRange, JobRating } from '../types/job'

// Companies that are relevant for low income/entry-level job seekers
const mockCompanies = [
  { name: 'FreshGrocer Supermarket', size: 'large', website: 'https://freshgrocer.com' },
  { name: 'City Cleaning Services', size: 'medium', website: 'https://citycleaning.com' },
  { name: 'Care4Kids Childcare', size: 'small', website: 'https://care4kids.org' },
  { name: 'Budget Hospitality', size: 'medium', website: 'https://budgethospitality.com' },
  { name: 'Community Eats', size: 'medium', website: 'https://communityeats.org' },
  { name: 'SafeRide Transit', size: 'large', website: 'https://saferide.com' },
  { name: 'Metro Courier', size: 'small', website: 'https://metrocourier.com' },
  { name: 'Helping Hands Healthcare', size: 'medium', website: 'https://helpinghandshealth.org' },
  { name: 'Senior Living Center', size: 'large', website: 'https://seniorlivingcenter.com' },
  { name: 'FastFix Home Repairs', size: 'small', website: 'https://fastfixrepairs.com' },
  { name: 'Urban Green Parks', size: 'medium', website: 'https://urbangreenparks.org' },
  { name: 'Neighborhood Construction', size: 'medium', website: 'https://neighborhoodcon.com' },
]

// Skills for low income/entry-level jobs
const mockSkills = [
  // General Entry-Level
  'Reliability',
  'Teamwork',
  'Communication',
  'Time Management',
  'Adaptability',
  'Attention to Detail',
  'Customer Service',
  'Basic Math Skills',
  'Following Instructions',

  // Cleaning, Hospitality, Food Service
  'Cleaning & Sanitation',
  'Stocking Shelves',
  'Food Preparation',
  'Dishwashing',
  'Cash Handling',
  'Cooking',
  'Serving Customers',
  'Waitressing/Waiting Tables',
  'Point of Sale Operation',
  'Barista Skills',

  // Manual Labor & Trades
  'Manual Labor',
  'Lifting & Carrying',
  'Basic Carpentry',
  'Use of Hand Tools',
  'Gardening & Landscaping',
  'Painting',
  'Simple Repairs',
  'Warehouse Operations',
  'Assembly Line Work',

  // Support & Care
  'Childcare',
  'Home Care Assistance',
  'Disability Support',
  'Aged Care',
  'Companionship',

  // Delivery, Driver, Transport
  'Driving',
  'Delivery Driving',
  'Bike Delivery',
  'Navigation',
  'Basic Vehicle Maintenance',

  // Other useful, attainable skills/certificates
  'Bilingual/Multilingual',
  'First Aid',
  'Food Handling Certificate',
  'RSA (Responsible Service of Alcohol)',
  'Working With Children Check',
  'Working Under Pressure',
  'Forklift License',
]

// Inclusive, supportive, accessible attributes
const mockAttributes = [
  'entry-level',
  'no-experience-required',
  'on-the-job-training',
  'part-time-available',
  'flexible-schedule',
  'evening-shifts',
  'weekend-shifts',
  'family-friendly',
  'accepts-cash-jobs',
  'paid-weekly',
  'transportation-provided',
  'accessible-location',
  'bilingual-preferred',
  'community-service',
  'seasonal-work',
  'overtime-opportunities',
  'short-term-contract',
  'students-welcome',
  'second-chance-employer',
  'retiree-friendly',
  'youth-employment',
  'local-hiring',
  'elderly-supportive',
  'single-parent-supportive',
  'disability-inclusive'
]

// Focused on Australia, can expand if needed
const mockLocations: Location[] = [
  { city: 'Sydney', state: 'NSW', country: 'Australia', remote: false, hybrid: false },
  { city: 'Melbourne', state: 'VIC', country: 'Australia', remote: false, hybrid: false },
  { city: 'Brisbane', state: 'QLD', country: 'Australia', remote: false, hybrid: false },
  { city: 'Perth', state: 'WA', country: 'Australia', remote: false, hybrid: false },
  { city: 'Adelaide', state: 'SA', country: 'Australia', remote: false, hybrid: false },
  { city: 'Hobart', state: 'TAS', country: 'Australia', remote: false, hybrid: false },
  { city: 'Canberra', state: 'ACT', country: 'Australia', remote: false, hybrid: false },
  { city: 'Darwin', state: 'NT', country: 'Australia', remote: false, hybrid: false },
]

// Helpers
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateMockRating(userId: string): JobRating {
  const comments = [
    'Welcoming team and flexible hours.',
    'Easy to learn if you pay attention!',
    'Pays on time, supportive supervisor.',
    'Great for students or part-timers.',
    'Work can be tiring but rewarding.',
  ]
  
  return {
    userId,
    rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars mostly
    comment: getRandomElement(comments),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }
}

// Entry-level/low-income friendly job titles & description templates
const jobInfoBank = [
  {
    title: 'Supermarket Shelf Stacker',
    description: `Help keep our supermarket shelves stocked and organize products for easy shopping. Shift work available and training provided.`,
    industry: 'Retail',
    category: 'Supermarket',
    requirements: ['No experience required', 'Able to lift boxes (~10kg)', 'Punctual and reliable'],
    responsibilities: [
      'Stock and rotate items on shelves',
      'Assist customers in aisles',
      'Follow safety and cleanliness procedures'
    ]
  },
  {
    title: 'Cleaning Crew Member',
    description: `Work as part of our cleaning team for offices, schools, or venues. We provide all training and equipment.`,
    industry: 'Cleaning',
    category: 'Cleaning Services',
    requirements: ['Attention to detail', 'Willing to learn', 'No previous experience required'],
    responsibilities: [
      'General cleaning duties (sweeping, mopping, dusting)',
      'Empty bins and clean restrooms',
      'Follow instructions for task lists'
    ]
  },
  {
    title: 'Café All-Rounder',
    description: `Join our community café! Great for school leavers or anyone looking to get started in hospitality. No late nights!`,
    industry: 'Hospitality',
    category: 'Café/Restaurant',
    requirements: ['Friendly attitude', 'Weekend or early morning availability'],
    responsibilities: [
      'Serve customers and take orders',
      'Clear tables and keep dining area tidy',
      'Make basic coffees (training provided)'
    ]
  },
  {
    title: 'Childcare Assistant',
    description: `Support our childcare staff in a friendly and safe environment. Perfect for parents re-entering the workforce.`,
    industry: 'Care & Support',
    category: 'Childcare',
    requirements: [
      'Working With Children Check (or willingness to obtain)',
      'Enjoys working with children',
      'Punctual and dependable'
    ],
    responsibilities: [
      'Help watch children during play/activities',
      'Assist in preparing snacks and cleaning',
      'Support lead childcare worker'
    ]
  },
  {
    title: 'Delivery Driver',
    description: `Deliver groceries or parcels locally. Flexible shifts, paid weekly, bring your own car or bike.`,
    industry: 'Logistics',
    category: 'Delivery',
    requirements: [
      'Valid driver’s license or bike',
      'Good navigation skills',
      'Basic phone usage'
    ],
    responsibilities: [
      'Deliver orders to local customers',
      'Follow safe driving practices',
      'Communicate with dispatch if needed'
    ]
  },
  {
    title: 'Housekeeping Attendant',
    description: `Work in hotels or motels to keep rooms clean and ready for guests. Day shifts mostly; uniforms provided.`,
    industry: 'Hospitality',
    category: 'Housekeeping',
    requirements: ['Attention to detail', 'Able to work independently', 'Responsible attitude'],
    responsibilities: [
      'Clean guest rooms and change linens',
      'Re-stock supplies in guest areas',
      'Report maintenance issues to management'
    ]
  },
  {
    title: 'Aged Care Support Worker',
    description: `Join a team helping elderly people with day-to-day tasks at home. Empathy and reliability valued above all.`,
    industry: 'Care & Support',
    category: 'Aged Care',
    requirements: ['Empathy for elderly', 'Willingness to learn', 'First Aid certificate (preferred)'],
    responsibilities: [
      'Assist clients with daily tasks',
      'Provide companionship',
      'Monitor client wellbeing & report concerns'
    ]
  },
  {
    title: 'Gardening and Grounds Assistant',
    description: 'Help keep parks and gardens tidy. Great for people who enjoy working outdoors!',
    industry: 'Maintenance',
    category: 'Gardening/Landscaping',
    requirements: ['Physically fit', 'No experience required', 'Enjoy working outdoors'],
    responsibilities: [
      'Water plants, mow lawns, prune bushes',
      'Pick up litter, basic landscaping work',
      'Use simple gardening tools safely'
    ]
  },
  {
    title: 'Warehouse Picker/Packer',
    description: `Assist with sorting, packing and shipping in a warehouse environment. Full safety training given.`,
    industry: 'Logistics',
    category: 'Warehouse',
    requirements: ['Attention to detail', 'Standing for extended periods', 'Able to lift up to 15kg'],
    responsibilities: [
      'Pick and pack orders for shipping',
      'Sort stock and check for damage',
      'Maintain clean and safe work area'
    ]
  },
  {
    title: 'Kitchen Hand',
    description: 'Assist chefs with simple food prep and dishwashing in busy local restaurant. Ideal for first job seekers.',
    industry: 'Hospitality',
    category: 'Restaurant',
    requirements: ['Able to follow instructions', 'Good hygiene', 'Team player'],
    responsibilities: [
      'Wash dishes and clean kitchen',
      'Basic food prep as directed',
      'Help receive and store deliveries'
    ]
  }
]

// Job types and levels are always entry/junior/contract/part-time
const jobTypes: JobListing['jobType'][] = ['full-time', 'part-time', 'contract']
const experienceLevels: JobListing['experienceLevel'][] = ['entry', 'junior']

// Salary focused at lower end (hourly or yearly)
function getMockSalary(): SalaryRange {
  // In AUD, reflect common pay bands for such roles
  const period = Math.random() > 0.4 ? 'hourly' : 'yearly'
  if (period === 'hourly') {
    const min = Math.floor(Math.random() * 7) + 23 // $23-30/hr (AU min wage vicinity)
    return { min, max: min + Math.floor(Math.random() * 4) + 1, currency: 'AUD', period }
  } else {
    const min = Math.floor(Math.random() * 8000) + 42000 // $42k-50k
    return { min, max: min + Math.floor(Math.random() * 9000), currency: 'AUD', period }
  }
}

export function generateMockJob(overrides?: Partial<JobListing>): JobListing {
  const company = getRandomElement(mockCompanies)
  const location = getRandomElement(mockLocations)
  const jobInfo = getRandomElement(jobInfoBank)

  // Between 2-5 skills/attributes
  const requiredSkills = getRandomElements(mockSkills, Math.floor(Math.random() * 3) + 2)
  const preferredSkills = getRandomElements(
    mockSkills.filter((s) => !requiredSkills.includes(s)),
    Math.random() > 0.5 ? 1 : 0
  )
  const attributes = getRandomElements(mockAttributes, Math.floor(Math.random() * 3) + 2)

  // Mock applicants, ratings, saves
  const numApplicants = Math.floor(Math.random() * 12)
  const applicants = Array.from({ length: numApplicants }, (_, i) => `user_${i + 1}`)

  const numRatings = Math.floor(Math.random() * 8) + 1
  const ratings = Array.from({ length: numRatings }, (_, i) => generateMockRating(`user_${i + 10}`))
  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

  const numSaves = Math.floor(Math.random() * 6)
  const savesUserIds = Array.from({ length: numSaves }, (_, i) => `user_${i + 50}`)

  const now = new Date()
  const postedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)

  // Benefits (keep it realistic for these job types)
  const benefitOptions = [
    'Paid Training',
    'Flexible Shifts',
    'Uniforms Provided',
    'Free Meals',
    'Employee Discounts',
    'Overtime Pay',
    'Career Progression',
    'Supportive Team'
  ]
  const benefits = getRandomElements(benefitOptions, Math.floor(Math.random() * 3) + 1)

  return {
    title: jobInfo.title,
    description: jobInfo.description,
    companyName: company.name,
    companyWebsite: company.website,
    companySize: company.size as any,
    location,
    jobType: getRandomElement(jobTypes),
    experienceLevel: getRandomElement(experienceLevels),
    salary: getMockSalary(),
    benefits,
    requiredSkills,
    ...(preferredSkills.length > 0 && { preferredSkills }),
    attributes,
    requirements: jobInfo.requirements,
    responsibilities: jobInfo.responsibilities,
    applicants,
    applicantCount: applicants.length,
    ratings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingCount: ratings.length,
    views: Math.floor(Math.random() * 400) + 20,
    saves: savesUserIds.length,
    savesUserIds,
    status: getRandomElement(['active', 'active', 'active', 'closed'] as const),
    featured: Math.random() > 0.85,
    priority: Math.floor(Math.random() * 4),
    industry: jobInfo.industry,
    category: jobInfo.category,
    postedBy: 'employer_1',
    createdAt: postedAt,
    updatedAt: postedAt,
    postedAt,
    ...overrides,
  }
}

export function generateMockJobs(count: number): JobListing[] {
  return Array.from({ length: count }, () => generateMockJob())
}
