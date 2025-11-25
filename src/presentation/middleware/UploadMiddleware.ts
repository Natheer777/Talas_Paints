import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10, // Maximum 10 files
    },
});

// Middleware for single image upload
export const uploadSingle = upload.single('image');

// Middleware for multiple image uploads
export const uploadMultiple = upload.array('images', 10);
