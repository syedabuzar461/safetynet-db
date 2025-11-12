import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  role: 'admin' | 'volunteer' | 'public';
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data || [];
}

export async function hasRole(userId: string, role: 'admin' | 'volunteer' | 'public'): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some(r => r.role === role);
}
