import upload from '../utils/multer/index';

export const uploadImage = upload.single('image');
