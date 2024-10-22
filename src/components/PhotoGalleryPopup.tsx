import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
}

interface PhotoGalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
}

export default function PhotoGalleryPopup({
  isOpen,
  onClose,
  photos,
}: PhotoGalleryPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='absolute z-[9999999] bg-white overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Photo Gallery</DialogTitle>
          <DialogDescription>
            View all the photos you've added to your design.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-md"
              >
                <Image
                  src={photo.url}
                  alt="Added photo"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
