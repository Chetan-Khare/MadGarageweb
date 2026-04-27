import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

export const useProducts = (isGarage: boolean, category: string, engineId?: string) => {
    return useQuery({
        queryKey: ['products', isGarage, category, engineId],
        queryFn: () => isGarage 
            ? productService.getGarageCatalog(category, engineId)
            : productService.getAll(category, engineId),
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000,    // 30 minutes
    });
};
