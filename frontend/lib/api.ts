// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function to get token (only works on client side)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("accessToken");
};

export async function apiRequest(endpoint: string, method: string = 'GET', data: any = null, token: string | null = null) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Use provided token or get from localStorage
  const authToken = token || getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for session auth
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`API request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

export const getUsers = async (): Promise<Array<{
  id: number;
  username: string;
  email: string;
  role: string;
}>> => {
  try {
    // Use consistent endpoint - choose one that works with your backend
    // Option 1: If your backend uses /api/auth/admin/users
    const response = await apiRequest('/admin/users');
    
    // Option 2: If your backend uses /api/admin/users (uncomment this and comment above)
    // const response = await apiRequest('/api/admin/users');
    
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/api/auth/me');
    return response;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Add function to refresh auth token
export const refreshAuthToken = async () => {
  try {
    const response = await apiRequest('/api/auth/refresh', 'POST');
    if (response.access) {
      localStorage.setItem('accessToken', response.access);
    }
    return response;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: number, newRole: string, currentRole: string) => {
  try {
    // Prevent role switching between student and company
    if ((currentRole === 'student' && newRole === 'company') || 
        (currentRole === 'company' && newRole === 'student')) {
      throw new Error('Cannot switch between student and company roles');
    }

    const response = await apiRequest(`/admin/users/${userId}/role/`, 'PATCH', { role: newRole });
    
    // If updating current user's role, refresh their session
    const currentUser = await getCurrentUser().catch(() => null);
    if (currentUser && currentUser.id.toString() === userId.toString()) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login?message=role-updated';
    }
    
    return response;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Add these to your existing lib/api.ts

export const verifyCompany = async (userId: string, verified: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${userId}/verify/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ verified }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update verification status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying company:', error);
    throw error;
  }
};

// Fixed deleteUser function - correct endpoint
export const deleteUser = async (userId: string) => {
  try {
    const response = await apiRequest(
      `/admin/users/${userId}/`, 
      'DELETE',
      null, // No body needed for DELETE
      localStorage.getItem('accessToken')
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete user');
    }
    
    return response;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};


export const getAnalytics = async () => {
  try {
    const response = await apiRequest('/admin/analytics/');
    return response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};


