export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  branch?: string;
  year?: string;
  college?: string;
  graduation_year?: number;
  target_role?: string;
  skills: string[];
  interests: string[];
  created_at?: string;
  updated_at?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  full_name?: string;
  college?: string;
  branch?: string;
  year?: string;
  graduation_year?: number;
  target_role?: string;
  skills?: string[];
  interests?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthData {
  token: string;
  user: UserProfile;
}
