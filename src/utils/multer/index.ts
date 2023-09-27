import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';

const s3 = new S3Client({
  region: 'ap-northeast-2',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'mys3image',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const originalName = Buffer.from(file.originalname, 'binary').toString(
        'utf-8',
      );
      const ext = path.extname(originalName);

      cb(null, `${Date.now()}_${path.basename(originalName, ext)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
