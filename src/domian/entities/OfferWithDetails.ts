import { Offer } from './Offer';
import { Product } from './Products';
import { Category } from './Category';


export interface OfferWithDetails extends Offer {
    product: Product;
    category: Category;
}
