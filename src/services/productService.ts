import apiClient from './apiClient';
import { Product } from '../types';

export const productService = {
    getAll: async (category?: string, engineId?: string) => {
        const params: any = {};
        if (category && category !== 'All') params.category = category;
        if (engineId) params.engineId = engineId;
        const res = await apiClient.get<Product[]>('/products', { params });
        return res.data;
    },

    getGarageCatalog: async (category?: string, engineId?: string) => {
        const params: any = {};
        if (category && category !== 'All') params.category = category;
        if (engineId) params.engineId = engineId;
        const res = await apiClient.get<Product[]>('/products/garage', { params });
        return res.data;
    },

    getById: async (id: string | number) => {
        const res = await apiClient.get<Product>(`/products/${id}`);
        return res.data;
    },

    create: async (data: FormData) => {
        const res = await apiClient.post<Product>('/products', data);
        return res.data;
    },

    update: async (id: number, data: any) => {
        const res = await apiClient.put(`/products/${id}`, data);
        return res.data;
    },

    delete: async (id: number) => {
        const res = await apiClient.delete(`/products/${id}`);
        return res.data;
    },

    toggleFlag: async (id: number, reason: string) => {
        const res = await apiClient.patch(`/products/${id}/flag`, { reason });
        return res.data;
    },

    getBulkStock: async (ids: string | number[]) => {
        const idsString = Array.isArray(ids) ? ids.join(',') : ids;
        const res = await apiClient.get<any[]>(`/products/bulk?ids=${idsString}`);
        return res.data;
    }
};
