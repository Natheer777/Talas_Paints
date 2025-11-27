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
}