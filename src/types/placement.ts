// Types for placement/job analytics data

export interface Role {
  role: string;
  package: number;
  package_details: string;
}

export interface SelectedStudent {
  name: string;
  enrollment_number: string;
  email: string | null;
  role: string;
  package: number; // Can be in rupees (9425000) or LPA (9.5)
  branch?: string;
}

export interface PlacementRecord {
  _id: string;
  company: string;
  roles: Role[];
  job_location: string[] | null;
  joining_date: string | null;
  students_selected: SelectedStudent[];
  number_of_offers: number;
  additional_info?: string;
  email_subject?: string;
  email_sender?: string;
  saved_at?: string;
}

export interface PlacementResponse {
  ok: boolean;
  data: PlacementRecord[];
}

export interface CompanyStats {
  company: string;
  totalOffers: number;
  roles: Role[];
  avgPackage: number;
  maxPackage: number;
  minPackage: number;
}

export interface StudentPlacement {
  name: string;
  enrollment_number: string;
  email: string;
  company: string;
  role: string;
  package: number;
}
