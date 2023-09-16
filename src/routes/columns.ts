import express from 'express';
import ColumnsController from '../controllers/columns';
import ColumnsRepository from '../repositories/columns';
import ColumnsService from '../services/columns';

const router = express.Router({ mergeParams: true });

const columnsRepository = new ColumnsRepository();
const columnsService = new ColumnsService(columnsRepository);
const columnsController = new ColumnsController(columnsService);

router.get('/columns', columnsController.getAllColumns);
router.post('/columns', columnsController.createColumn);
router.put('/columns/:columnId', columnsController.updateColumn);
router.delete('/columns/:columnId', columnsController.deleteColumn);

export default router;
