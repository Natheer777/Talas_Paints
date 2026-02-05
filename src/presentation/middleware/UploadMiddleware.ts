import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

// Image file filter
const imageFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/x-citrix-pjpeg', 'image/png', 'image/webp'];

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

// Image upload configuration - UNLIMITED images allowed
export const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size per image
        // No file count limit - unlimited images allowed
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

// Unlimited images - removed the second parameter (file count limit)
export const uploadMultiple = upload.array('images');

export const uploadVideo = videoUpload.single('video');

// Combined media file filter (images and videos)
const mediaFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedImageMimeTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/x-citrix-pjpeg', 'image/png', 'image/webp'];
    const allowedVideoMimeTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
    ];

    const allAllowedMimeTypes = [...allowedImageMimeTypes, ...allowedVideoMimeTypes];

    if (allAllowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and MP4, MPEG, MOV, AVI, WEBM videos are allowed.'));
    }
};

// Combined media upload configuration
const mediaUpload = multer({
    storage: storage,
    fileFilter: mediaFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size (covers both images and videos)
        files: 1, // Maximum 1 media file
    },
});

export const uploadMedia = mediaUpload.single('media');

export const uploadQRCode = upload.single('qrCode');

export const uploadNone = upload.none();