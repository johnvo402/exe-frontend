'use client';

import HandleComponent from '@/components/HandleComponent';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
// import PhotoGalleryPopup from '@/components/PhotoGalleryPopup';
import { cn, formatPrice } from '@/lib/utils';
import NextImage from 'next/image';
import { Rnd } from 'react-rnd';
import { RadioGroup } from '@headlessui/react';
import { useRef, useState, useEffect } from 'react';
import { COLORS, getTailwindColor, MODELS } from '@/validators/option-validator';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ChevronsUpDown } from 'lucide-react';
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
// import { useUploadThing } from "@/lib/uploadthing";
import { toast, useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createConfig as _createConfig, CreateConfigArgs } from './actions';
import { useRouter } from 'next/navigation';
import Dropzone, { FileRejection } from 'react-dropzone';
import { uploadFiles, useUploadThing } from '@/lib/uploadthing';
import { v4 as uuidv4 } from 'uuid';
import { ShirtSide } from '@prisma/client';
import LoadingSpinner from '@/components/LoadingSpinner';

//định nghĩa kiểu dữ liệu cho images
export interface DesignConfigurator {
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  side: ShirtSide;
}
interface CroppedImage {
  side: string;
  url: string;
}

const DesignConfigurator = () => {
  //state để lưu trữ các hình ảnh
  const [currentSide, setCurrentSide] = useState<ShirtSide>('front');
  const [images, setImages] = useState<Record<ShirtSide, DesignConfigurator[]>>(
    {
      front: [],
      back: [],
      left: [],
      right: [],
    },
  );
  const [croppedImages, setCroppedImages] = useState<
    Record<ShirtSide, CroppedImage[]>
  >({
    front: [],
    back: [],
    left: [],
    right: [],
  });
  const { toast } = useToast();
  const router = useRouter();
  //state để kiểm tra việc kéo thả hình ảnh
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  //state để kiểm tra việc nhấn phím shift
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const { startUpload } = useUploadThing('imageUploader');

  useEffect(() => {
    const saveConfig = async () => {
      await saveConfiguration();
    };
    saveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);
  useEffect(() => {
    const saveConfig = async () => {
      await saveConfiguration();
    };
    saveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    //hàm kiểm tra việc nhấn phím shift
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    //thêm các sự kiện khi nhấn phím
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    //xóa các sự kiện khi component bị unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  //hàm xử lý khi file không được chấp nhận
  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);
    toast({
      title: `${file.file.type} type is not supported.`,
      description: 'Please choose a PNG, JPG, or JPEG image instead.',
      variant: 'destructive',
    });
  };
  //hàm thêm hình ảnh
  const addImage = (newImages: DesignConfigurator[]) => {
    setImages((prevImages) => ({
      ...prevImages,
      [currentSide]: [...prevImages[currentSide], ...newImages],
    }));
  };

  //hàm xử lý khi file được chấp nhn
  const onDropAccepted = async (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        addImage([
          {
            url: img.src,
            width: Math.min(img.width, 120),
            height: Math.min(img.height, 120),
            x: 380,
            y: 380,
            id: uuidv4(),
            side: currentSide,
          },
        ]);
      };
    });
    setIsDragOver(false);
  };

  //hàm xử lý khi tạo cấu hình
  const { mutate: createConfig, isPending } = useMutation({
    mutationKey: ['create-config'],
    mutationFn: async () => {
      try {
        const sides: ShirtSide[] = ['front', 'back', 'left', 'right'];
        const args: CreateConfigArgs = {
          color: options.color.value,
          model: options.model.value,
          imageUrls: [],
          croppedImages: [],
        };

        for (const side of sides) {
          // Remove validation for presence of images and cropped images

          // 1. Upload cropped images and get their URLs for each side
          const uploadedCroppedUrls = await uploadCroppedImages(side);

          // 2. Update args with uploaded cropped image URLs for each side
          args.croppedImages.push(
            ...uploadedCroppedUrls.map((url, index) => ({
              side: croppedImages[side][index].side as ShirtSide,
              url,
            })),
          );
          if (images[side].length !== 0) {
            // 3. Upload images and get their URLs for each side
            const uploadedImagesUrls = await uploadImages(images[side]);

            // 4. Update args with uploaded image URLs for each side
            args.imageUrls.push(
              ...uploadedImagesUrls.map((url, index) => ({
                url,
                width: images[side][index].width,
                height: images[side][index].height,
                side: images[side][index].side,
              })),
            );
          }
        }

        // 5. Create configuration in the database
        const id = await _createConfig(args);
        return id;
      } catch (error) {
        toast({
          title: 'Lỗi cấu hình',
          description: 'There was an error on our end. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Lỗi cấu hình',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (id) => {
      router.push(`/configure/preview?configId=${id}`);
    },
  });

  // Modify uploadCroppedImages to accept a side parameter
  const uploadCroppedImages = async (side: ShirtSide) => {
    try {
      const uploadedUrls = await Promise.all(
        croppedImages[side].map(async (uploadedImage: CroppedImage) => {
          const response = await fetch(uploadedImage.url);
          const blob = await response.blob();
          const file = new File([blob], 'image.png', { type: blob.type });

          const uploadResponse = await startUpload([file]);
          if (!uploadResponse || !uploadResponse[0]?.url) {
            throw new Error('Failed to upload image');
          }

          const { url } = uploadResponse[0];
          return url;
        }),
      );

      return uploadedUrls; // Return the uploaded URLs
    } catch (error) {
      toast({
        title: 'Upload Error',
        description:
          'There was an error uploading your images. Please try again.',
        variant: 'destructive',
      });
      return []; // Return an empty array on error
    }
  };

  // Modify uploadImages to accept a side parameter
  const uploadImages = async (images: DesignConfigurator[]) => {
    try {
      const uploadedUrls = await Promise.all(
        images.map(async (uploadedImage) => {
          const response = await fetch(uploadedImage.url);
          const blob = await response.blob();
          const file = new File(
            [blob],
            new Date().getTime() + '-' + uploadedImage.side + '.png',
            {
              type: blob.type,
            },
          );

          const uploadResponse = await startUpload([file]); 
          if (!uploadResponse || !uploadResponse[0]?.url) {
            throw new Error('Failed to upload image');
          }

          const { url } = uploadResponse[0];
          return url;
        }),
      );

      return uploadedUrls; // Return the uploaded URLs
    } catch (error) {
      toast({
        title: 'Upload Error',
        description:
          'There was an error uploading your images. Please try again.',
        variant: 'destructive',
      });
      return []; // Return an empty array on error
    }
  };

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  //state để lưu trữ các tùy chọn
  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
  });

  //ref để lưu trữ tham chiếu đến phần tử của hộp cầu áo
  const tShirtCaseRef = useRef<HTMLDivElement>(null);
  //ref để lưu trữ tham chiếu đến phần tử chứa các hình ảnh
  const containerRef = useRef<HTMLDivElement>(null);

  //hàm lưu trữ cấu hình
  async function saveConfiguration() {
    try {
      const sides: ShirtSide[] = ['front', 'back', 'left', 'right'];

      for (const side of sides) {
        const {
          left: caseLeft,
          top: caseTop,
          width: caseWidth,
          height: caseHeight,
        } = tShirtCaseRef.current!.getBoundingClientRect();

        const { left: containerLeft, top: containerTop } =
          containerRef.current!.getBoundingClientRect();

        const leftOffset = caseLeft - containerLeft;
        const topOffset = caseTop - containerTop;

        const canvas = document.createElement('canvas');
        canvas.width = caseWidth;
        canvas.height = caseHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = getTailwindColor(options.color.tw);
          ctx.fillRect(0, 0, caseWidth, caseHeight);
        }
        if (images[side].length !== 0) {
          for (let i = 0; i < images[side].length; i++) {
            const image = images[side][i];

            const userImage = new Image();
            userImage.crossOrigin = 'anonymous';
            userImage.src = image.url;
            await new Promise((resolve) => (userImage.onload = resolve));

            ctx?.drawImage(
              userImage,
              image.x - leftOffset,
              image.y - topOffset,
              image.width,
              image.height,
            );
          }
        }
        const backgroundImage = new Image();
        backgroundImage.crossOrigin = 'anonymous';
        backgroundImage.src = `/template/template-bg-${side}-${options.model.value}.png`;
        await new Promise((resolve) => (backgroundImage.onload = resolve));

        ctx?.drawImage(backgroundImage, 0, 0, caseWidth, caseHeight);

        const base64 = canvas.toDataURL();
        const base64Data = base64.split(',')[1];

        const blob = base64ToBlob(base64Data, 'image/png');
        const blobUrl = URL.createObjectURL(blob);
        setCroppedImages((prevCroppedImages) => ({
          ...prevCroppedImages,
          [side]: [{ side, url: blobUrl }],
        }));
      }
    } catch (err) {
      toast({
        description:
          'There was a problem saving your config, please try again.',
        variant: 'destructive',
      });
    }
  }
  const handleSideChange = (side: ShirtSide) => {
    setCurrentSide(side);
  };

  return isPending ? (
    <LoadingSpinner />
  ) : (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-4 mb-20 pb-20">
      <Dropzone
        onDropRejected={onDropRejected}
        onDropAccepted={onDropAccepted}
        accept={{
          'image/png': ['.png'],
          'image/jpeg': ['.jpeg'],
          'image/jpg': ['.jpg'],
        }}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        noClick
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            ref={containerRef}
            className="relative overflow-hidden col-span-3 w-full max-w-5xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <input {...getInputProps()} />
            <div
              className="relative bg-opacity-50 pointer-events-none aspect-[2000/2000]"
              style={{ width: '100%' }}
            >
              <AspectRatio
                ref={tShirtCaseRef}
                ratio={2000 / 2000}
                className="pointer-events-none relative z-50 aspect-[2000/2000] w-full"
              >
                <NextImage
                  fill
                  alt="T-shirt image"
                  src={`/template/template-bg-${currentSide}-${options.model.value}.png`}
                  className="pointer-events-none z-50 select-none"
                  loading="lazy"
                />
              </AspectRatio>

              <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
              <div
                className={cn(
                  'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]',
                  `bg-${options.color.tw}`,
                )}
              />
              {isPending && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                  <p className="text-white text-lg">Saving...</p>
                </div>
              )}
            </div>
            {images[currentSide].map(
              ({ url, width, height, id, x, y }, index) => (
                <Rnd
                  key={id} // Use the unique id as the key
                  default={{
                    x,
                    y,
                    height,
                    width,
                  }}
                  // maxWidth={120}
                  // maxHeight={120}
                  onResizeStop={(_, __, ref, ___, { x, y }) => {
                    const newHeight = parseInt(ref.style.height.slice(0, -2));

                    const newWidth = parseInt(ref.style.width.slice(0, -2));

                    setImages((prev) => {
                      return {
                        ...prev,
                        [currentSide]: prev[currentSide].map((pos, i) =>
                          i === index
                            ? {
                                ...pos,
                                x,
                                y,
                                width: newWidth,
                                height: newHeight,
                              }
                            : pos,
                        ),
                      };
                    });
                  }}
                  onDragStop={(_, data) => {
                    const { x, y } = data;
                    setImages((prev) => ({
                      ...prev,
                      [currentSide]: prev[currentSide].map((pos) =>
                        pos.id === id ? { ...pos, x, y } : pos,
                      ),
                    }));
                  }}
                  className="absolute z-20 border-none"
                  lockAspectRatio={isShiftPressed}
                  resizeHandleComponent={{
                    topRight: (
                      <>
                        <button
                          onClick={() => {
                            setImages((prevImages) => ({
                              ...prevImages,
                              [currentSide]: prevImages[currentSide].filter(
                                (_, i) => i !== index,
                              ),
                            }));
                          }}
                          className="absolute -top-5 -right-5 text-black p-1 rounded-full"
                        >
                          X
                        </button>
                      </>
                    ),
                  }}
                >
                  <div className="relative w-full h-full">
                    <NextImage
                      key={id}
                      src={url}
                      fill
                      alt="your image"
                      className="pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                </Rnd>
              ),
            )}
          </div>
        )}
      </Dropzone>

      <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          <div
            aria-hidden="true"
            className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"
          />
          <div className="px-8 pb-12 pt-8">
            <h2 className="tracking-tight font-bold text-3xl">Customize</h2>

            <div className="w-full h-px bg-zinc-200 my-6" />
            <div className="flex justify-center items-center mt-4">
              <Button
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/png, image/jpeg, image/jpg';
                  fileInput.multiple = true;
                  fileInput.click();
                  fileInput.addEventListener('change', (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      Array.from(files).forEach((file) => {
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        img.onload = async () => {
                          addImage([
                            {
                              url: img.src,
                              width: Math.min(img.width, 120),
                              height: Math.min(img.height, 120),
                              x: 380,
                              y: 380,
                              id: uuidv4(),
                              side: currentSide,
                            },
                          ]);
                        };
                      });
                    }
                  });
                }}
              >
                Upload File
              </Button>
              {/* {isUploading && (
                <div className="ml-4">
                  <progress
                    value={uploadProgress}
                    max="100"
                    className="w-24 h-2 bg-gray-200 rounded-full"
                  >
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </progress>
                </div>
              )} */}
            </div>
            <div className="relative mt-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val,
                    }));
                  }}
                  aria-label="Color selection" // Add accessible name
                >
                  <Label>Color: {options.color.label}</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {COLORS.map((color) => (
                      <RadioGroup.Option
                        key={color.label}
                        value={color}
                        className={({ active, checked }) =>
                          cn(
                            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
                            {
                              'border-black': active || checked,
                            },
                          )
                        }
                        aria-label={`Select ${color.label} color`} // Add accessible name
                      >
                        <span
                          className={cn(
                            `bg-${color.tw}`,
                            'h-8 w-8 rounded-full border border-black border-opacity-10',
                          )}
                        />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>

                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Model</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        aria-label="Model selection" // Add accessible name
                      >
                        {options.model.label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {MODELS.options.map((model) => (
                        <DropdownMenuItem
                          key={model.label}
                          className={cn(
                            'flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100',
                            {
                              'bg-zinc-100':
                                model.label === options.model.label,
                            },
                          )}
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, model }));
                          }}
                          aria-label={`Select ${model.label} model`} // Add accessible name
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              model.label === options.model.label
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Side</Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {['front', 'back', 'left', 'right'].map((side) => (
                      <NextImage
                        key={side}
                        onClick={() => handleSideChange(side as ShirtSide)}
                        className={cn(
                          'cursor-pointer',
                          currentSide === side ? 'border-2 border-primary' : '',
                        )}
                        src={`/template/template-bg-${side}-${options.model.value}.png`}
                        alt={side}
                        width={50}
                        height={50}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="mt-4">
              <Button onClick={() => setIsPhotoGalleryOpen(true)}>
                View Added Photos
              </Button>
            </div> */}
          </div>
        </ScrollArea>

        <div className="w-full px-8 h-16 bg-white">
          <div className="h-px w-full bg-zinc-200" />
          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <p className="font-medium whitespace-nowrap">
                {formatPrice(
                  BASE_PRICE + PRODUCT_PRICES.model[options.model.value],
                )}
              </p>
              <Button
                isLoading={isPending}
                disabled={isPending}
                loadingText="Saving"
                onClick={() => createConfig()}
                size="sm"
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* <PhotoGalleryPopup
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        photos={images}
      /> */}
    </div>
  );
};

export default DesignConfigurator;
