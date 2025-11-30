export interface Product {
    id?: string;
    name: string;
    description: string;
    category_id: string;
    price: number;
    quantity: number;
    images?: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}