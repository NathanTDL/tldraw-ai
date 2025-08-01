import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini AI - you'll need to set GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory, images } = await request.json();
    
    // Get the Gemini 2.5 Flash model with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a comprehensive prompt that includes canvas context and image capabilities
    const systemPrompt = `You are a Canvas Assistant AI that helps users with their creative projects on a visual canvas. You have full awareness of what's currently on the canvas, can understand images, and can help generate images when requested.

Canvas Context:
${context || "No canvas context available."}

Capabilities:
- Analyze and understand uploaded images
- Generate creative suggestions based on visual content
- Help with image-based creative workflows
- Support text-to-image generation requests
- Provide contextual assistance based on both text and visual content

Instructions:
- Be helpful, creative, and contextually aware of the canvas content
- When users upload images, analyze them thoroughly and provide insights
- When users request image generation (phrases like "generate an image", "create an image", "draw", "make an image", etc.), respond with a special command format: [GENERATE_IMAGE:prompt_here]
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

    // Prepare content for Gemini (text + images if provided)
    let contentParts = [conversationText];
    
    // Add images to the request if provided
    if (images && images.length > 0) {
      for (const imageData of images) {
        contentParts.push({
          inlineData: {
            data: imageData.data, // Base64 encoded image data
            mimeType: imageData.mimeType || 'image/jpeg'
          }
        });
      }
    }

    // Generate response with multimodal content
    const result = await model.generateContent(contentParts);
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
