'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import JSZip from 'jszip';

interface DownloadButtonProps {
  imageUrl: string[];
  customName?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  imageUrl,
  customName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const downloadCroppedImage = async () => {
    setIsLoading(true);
    toast({
      title: 'Downloading Images',
      description: 'Please wait while we download your images.',
    });
    const zip = new JSZip();
    try {
      await Promise.all(
        imageUrl.map(async (url, index) => {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(`${customName || 'images'}-${index}.png`, blob);
        }),
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const objectUrl = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${customName || 'images'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'There was a problem downloading your images, please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={isLoading}
      onClick={downloadCroppedImage}
      variant="outline"
    >
      {isLoading ? 'Downloading...' : 'Download Images'}
    </Button>
  );
};

export default DownloadButton;
