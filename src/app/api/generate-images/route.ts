import { NextResponse } from 'next/server';

// Lưu mã thông báo trong biến môi trường
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN || 'your-token-here';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log('Nhận được gợi ý:', prompt);

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Gợi ý là bắt buộc và phải là chuỗi không rỗng' },
        { status: 400 },
      );
    }

    const generateImage = async (inputPrompt: string) => {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${HF_API_TOKEN}`,
          },
          body: JSON.stringify({
            inputs: inputPrompt,
            options: { wait_for_model: true },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi API Hugging Face: ${response.status} - ${errorText}`,
        );
      }

      // Lấy dữ liệu dạng buffer thay vì blob
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    };

    const base64 = await generateImage(prompt);
    let secondBase64 = '';
    try {
      const secondPrompt = `${prompt} (phong cách thay thế)`;
      secondBase64 = await generateImage(secondPrompt);
    } catch (err) {
      console.warn('Tạo ảnh thứ hai thất bại:', err);
    }

    // Trả về base64 với tiền tố data URI
    const images = [
      `data:image/png;base64,${base64}`,
      secondBase64 ? `data:image/png;base64,${secondBase64}` : '',
    ].filter(Boolean);

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Lỗi khi tạo ảnh:', error);
    return NextResponse.json(
      { error: 'Không thể tạo ảnh', details: error.message },
      { status: 500 },
    );
  }
}
