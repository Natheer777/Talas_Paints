import { Request, Response } from 'express';
import {
    CreateAdsCardUseCase,
    UpdateAdsCardUseCase,
    DeleteAdsCardUseCase,
    GetAllAdsCardsUseCase,
    GetAdsCardByIdUseCase,
    GetActiveAdsCardsUseCase
} from '@/application/use-cases/AdsCard/index';

export class AdsCardController {
    constructor(
        private createAdsCardUseCase: CreateAdsCardUseCase,
        private updateAdsCardUseCase: UpdateAdsCardUseCase,
        private deleteAdsCardUseCase: DeleteAdsCardUseCase,
        private getAllAdsCardsUseCase: GetAllAdsCardsUseCase,
        private getAdsCardByIdUseCase: GetAdsCardByIdUseCase,
        private getActiveAdsCardsUseCase: GetActiveAdsCardsUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { title, text, status } = req.body;
            const imageFile = req.file as Express.Multer.File;

            if (!imageFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Image file is required'
                });
            }

            const result = await this.createAdsCardUseCase.execute({
                title,
                text,
                status,
                imageFile
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: 'Ads card created successfully'
            });
        } catch (error: any) {
            console.error('Create Ads Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not create ads card'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, text, status } = req.body;
            const imageFile = req.file as Express.Multer.File | undefined;

            const result = await this.updateAdsCardUseCase.execute(id, {
                title,
                text,
                status,
                imageFile
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Ads card not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Ads card updated successfully'
            });
        } catch (error: any) {
            console.error('Update Ads Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not update ads card'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.deleteAdsCardUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Ads card not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Ads card deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete Ads Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not delete ads card'
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllAdsCardsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get All Ads Cards Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve ads cards'
            });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const result = await this.getActiveAdsCardsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get Active Ads Cards Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve active ads cards'
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.getAdsCardByIdUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Ads card not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get Ads Card By ID Error:', error);
            return res.status(404).json({
                success: false,
                message: error.message || 'Ads card not found'
            });
        }
    }
}

