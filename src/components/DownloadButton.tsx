'use client';

import React from 'react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface DownloadButtonProps {
  imageUrl: string[];
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
  // ... existing code ...
  const downloadCroppedImage = async () => {
    try {
      imageUrl.forEach(async (url, index) => {
        // Changed map to forEach
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob); // Renamed variable to avoid shadowing

        const link = document.createElement('a');
        link.href = objectUrl; // Updated to use the correct variable
        link.download = `cropped-image-${index}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(objectUrl); // Updated to use the correct variable
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'There was a problem downloading your image, please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={downloadCroppedImage} variant="outline">
      Download Image
    </Button>
  );
};

export default DownloadButton;
