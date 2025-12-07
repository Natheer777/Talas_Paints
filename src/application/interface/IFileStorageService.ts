export interface IFileStorageService {
    UploadProductImage(
        file: Express.Multer.File,
        id: string,
        folder: string
    ): Promise<string>;

    UploadMultipleProductImages(
        files: Express.Multer.File[],
        productId: string,
        folder: string
    ): Promise<string[]>;

    DeleteOldImage(fileUrl: string): Promise<void>;

    UploadVideo(
        file: Express.Multer.File,
        id: string,
        folder: string
    ): Promise<string>;

    DeleteOldVideo(fileUrl: string): Promise<void>;

    UploadQRCode(
        file: Express.Multer.File,
        paymentMethodId: string
    ): Promise<string>;

    DeleteOldQRCode(fileUrl: string): Promise<void>;
}