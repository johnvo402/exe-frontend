'use client';

import React from 'react';
import { Button } from './ui/button';

interface DownloadButtonProps {
  imageUrl: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
  const downloadCroppedImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
    link.download = 'cropped-image.png';
    document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Button onClick={downloadCroppedImage} variant="outline">
      Download Image
    </Button>
  );
};

export default DownloadButton;
