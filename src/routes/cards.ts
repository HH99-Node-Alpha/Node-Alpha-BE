import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createCard, getCardById, updateCard, deleteCard } from '../services/cards';


const prisma = new PrismaClient();
const router = express.Router();

// 카드 생성 
router.post('/cards', async (req, res) => {
  const card = await createCard(req.body);
  res.json(card);
});

// 카드 ID로 조회 
router.get('/cards/:id', async (req, res) => {
  const card = await getCardById(parseInt(req.params.id, 10));
  res.json(card);
});

// 카드 업데이트 
router.put('/cards/:id', async (req, res) => {
  const card = await updateCard(parseInt(req.params.id, 10), req.body);
  res.json(card);
});

// 카드 삭제 
router.delete('/cards/:id', async (req, res) => {
  const card = await deleteCard(parseInt(req.params.id, 10));
  res.json(card);
});