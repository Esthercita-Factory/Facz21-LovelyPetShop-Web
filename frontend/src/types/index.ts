export type UserRole = 'Admin' | 'Veterinario' | 'Recepcion' | 'Cliente';

export interface User {
  id?: number;
  uuid: string;
  username: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  address?: string;
  owner_id?: string;
  employee_id?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Pet {
  uuid: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight: number;
  symptoms?: string;
  ownerDocumentNumber?: string;
  owner_document_number?: string;
  ownerUuid?: string;
  owner_uuid?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Owner {
  uuid: string;
  documentType?: string;
  document_type?: string;
  documentNumber?: string;
  document_number?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
  createdAt?: string;
  pets?: Pet[];
}

export interface Appointment {
  uuid: string;
  pet_uuid?: string;
  petUuid?: string;
  owner_uuid?: string;
  ownerUuid?: string;
  scheduled_date?: string;
  scheduledDate?: string;
  service_type?: string;
  serviceType?: string;
  status: 'Programada' | 'Completada' | 'Cancelada' | string;
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Employee {
  uuid: string;
  name: string;
  role: string;
  specialty?: string;
  phone: string;
  email: string;
  schedule?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
}

export interface Product {
  uuid: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  cost_price?: number;
  costPrice?: number;
  stock: number;
  supplier?: string;
  image_url?: string;
  imageUrl?: string;
  is_commercial?: boolean;
  isCommercial?: boolean;
  created_at?: string;
}

export interface MedicalRecord {
  uuid: string;
  pet_uuid?: string;
  petUuid?: string;
  date: string;
  weight: number;
  diagnosis: string;
  treatment?: string;
  next_vaccine_date?: string | null;
  nextVaccineDate?: string | null;
  created_at?: string;
}

export interface StatsSummary {
  totalPets: number;
  totalOwners: number;
  speciesDistribution: Record<string, number>;
  averageAge: number;
  averageWeight: number;
  recentPets: Pet[];
}
