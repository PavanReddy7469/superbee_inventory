// Type definitions (kept for compatibility)
export type UserRole = 'superadmin' | 'admin' | 'technician';

export interface UserProfile {
  id: string;
  role_id: string;
  name: string;
  email: string;
  mobile_number?: string;
  employee_id: string;
  designation: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  role?: {
    name: UserRole;
    level: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  manufacturer: string;
  serial_number?: string;
  quantity: number;
  price: number;
  status: 'active' | 'inactive';
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface PartInvoice {
  id: string;
  part_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  created_at: string;
}

// Dummy supabase object for compatibility
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};
