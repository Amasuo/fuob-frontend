export interface User {
  id: number | null;
  firstname: string;
  lastname: string;
  full_name?: string;
  email: string;
  employee_number: string;
  is_active: boolean;
  hire_date: string;
  cycle_start_date: string;
  birth_date: string;
  is_admin: boolean;
  is_hr: boolean;
  is_validator: boolean;
  is_employee: boolean;
  is_simple: boolean;
  profile_image: string;
  language_id: number | null;
  language_code: string | null;
}

export interface UserPaginationParams {
  page?: number;
  search?: string;
  per_page?: number;
}
