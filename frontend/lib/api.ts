// lib/api.ts
import axios from 'axios';
import { Competition, Team } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login?message=session-expired';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function for API requests (unified approach)
export const apiRequest = async (endpoint: string, method: string = 'GET', data: any = null) => {
  try {
    const config: any = {
      method,
      url: `/api${endpoint}`,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    console.error(`API request failed: ${method} ${endpoint}`, error);
    throw new Error(error.response?.data?.message || error.response?.data?.detail || error.message);
  }
};



// User management API
export const getUsers = async (): Promise<Array<{
  id: number;
  username: string;
  email: string;
  role: string;
  company_profile?: {
    company_name: string;
    verified: boolean;
  };
}>> => {
  try {
    return await apiRequest('/auth/admin/users/');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await apiRequest('/auth/me/');
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const refreshAuthToken = async () => {
  try {
    const response = await apiRequest('/auth/refresh/', 'POST');
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
    if ((currentRole === 'student' && newRole === 'company') || 
        (currentRole === 'company' && newRole === 'student')) {
      throw new Error('Cannot switch between student and company roles');
    }

    const response = await apiRequest(`/auth/admin/users/${userId}/role/`, 'PATCH', { role: newRole });
    
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

export const verifyCompany = async (userId: string | number, verified: boolean) => {
  try {
    return await apiRequest(`/auth/admin/companies/${userId}/verify/`, 'PATCH', { verified });
  } catch (error) {
    console.error('Error verifying company:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string | number) => {
  try {
    return await apiRequest(`/auth/admin/users/${userId}/`, 'DELETE');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAnalytics = async () => {
  try {
    return await apiRequest('/auth/admin/analytics/');
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Competition API
export const competitionApi = {
  // Add to your competitionApi object
getUserTeams: async () => {
  try {
    const response = await apiClient.get('/api/teams/my-teams/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user teams:', error);
    throw error;
  }
},

getUserSubmissions: async () => {
  try {
    const response = await apiClient.get('/api/submissions/my-submissions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }
},
    getTeamInvitations: async (teamId: string) => {
    try {
      const response = await apiClient.get(`/api/teams/${teamId}/invitations/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      throw error;
    }
  },

  inviteToTeam: async (teamId: string, data: { username?: string, email?: string }) => {
  try {
    const response = await apiClient.post(`/api/teams/${teamId}/invite/`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       error.response?.data?.non_field_errors?.join(', ') ||
                       error.message ||
                       'Failed to send invitation';
    throw new Error(errorMessage);
  }
},

  acceptInvitation: async (token: string) => {
    try {
      const response = await apiClient.post(`/api/invitations/${token}/accept/`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  rejectInvitation: async (token: string) => {
    try {
      const response = await apiClient.post(`/api/invitations/${token}/reject/`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  },

  cancelInvitation: async (invitationId: string) => {
    try {
      const response = await apiClient.delete(`/api/invitations/${invitationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  },

  getUserById: async (userId: string) => {
  try {
    return await apiRequest(`/auth/users/${userId}/`);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
},
  getCompetitions: async (params?: any) => {
    try {
      return await apiRequest('/competitions/', 'GET');
    } catch (error) {
      console.error('Error fetching competitions:', error);
      throw error;
    }
  },
  
  getPendingCompetitions: async () => {
    try {
      return await apiRequest('/competitions/pending/');
    } catch (error) {
      console.error('Error fetching pending competitions:', error);
      // Return empty array if endpoint doesn't exist
      return [];
    }
  },
  
  getCompetition: async (id: string) => {
  try {
    const response = await apiClient.get(`/api/competitions/${id}/`);
    return {
      ...response.data,
      teams: response.data.teams || [], // Ensure teams is always an array
      prizes: response.data.prizes || {
        firstPrize: "",
        secondPrize: "",
        otherPrizes: [],
      },
    };
  } catch (error) {
    console.error('Error fetching competition:', error);
    throw error;
  }
},
  
  createCompetition: async (data: any) => {
    try {
      return await apiRequest('/competitions/', 'POST', data);
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  },
  
  updateCompetition: async (id: string, data: any) => {
    try {
      return await apiRequest(`/competitions/${id}/`, 'PUT', data);
    } catch (error) {
      console.error('Error updating competition:', error);
      throw error;
    }
  },
  
  approveCompetition: async (id: number | string) => {
    try {
      return await apiRequest(`/competitions/${id}/approve/`, 'POST');
    } catch (error) {
      console.error('Error approving competition:', error);
      throw error;
    }
  },
  
  rejectCompetition: async (id: number | string) => {
    try {
      return await apiRequest(`/competitions/${id}/reject/`, 'POST');
    } catch (error) {
      console.error('Error rejecting competition:', error);
      throw error;
    }
  },
  
  registerForCompetition: async (id: string, teamName?: string) => {
  try {
    const response = await apiClient.post(`/api/competitions/${id}/register/`, {
      team_name: teamName || `${new Date().toISOString().slice(0, 10)} Team`
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 
                       error.response?.data?.message ||
                       error.response?.data?.non_field_errors?.join(', ') ||
                       'Failed to register for competition';
    throw new Error(errorMessage);
  }
},
  
  getRegistrationStatus: async (id: string) => {
    try {
      return await apiRequest(`/competitions/${id}/my_status/`);
    } catch (error) {
      console.error('Error fetching registration status:', error);
      throw error;
    }
  },
  
  createTeam: async (competitionId: string, data: any) => {
    try {
      return await apiRequest(`/competitions/${competitionId}/teams/`, 'POST', data);
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },
  
  // Add these to your competitionApi object
createSubmission: async (formData: FormData) => {
  try {
    const response = await apiClient.post('/api/submissions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating submission:', error);
    throw error;
  }
},

getSubmissions: async (competitionId: string) => {
  try {
    const response = await apiClient.get(`/api/submissions/?competition=${competitionId}`);
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
},


updateSubmission: async (submissionId: string, data: any) => {
  try {
    const response = await apiClient.patch(`/api/submissions/${submissionId}/`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
},

  getInvitationDetails: async (token: string) => {
  try {
    const response = await apiClient.get(`/api/invitations/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invitation details:', error);
    throw error;
  }
},
};

// Legacy functions for backward compatibility
export const getCompetitions = async (params?: any) => {
  return competitionApi.getCompetitions(params);
};

export const approveCompetition = async (id: number) => {
  return competitionApi.approveCompetition(id);
};