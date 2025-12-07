import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

// Image file filter
const imageFileFilter = (
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

// Video file filter
const videoFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimeTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MPEG, MOV, AVI, and WEBM videos are allowed.'));
    }
};

// Image upload configuration
export const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10, // Maximum 10 files
    },
});

// Video upload configuration
export const videoUpload = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size for videos
        files: 1, // Maximum 1 video file
    },
});

export const uploadSingle = upload.single('image');

export const uploadMultiple = upload.array('images', 10);

export const uploadVideo = videoUpload.single('video');

export const uploadQRCode = upload.single('qrCode');

export const uploadNone = upload.none();