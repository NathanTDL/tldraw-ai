import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI - you'll need to set GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json();
    
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create a comprehensive prompt that includes canvas context
    const systemPrompt = `You are a Canvas Assistant AI that helps users with their creative projects on a visual canvas. You have full awareness of what's currently on the canvas and can provide contextual assistance.

Canvas Context:
${context || "No canvas context available."}

Instructions:
- Be helpful, creative, and contextually aware of the canvas content
- Provide specific suggestions based on what's currently on the canvas
- If the canvas is empty, suggest starting points
- Help with creative ideation, organization, and enhancement of visual content
- Keep responses concise but informative
- Be encouraging and supportive of the user's creative process

User Message: ${message}`;

    // Build conversation history if provided
    let conversationText = systemPrompt;
    if (conversationHistory && conversationHistory.length > 0) {
      conversationText += "\n\nPrevious conversation:\n";
      conversationHistory.forEach((msg: any) => {
        conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    // Generate response
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      message: text 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate AI response',
        message: "I'm having trouble connecting right now. Let me help you with your canvas in a moment!"
      },
      { status: 500 }
    );
  }
}
