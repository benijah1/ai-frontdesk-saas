import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from '@/lib/prisma'; // Make sure you have your prisma client exported
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, assistantId } = await req.json();

    // 1. Find the specific AI agent for this service page
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
    });

    if (!assistant) {
      return new NextResponse('Assistant not found', { status: 404 });
    }

    // 2. call OpenAI with the specific business context
    const result = await streamText({
      model: openai(assistant.model || 'gpt-4-turbo'),
      system: `
        You are a helpful support agent.
        
        YOUR KNOWLEDGE BASE:
        ${assistant.context}
        
        INSTRUCTIONS:
        - Only answer questions based on the knowledge base above.
        - If you don't know, say "I can connect you with a human agent."
        - Keep answers concise.
      `,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
