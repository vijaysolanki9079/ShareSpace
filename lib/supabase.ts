import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User operations
export const userOperations = {
  async createUser(email: string, password: string, fullName: string) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    return response.json();
  },

  async getUserByEmail() {
    const response = await fetch(`/api/auth/verify-session`);
    return response.json();
  },

  async updateUser(userId: string, data: Record<string, unknown>) {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// NGO operations
export const ngoOperations = {
  async createNGO(formData: FormData) {
    const response = await fetch('/api/auth/ngo-signup', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async getNGOByEmail() {
    const response = await fetch(`/api/ngo/verify`);
    return response.json();
  },

  async updateNGO(ngoId: string, data: Record<string, unknown>) {
    const response = await fetch(`/api/ngo/${ngoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
