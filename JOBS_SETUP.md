# Job Listings Database Setup

This document describes the job listings collection structure and how to use it.

## Overview

The job listings system includes:
- **TypeScript types** for type safety (`src/types/job.ts`)
- **Mock data generator** for testing (`src/lib/mockJobs.ts`)
- **Firestore composable functions** for CRUD operations (`src/composables/useFirestore.ts`)
- **Security rules** for Firestore (`firestore.rules`)
- **Seed script** to populate the database (`scripts/seedJobs.ts`)

## Collection Structure

### Jobs Collection (`jobs`)

Each job document contains:

#### Basic Information
- `title`: string - Job title
- `description`: string - Full job description
- `companyName`: string - Company name
- `companyLogo`: string (optional) - Company logo URL
- `companyWebsite`: string (optional) - Company website
- `companySize`: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' (optional)

#### Location & Type
- `location`: Location object
  - `city`: string
  - `state`: string (optional)
  - `country`: string
  - `remote`: boolean
  - `hybrid`: boolean (optional)
- `jobType`: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
- `experienceLevel`: 'entry' | 'junior' | 'mid' | 'senior' | 'executive'

#### Compensation
- `salary`: SalaryRange object (optional)
  - `min`: number
  - `max`: number
  - `currency`: string
  - `period`: 'hourly' | 'monthly' | 'yearly'
- `benefits`: string[] (optional) - Array of benefits

#### Skills & Requirements
- `requiredSkills`: string[] - Required skills
- `preferredSkills`: string[] (optional) - Preferred skills
- `attributes`: string[] - Job attributes (e.g., 'remote-friendly', 'startup')
- `requirements`: string[] (optional) - Job requirements
- `responsibilities`: string[] (optional) - Job responsibilities

#### Application Details
- `applicationInstructions`: string (optional)
- `applicationUrl`: string (optional) - External application link
- `applicationDeadline`: Date (optional)

#### Application Tracking
- `applicants`: string[] - Array of user IDs who applied
- `applicantCount`: number - Count of applicants (for quick queries)

#### Ratings & Reviews
- `ratings`: JobRating[] - Array of ratings
  - `userId`: string
  - `rating`: number (1-5)
  - `comment`: string (optional)
  - `createdAt`: Date
- `averageRating`: number - Computed average (1-5)
- `ratingCount`: number - Number of ratings

#### Engagement Metrics
- `views`: number - Number of views
- `saves`: number - Number of users who saved/bookmarked
- `savesUserIds`: string[] - User IDs who saved the job

#### Status & Metadata
- `status`: 'draft' | 'active' | 'closed' | 'expired'
- `featured`: boolean - For featured/promoted listings
- `priority`: number - For sorting (higher = more important)

#### Industry & Category
- `industry`: string (optional) - e.g., 'Technology', 'Healthcare'
- `category`: string (optional) - e.g., 'Software Development', 'Marketing'

#### Recruiter/Contact Info
- `postedBy`: string - User ID of the recruiter/employer
- `contactEmail`: string (optional)

#### Timestamps
- `createdAt`: Date
- `updatedAt`: Date
- `postedAt`: Date
- `expiresAt`: Date (optional)

### Applications Subcollection (`jobs/{jobId}/applications`)

Each application document contains:
- `userId`: string - User who applied
- `appliedAt`: Date - When they applied
- `status`: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
- `coverLetter`: string (optional)
- `resumeUrl`: string (optional)

## Usage

### Seeding the Database

To populate your Firestore database with mock job listings:

```bash
npm run seed:jobs
```

This will create 50 mock job listings with:
- Random companies, locations, and job types
- Mock applicants (user IDs)
- Mock ratings and reviews
- Mock saves/bookmarks
- Various skills and attributes

### Using the Composable

```typescript
import { useFirestore } from '@/composables/useFirestore'

const { 
  getActiveJobs, 
  getJobById, 
  applyToJob, 
  rateJob, 
  saveJob,
  searchJobs 
} = useFirestore()

// Get all active jobs
const jobs = await getActiveJobs(10) // Limit to 10

// Get a specific job
const job = await getJobById('job-id-here')

// Apply to a job
await applyToJob('job-id', 'user-id', {
  coverLetter: 'My cover letter...',
  resumeUrl: 'https://...'
})

// Rate a job
await rateJob('job-id', 'user-id', 5, 'Great company!')

// Save/bookmark a job
await saveJob('job-id', 'user-id')

// Search jobs
const results = await searchJobs({
  skills: ['JavaScript', 'React'],
  remote: true,
  jobType: 'full-time',
  minSalary: 80000,
  limitCount: 20
})
```

## Security Rules

The Firestore security rules allow:
- **Read**: Anyone can read active jobs, authenticated users can read their own posted jobs
- **Create**: Only users with 'employer' or 'admin' role can create jobs
- **Update**: Only the job poster or admin can update jobs
- **Delete**: Only admins can delete jobs
- **Applications**: Users can create their own applications, job posters can read/update applications

## Firestore Indexes

You may need to create composite indexes for certain queries. Common indexes needed:

1. `status` + `postedAt` (descending) - For `getActiveJobs()`
2. `status` + `location.remote` + `postedAt` (descending) - For remote job searches
3. `status` + `jobType` + `postedAt` (descending) - For job type filters

Create these in the Firebase Console under Firestore > Indexes.

## Next Steps

1. Run the seed script to populate your database
2. Create Firestore indexes for optimal query performance
3. Build UI components to display and interact with jobs
4. Implement job search and filtering features
5. Add job application workflow

