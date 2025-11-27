import { FileStorageService } from '../services/UploadImageStorageService';

export function registerServices(container: any) {
    container.fileStorageService = new FileStorageService();
}
