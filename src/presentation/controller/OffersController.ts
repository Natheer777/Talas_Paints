import { Request, Response } from 'express';
import {
    CreateOfferUseCase,
    UpdateOfferUseCase,
    DeleteOfferUseCase,
    GetAllOffersUseCase,
    GetOfferByIdUseCase,
    GetAllOffersWithDetailsPaginatedUseCase,
    GetVisibleOffersWithDetailsPaginatedUseCase,
    FilterOffersUseCase,
    FilterOffersPaginatedUseCase
} from '@/application/use-cases/Offers/index';
import Container from '../../infrastructure/di/container';


export class OffersController {
    constructor(
        private createOfferUseCase: CreateOfferUseCase,
        private updateOfferUseCase: UpdateOfferUseCase,
        private deleteOfferUseCase: DeleteOfferUseCase,
        private getAllOffersUseCase: GetAllOffersUseCase,
        private getOfferByIdUseCase: GetOfferByIdUseCase,
        private getAllOffersWithDetailsPaginatedUseCase: GetAllOffersWithDetailsPaginatedUseCase,
        private getVisibleOffersWithDetailsPaginatedUseCase: GetVisibleOffersWithDetailsPaginatedUseCase,
        private filterOffersUseCase: FilterOffersUseCase,
        private filterOffersPaginatedUseCase: FilterOffersPaginatedUseCase
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


    async getAllWithDetailsPaginated(req: Request, res: Response) {
        try {
            // Parse and validate pagination parameters
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            // Validate pagination parameters
            if (page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Page must be greater than 0'
                });
            }

            if (limit < 1 || limit > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit must be between 1 and 1000'
                });
            }

            const result = await this.getAllOffersWithDetailsPaginatedUseCase.execute({
                page,
                limit
            });

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            console.error('Get All Offers With Details Paginated Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve offers'
            });
        }
    }

    async getVisibleWithDetailsPaginated(req: Request, res: Response) {
        try {
            // Parse and validate pagination parameters
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            // Validate pagination parameters
            if (page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Page must be greater than 0'
                });
            }

            if (limit < 1 || limit > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit must be between 1 and 1000'
                });
            }

            const result = await this.getVisibleOffersWithDetailsPaginatedUseCase.execute({
                page,
                limit
            });

            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            console.error('Get Visible Offers With Details Paginated Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve visible offers'
            });
        }
    }


    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // Use the repository directly to get offer with full details
            const offerRepository = Container.getOfferRepository();
            const result = await offerRepository.getByIdWithDetails(id);

            if (!result) {
                throw new Error('Offer not found');
            }

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

    async filter(req: Request, res: Response) {
        try {
            const { categories, types, status, minPrice, maxPrice, sortOrder, page, limit } = req.query;

            const hasPagination = page !== undefined || limit !== undefined;

            const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
            const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

            if (hasPagination) {
                const pageNum = page ? parseInt(page as string, 10) : undefined;
                const limitNum = limit ? parseInt(limit as string, 10) : undefined;

                if (pageNum !== undefined && (isNaN(pageNum) || pageNum < 1)) {
                    return res.status(400).json({
                        success: false,
                        message: "Page must be a positive integer",
                    });
                }

                if (limitNum !== undefined && (isNaN(limitNum) || limitNum < 1 || limitNum > 1000)) {
                    return res.status(400).json({
                        success: false,
                        message: "Limit must be a positive integer between 1 and 1000",
                    });
                }

                const result = await this.filterOffersPaginatedUseCase.execute({
                    categories: categories ? (Array.isArray(categories) ? categories as string[] : [categories as string]) : undefined,
                    types: types ? (Array.isArray(types) ? types as string[] : [types as string]) : undefined,
                    minPrice: minPriceNum,
                    maxPrice: maxPriceNum,
                    status: status as string,
                    sortOrder: sortOrder as 'asc' | 'desc',
                    page: pageNum,
                    limit: limitNum
                });

                return res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        totalPages: result.totalPages,
                        hasNextPage: result.hasNextPage,
                        hasPrevPage: result.hasPrevPage
                    }
                });
            } else {
                const result = await this.filterOffersUseCase.execute({
                    categories: categories ? (Array.isArray(categories) ? categories as string[] : [categories as string]) : undefined,
                    types: types ? (Array.isArray(types) ? types as string[] : [types as string]) : undefined,
                    minPrice: minPriceNum,
                    maxPrice: maxPriceNum,
                    status: status as string,
                    sortOrder: sortOrder as 'asc' | 'desc'
                });

                return res.status(200).json({
                    success: true,
                    data: result,
                    count: result.length,
                });
            }
        } catch (error: any) {
            console.error('Filter Offers Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Could not filter offers",
            });
        }
    }
}

