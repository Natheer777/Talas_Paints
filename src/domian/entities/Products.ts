export interface Product {
    id?: string;
    name: string;
    description: string;
    category: string;
    price: number;
    images?: string[]; // Supports multiple image URLs
}