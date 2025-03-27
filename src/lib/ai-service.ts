export async function generateImagesFromPrompt(
  prompt: string,
): Promise<string[]> {
  try {
    // Validate prompt before sending
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Invalid prompt: must be a non-empty string');
    }

    console.log('Sending prompt:', prompt); // Debug log

    const response = await fetch('/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get error details
      throw new Error(
        `Failed to generate images: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    if (!data.images || !Array.isArray(data.images)) {
      throw new Error(
        'Invalid response: "images" field missing or not an array',
      );
    }

    return data.images; // Array of image URLs
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}
