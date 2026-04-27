export interface Product {
    id: number;
    partName: string;
    brand: string;
    category: string;
    price: number;
    description?: string;
    imageUrl?: string;
    stockQuantity: number;
    condition: string;
    rating: number;
    sku?: string;
    imageUrls?: string[];
    flagged?: boolean;
    flagReason?: string;
    sellerResponse?: string;
    wholesale?: boolean;
    // Garage specific fields
    garagePrice?: number;
    originalPrice?: number;
    // Additional fields from backend
    fitmentCategory?: string;
    color?: string;
    isManualRating?: boolean;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SELLER' | 'ROLE_GARAGE';
    fullName?: string;
    phoneNumber?: string;
}
