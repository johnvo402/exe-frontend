import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { prompt } = body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    // Generate simple SVG placeholders as base64 (no external file needed)
    const generatePlaceholderSVG = (text: string) => {
      const svg = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ccc"/>
          <text x="50%" y="50%" font-size="20" text-anchor="middle" fill="#000" dy=".3em">
            ${text}
          </text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };

    const placeholderImages = [
      generatePlaceholderSVG(prompt),
      generatePlaceholderSVG(`${prompt} (variation)`),
    ];

    return NextResponse.json({ images: placeholderImages });
  } catch (error: any) {
    console.error('Error generating placeholder images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images', details: error.message },
      { status: 500 },
    );
  }
}
