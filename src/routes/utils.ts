import express, { Request, Response } from 'express';
import { uploadImage } from '../middlewares/upload';
const router = express.Router();

router.post('/upload', uploadImage, (req: Request, res: Response) => {
  const imageUrl = req.file?.location;
  res.status(200).send(imageUrl);
});

export default router;
