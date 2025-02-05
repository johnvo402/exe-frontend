'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import JSZip from 'jszip';
import { ConfigurationImage, CroppedImage, ImageUrl } from '@prisma/client';

interface DownloadButtonProps {
  croppedImg: CroppedImage[];
  stickImg: ImageUrl[];
  configImg: ConfigurationImage[];
  customName?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  croppedImg,
  stickImg,
  configImg,
  customName,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const downLoadImg = async () => {
    setIsLoading(true);
    toast({
      title: 'Downloading Images',
      description: 'Please wait while we download your images.',
    });

    try {
      await downloadCroppedImage();
      toast({
        title: 'Download Complete',
        description: 'Your images have been downloaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: 'Download Failed',
        description: 'An error occurred while downloading your images.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCroppedImage = async () => {
    const zip = new JSZip();

    try {
      if (!Array.isArray(croppedImg) || croppedImg.length === 0) {
        throw new Error('No cropped images available.');
      }

      await Promise.all(
        croppedImg.map(async (cropped) => {
          try {
            const response = await fetch(cropped.url);
            if (!response.ok) throw new Error('Failed to fetch image');
            const blob = await response.blob();
            zip.file(`${customName || 'images'}-${cropped.side}.png`, blob);
          } catch (err) {
            console.error(
              `Error fetching cropped image (${cropped.url}):`,
              err,
            );
          }
        }),
      );

      const configBlob = await downloadConfigZip();
      if (configBlob) {
        zip.file('config.zip', configBlob);
      }

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
      console.error('Error generating ZIP file:', error);
      throw error;
    }
  };

  const downloadConfigZip = async () => {
    const zip = new JSZip();

    try {
      if (!Array.isArray(configImg) || configImg.length === 0) {
        return null; // Không có ảnh config thì không tạo file
      }

      for (const config of configImg) {
        for (let index = 0; index < stickImg.length; index++) {
          const stick = stickImg[index];
          if (config.imageUrlId === stick.id) {
            try {
              const response = await fetch(stick.url);
              if (!response.ok) throw new Error('Failed to fetch image');
              const blob = await response.blob();
              zip.file(`${config.side}-${index}.png`, blob);
            } catch (err) {
              console.error(`Error fetching config image (${stick.url}):`, err);
            }
          }
        }
      }

      return await zip.generateAsync({ type: 'blob' });
    } catch (error) {
      console.error('Error generating config ZIP:', error);
      throw error;
    }
  };

  return (
    <Button disabled={isLoading} onClick={downLoadImg} variant="outline">
      {isLoading ? 'Downloading...' : 'Download Images'}
    </Button>
  );
};

export default DownloadButton;
