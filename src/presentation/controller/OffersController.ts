import { Request, Response } from 'express';
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase
} from '@/application/use-cases/Offers/index';


export class OffersController {
    constructor(
        private createOfferUseCase: CreateOfferUseCase,
        private updateOfferUseCase: UpdateOfferUseCase,
        private deleteOfferUseCase: DeleteOfferUseCase,
        private getAllOffersUseCase: GetAllOffersUseCase,
        private getOfferByIdUseCase: GetOfferByIdUseCase
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

}
