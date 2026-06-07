// API Configuration and utilities
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private getHeaders(isFormData: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = this.getHeaders(isFormData);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string>),
        },
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}`,
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[v0] API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Auth API calls
export async function login(username: string, password: string) {
  try {
    const response = await apiClient.post('/api/auth/login/', {
      username,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function register(userData: {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  role: string;
  phone?: string;
}) {
  return apiClient.post('/api/users/register/', userData);
}

export async function logout() {
  apiClient.clearToken();
}

export async function getCurrentUser() {
  return apiClient.get('/api/users/me/');
}

// Agent API calls
export async function getAgents(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/agents/${query}`);
}

export async function getAgent(id: number) {
  return apiClient.get(`/api/agents/${id}/`);
}

export async function createAgent(data: unknown) {
  return apiClient.post('/api/agents/', data);
}

export async function updateAgent(id: number, data: unknown) {
  return apiClient.patch(`/api/agents/${id}/`, data);
}

export async function deleteAgent(id: number) {
  return apiClient.delete(`/api/agents/${id}/`);
}

export async function getAgentPerformance(id: number) {
  return apiClient.get(`/api/agents/${id}/performance/`);
}

export async function getAgentCommissions(id: number) {
  return apiClient.get(`/api/agents/${id}/commissions/`);
}

export async function getTopPerformers(limit: number = 10) {
  return apiClient.get(`/api/agents/top_performers/?limit=${limit}`);
}

// Customer API calls
export async function getCustomers(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/customers/${query}`);
}

export async function getCustomer(id: number) {
  return apiClient.get(`/api/customers/${id}/`);
}

export async function createCustomer(data: unknown) {
  return apiClient.post('/api/customers/', data);
}

export async function updateCustomer(id: number, data: unknown) {
  return apiClient.patch(`/api/customers/${id}/`, data);
}

export async function getInsuranceProducts(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/products/${query}`);
}

export async function getPolicies(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/policies/${query}`);
}

export async function getPolicy(id: number) {
  return apiClient.get(`/api/policies/${id}/`);
}

export async function createPolicy(data: unknown) {
  return apiClient.post('/api/policies/', data);
}

export async function getExpiringPolicies() {
  return apiClient.get('/api/policies/expiring_soon/');
}

// Claims API calls
export async function getClaims(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/claims/${query}`);
}

export async function getClaim(id: number) {
  return apiClient.get(`/api/claims/${id}/`);
}

export async function createClaim(data: unknown) {
  return apiClient.post('/api/claims/', data);
}

export async function getPendingClaims() {
  return apiClient.get('/api/claims/pending/');
}

// Invoice API calls
export async function getInvoices(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/invoices/${query}`);
}

export async function getOutstandingInvoices() {
  return apiClient.get('/api/invoices/outstanding/');
}

export async function getOverdueInvoices() {
  return apiClient.get('/api/invoices/overdue/');
}

// Financial reports
export async function getFinancialReports(params?: Record<string, unknown>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiClient.get(`/api/financial-reports/${query}`);
}
