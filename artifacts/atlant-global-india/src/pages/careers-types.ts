export type EmploymentType = "Full-Time" | "Part-Time" | "Internship";
export type CareerApplicationStatus = "new" | "reviewing" | "shortlisted" | "rejected" | "hired";

export interface CareerJob {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceRequired: string;
  summary: string;
  description: string;
  requiredSkills: string[];
  published: boolean;
  filled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CareerJobDraft = Omit<CareerJob, "id" | "createdAt" | "updatedAt">;

export interface CareerApplication {
  id: string;
  jobId: string | null;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  coverLetter: string | null;
  resumeOriginalName: string;
  status: CareerApplicationStatus;
  createdAt: string;
}
