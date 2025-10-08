import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE = '/callingitnow-backend';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  user_id: number;
  email: string;
  handle: string;
  login_type: 'password' | 'google';
  wisdom_level: number;
  created_at: string;
}

export interface UserProfile extends User {
  prediction_count: number;
  backing_count: number;
}

export interface Prediction {
  prediction_id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  visibility: 'public' | 'private';
  allow_backing: boolean;
  timestamp: string;
  hash: string;
  user: User;
  vote_score: number;
  backing_count: number;
  comment_count: number;
  user_vote?: number;
  user_backed: boolean;
}

export interface ListPredictionsParams {
  category?: string;
  sort?: 'recent' | 'popular' | 'controversial';
  page?: number;
  per_page?: number;
  user_id?: number;
  safe_search?: boolean;
}

export interface PredictionListResponse {
  predictions: Prediction[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreatePredictionData {
  title: string;
  content: string;
  category: string;
  visibility: 'public' | 'private';
  allow_backing: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  handle: string;
  password: string;
  login_type: 'password';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PredictionReceipt {
  prediction_id: number;
  title: string;
  content: string;
  user_handle: string;
  timestamp: string;
  hash: string;
  verification_url: string;
}

// Auth API
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Predictions API
export const predictionsAPI = {
  create: async (data: CreatePredictionData): Promise<Prediction> => {
    const response = await api.post('/predictions', data);
    return response.data;
  },

  /**
   * Fetches a list of predictions. Supports filtering and pagination.
   */
  list: (params?: ListPredictionsParams): Promise<PredictionListResponse> => {
    return api.get('/predictions', { params }).then(res => res.data);
  },

  /**
   * Fetches the predictions for the currently authenticated user.
   */
  listMy: (): Promise<PredictionListResponse> => {
    return api.get('/predictions/my').then(res => res.data);
  },

  /**
   * Fetches a single prediction by its ID.
   */
  get: (id: number): Promise<Prediction> => {
    return api.get(`/predictions/${id}`).then(res => res.data);
  },

  vote: async (id: number, value: number): Promise<void> => {
    await api.post(`/predictions/${id}/vote`, { value });
  },

  back: async (id: number): Promise<void> => {
    await api.post(`/predictions/${id}/back`);
  },

  getReceipt: async (id: number): Promise<PredictionReceipt> => {
    const response = await api.get(`/predictions/${id}/receipt`);
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  Cookies.set('access_token', token, { expires: 7 }); // 7 days
};

export const removeAuthToken = () => {
  Cookies.remove('access_token');
};

export const getAuthToken = () => {
  return Cookies.get('access_token');
};

export interface Comment {
  comment_id: number;
  prediction_id: number;
  user: User;
  parent_comment_id: number | null;
  content: string;
  timestamp: string;
  votes: any[]; // Simplified for now
  vote_score: number;
  user_vote?: number | null;
  replies: Comment[];
}

export default api;