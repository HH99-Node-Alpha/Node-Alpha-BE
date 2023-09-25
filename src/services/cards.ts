import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Card 생성
export const createCard = async (data: {
  cardName: string;
  cardDescription: string;
  imageUrl?: string;
  cardColor?: string;
  worker?: string;
  cardOrder: number;
  dueDate: Date;
  ColumnId: number;
  colorId: number;
}) => {
  const card = await prisma.cards.create({
    data,
  });
  return card;
};

// Card 조회
export const getCardById = async (id: number) => {
  const card = await prisma.cards.findUnique({
    where: { cardId: id },
  });
  return card;
};

// Card 업데이트
export const updateCard = async (id: number, data: Partial<{
  cardName: string;
  cardDescription: string;
  imageUrl?: string;
  cardColor?: string;
  worker?: string;
  cardOrder: number;
  dueDate: Date;
  ColumnId: number;
  colorId: number;
}>) => {
  const card = await prisma.cards.update({
    where: { cardId: id },
    data,
  });
  return card;
};

// Card 삭제
export const deleteCard = async (id: number) => {
  const card = await prisma.cards.delete({
    where: { cardId: id },
  });
  return card;
};