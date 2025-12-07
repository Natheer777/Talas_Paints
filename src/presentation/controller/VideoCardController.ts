import { Request, Response } from 'express';
import {
    CreateVideoCardUseCase,
    UpdateVideoCardUseCase,
    DeleteVideoCardUseCase,
    GetAllVideoCardsUseCase,
    GetVideoCardByIdUseCase,
    GetVisibleVideoCardsUseCase
} from '@/application/use-cases/VideoCard/index';

/**
 * VideoCardController - Presentation Layer
 * Handles HTTP requests and responses for video card operations
 * Following Single Responsibility Principle - only handles request/response logic
 */
export class VideoCardController {
    constructor(
        private createVideoCardUseCase: CreateVideoCardUseCase,
        private updateVideoCardUseCase: UpdateVideoCardUseCase,
        private deleteVideoCardUseCase: DeleteVideoCardUseCase,
        private getAllVideoCardsUseCase: GetAllVideoCardsUseCase,
        private getVideoCardByIdUseCase: GetVideoCardByIdUseCase,
        private getVisibleVideoCardsUseCase: GetVisibleVideoCardsUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { title, status } = req.body;
            const videoFile = req.file as Express.Multer.File;

            if (!videoFile) {
                return res.status(400).json({
                    success: false,
                    message: 'ملف الفيديو مطلوب'
                });
            }

            const result = await this.createVideoCardUseCase.execute({
                title,
                status,
                videoFile
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: 'تم إنشاء بطاقة الفيديو بنجاح'
            });
        } catch (error: any) {
            console.error('Create Video Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'فشل إنشاء بطاقة الفيديو'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, status } = req.body;
            const videoFile = req.file as Express.Multer.File | undefined;

            const result = await this.updateVideoCardUseCase.execute(id, {
                title,
                status,
                videoFile
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'بطاقة الفيديو غير موجودة'
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
                message: 'تم تحديث بطاقة الفيديو بنجاح'
            });
        } catch (error: any) {
            console.error('Update Video Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'فشل تحديث بطاقة الفيديو'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.deleteVideoCardUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'بطاقة الفيديو غير موجودة'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'تم حذف بطاقة الفيديو بنجاح'
            });
        } catch (error: any) {
            console.error('Delete Video Card Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'فشل حذف بطاقة الفيديو'
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllVideoCardsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get All Video Cards Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'فشل استرجاع بطاقات الفيديو'
            });
        }
    }

    async getVisible(req: Request, res: Response) {
        try {
            const result = await this.getVisibleVideoCardsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get Visible Video Cards Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'فشل استرجاع بطاقات الفيديو المرئية'
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.getVideoCardByIdUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'بطاقة الفيديو غير موجودة'
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get Video Card By ID Error:', error);
            return res.status(404).json({
                success: false,
                message: error.message || 'بطاقة الفيديو غير موجودة'
            });
        }
    }
}
