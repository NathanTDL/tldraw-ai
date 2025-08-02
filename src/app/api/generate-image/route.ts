import { NextRequest, NextResponse } from 'next/server';
import Together from 'together-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, steps = 10, n = 1, numberOfImages = 1 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if Together AI API key is available
    if (!process.env.TOGETHER_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not configured',
          message: 'TOGETHER_API_KEY environment variable is not set. Please add your Together AI API key to your .env file.'
        },
        { status: 500 }
      );
    }

    // Together AI FLUX model integration
    try {
      const together = new Together();

      console.log('Calling Together AI with prompt:', prompt);

      const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-krea-dev",
        prompt: prompt,
        steps: steps,
        n: Math.min(numberOfImages || n, 4) // Limit to 4 images max
      });

      console.log('Together AI response structure:', {
        hasData: !!response.data,
        dataLength: response.data?.length,
        firstItemKeys: response.data?.[0] ? Object.keys(response.data[0]) : 'no data'
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No images returned from Together AI');
      }

      const generatedImages = response.data.map((imageData, index) => {
        console.log(`Image ${index} full structure:`, imageData);
        console.log(`Image ${index} available keys:`, Object.keys(imageData));
        
        // Together AI might return different property names - check all possibilities
        const img: any = imageData as any;
        let base64Data = img.b64_json || 
                        img.image || 
                        img.data || 
                        img.base64 ||
                        img.url;
        
        // If we got a URL, we need to fetch and convert it
        if (!base64Data) {
          console.error(`Image ${index} - no base64 data found. Available properties:`, Object.keys(imageData));
          console.error(`Image ${index} - full object:`, JSON.stringify(imageData, null, 2));
          throw new Error(`Image ${index} does not contain base64 data or URL`);
        }
        
        // If it's a URL, fetch it server-side to avoid CORS issues
        if (typeof base64Data === 'string' && base64Data.startsWith('http')) {
          console.log(`Image ${index} is a URL, fetching server-side:`, base64Data);
          // We'll handle this after the map
          return {
            imageData: null,
            url: base64Data,
            index: index,
            needsConversion: true
          };
        }
        
        console.log(`Image ${index} base64 data type:`, typeof base64Data);
        console.log(`Image ${index} base64 length:`, base64Data?.length);
        
        return {
          imageData: base64Data,
          index: index
        };
      });

      // Handle URL conversions server-side to avoid CORS issues
      const finalImages = await Promise.all(
        generatedImages.map(async (img) => {
          if (img.needsConversion && img.url) {
            try {
              console.log(`Converting URL to base64 server-side: ${img.url}`);
              const imageResponse = await fetch(img.url);
              
              if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status}`);
              }
              
              const arrayBuffer = await imageResponse.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString('base64');
              
              console.log(`Converted image ${img.index} to base64, length: ${base64.length}`);
              
              return {
                imageData: base64,
                index: img.index
              };
            } catch (error) {
              console.error(`Failed to convert URL to base64 for image ${img.index}:`, error);
              throw new Error(`Failed to process image ${img.index}: ${(error as Error).message}`);
            }
          }
          return img;
        })
      );

      return NextResponse.json({
        success: true,
        images: finalImages,
        prompt: prompt
      });
    } catch (error) {
      console.error('Together AI error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image generation failed',
          message: `Together AI error: ${(error as Error).message || 'Unknown error'}`
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image generation error:', error as Error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Image generation failed',
        message: 'There was an error generating the image. Please try again.'
      },
      { status: 500 }
    );
  }
}
