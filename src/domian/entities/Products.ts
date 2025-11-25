export interface Product {
    id?: string;
    name: string;
    description: string;
    category: string;
    price: number;
    images?: string[] | null; 
    createdAt: Date;
    updatedAt: Date;
}