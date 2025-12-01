export interface JobRating {
  userId: string
  rating: number // 1-5 stars
  comment?: string
  createdAt: Date
}

export interface JobApplication {
  userId: string
  appliedAt: Date
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
  coverLetter?: string
  resumeUrl?: string
}

export interface SalaryRange {
  min: number
  max: number
  currency: string // 'USD', 'AUD', etc.
  period: 'hourly' | 'monthly' | 'yearly'
}

export interface Location {
  city: string
  state?: string
  country: string
  remote: boolean // true if remote, false if on-site
  hybrid?: boolean // true if hybrid option available
}

export interface JobListing {
  // Basic Information
  title: string
  description: string
  companyName: string
  companyLogo?: string
  companyWebsite?: string
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  
  // Location & Type
  location: Location
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'executive'
  
  // Compensation
  salary?: SalaryRange
  benefits?: string[] // e.g., ['Health Insurance', '401k', 'Remote Work']
  
  // Skills & Requirements
  requiredSkills: string[] // e.g., ['JavaScript', 'React', 'TypeScript']
  preferredSkills?: string[]
  attributes: string[] // e.g., ['remote-friendly', 'equity', 'startup', 'fast-paced']
  requirements?: string[] // Array of requirement strings
  responsibilities?: string[] // Array of responsibility strings
  
  // Application Details
  applicationInstructions?: string
  applicationUrl?: string // External application link
  applicationDeadline?: Date
  
  // Application Tracking
  applicants: string[] // Array of user IDs who applied
  applicantCount: number // Count of applicants (for quick queries)
  
  // Ratings & Reviews
  ratings: JobRating[]
  averageRating: number // Computed average (1-5)
  ratingCount: number
  
  // Engagement Metrics
  views: number
  saves: number // Number of users who saved/bookmarked
  savesUserIds: string[] // User IDs who saved the job
  
  // Status & Metadata
  status: 'draft' | 'active' | 'closed' | 'expired'
  featured: boolean // For featured/promoted listings
  priority: number // For sorting (higher = more important)
  
  // Industry & Category
  industry?: string // e.g., 'Technology', 'Healthcare', 'Finance'
  category?: string // e.g., 'Software Development', 'Marketing'
  
  // Recruiter/Contact Info
  postedBy: string // User ID of the recruiter/employer
  contactEmail?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  postedAt: Date
  expiresAt?: Date
}

