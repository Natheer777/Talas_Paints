export interface IFileStorageService{
    UploadProductImage(
        file:Express.Multer.File,
        id: string,
        existingUrl?: string
    ):Promise<String>
    DeleteOldImage(fileUrl: string): Promise<void>;
}