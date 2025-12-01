import { Request, Response } from 'express';
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase,
    GetActiveOffersByProductIdUseCase,
    CalculateProductOfferUseCase
} from '@/application/use-cases/Offers/index';


export class OffersController {
    constructor(
        private createOfferUseCase: CreateOfferUseCase,
        private updateOfferUseCase: UpdateOfferUseCase,
        private deleteOfferUseCase: DeleteOfferUseCase,
        private getAllOffersUseCase: GetAllOffersUseCase,
        private getOfferByIdUseCase: GetOfferByIdUseCase,
        private getActiveOffersByProductIdUseCase: GetActiveOffersByProductIdUseCase,
        private calculateProductOfferUseCase: CalculateProductOfferUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const offerData = req.body;
            const result = await this.createOfferUseCase.execute(offerData);

            return res.status(201).json({
                success: true,
                data: result,
                message: 'Offer created successfully'
            });
        } catch (error: any) {
            console.error('Create Offer Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not create offer'
            });
        }
    }

  
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const offerData = req.body;

            const result = await this.updateOfferUseCase.execute(id, offerData);

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Offer updated successfully'
            });
        } catch (error: any) {
            console.error('Update Offer Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not update offer'
            });
        }
    }

  
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.deleteOfferUseCase.execute(id);

            return res.status(200).json({
                success: true,
                message: 'Offer deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete Offer Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not delete offer'
            });
        }
    }


    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllOffersUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get All Offers Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve offers'
            });
        }
    }

   
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.getOfferByIdUseCase.execute(id);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get Offer By ID Error:', error);
            return res.status(404).json({
                success: false,
                message: error.message || 'Offer not found'
            });
        }
    }

  
    async getActiveOffersByProductId(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const result = await this.getActiveOffersByProductIdUseCase.execute(productId);

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get Active Offers By Product ID Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not retrieve active offers'
            });
        }
    }

   
    async calculateOffer(req: Request, res: Response) {
        try {
            const { productId, price, quantity } = req.body;

            if (!productId || !price || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID, price, and quantity are required'
                });
            }

            const result = await this.calculateProductOfferUseCase.execute(
                productId,
                parseFloat(price),
                parseInt(quantity)
            );

            if (!result) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: 'No active offers available for this product'
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Offer calculated successfully'
            });
        } catch (error: any) {
            console.error('Calculate Offer Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not calculate offer'
            });
        }
    }
}
