import { Offer } from './Offer';
import { Product } from './Products';
import { Category } from './Category';

export interface ProductWithCategory extends Omit<Product, 'category_id'> {
    category: Category;
}

export interface OfferWithDetails extends Offer {
    product: ProductWithCategory;
}
