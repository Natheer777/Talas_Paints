export enum ProductStatus {
    VISIBLE = 'visible',
    HIDDEN = 'hidden'
}

export interface ProductSize {
    size: string;
    price: number;
}

export interface Product {
    id?: string;
    name: string;
    description: string;
    category_id: string;
    colors?: string[];
    sizes: ProductSize[];
    status: ProductStatus;
    images?: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}