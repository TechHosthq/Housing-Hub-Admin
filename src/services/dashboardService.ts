import apiClient from './apiClient';

export interface AdminDashboardStats {
    totalCustomers: number;
    totalOwners: number;
    totalAgents: number;
    pendingKyc: number;
    activeListings: number;
    totalProperties: number;
    pendingInspections: number;
    todaysInspections: number;
}

export interface AdminRecentActivity {
    type: string | null;
    description: string | null;
    occurredAt: string;
    relatedId: string | null;
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const dashboardService = {
    getStats: async (): Promise<AdminDashboardStats> => {
        const response = await apiClient.get('/api/AdminDashboard/stats');
        // API returns data directly or wrapped — handle both
        return response.data?.data ?? response.data;
    },

    getTodaysInspections: async (pageNumber = 1, pageSize = 10): Promise<PaginatedResult<any>> => {
        const response = await apiClient.get('/api/AdminDashboard/inspections/today', {
            params: { pageNumber, pageSize }
        });
        return response.data?.data ?? response.data;
    },

    getRecentActivity: async (count = 10): Promise<AdminRecentActivity[]> => {
        const response = await apiClient.get('/api/AdminDashboard/activity', {
            params: { count }
        });
        return response.data?.data ?? response.data;
    }
};

export default dashboardService;
