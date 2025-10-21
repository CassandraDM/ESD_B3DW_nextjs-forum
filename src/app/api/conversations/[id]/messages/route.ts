import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { conversationId: id, deletedAt: null },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(messages);
}
