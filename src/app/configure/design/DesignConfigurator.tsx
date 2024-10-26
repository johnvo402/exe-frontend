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
import { COLORS, MODELS } from '@/validators/option-validator';
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

//định nghĩa kiểu dữ liệu cho images
interface DesignConfigurator {
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  id: string;
  side: ShirtSide;
}
interface UploadedImage {
  url: string;
}
interface CroppedImage {
  side: string;
  url: string;
}

const DesignConfigurator = () => {
  //state để lưu trữ các hình ảnh
  const [images, setImages] = useState<DesignConfigurator[]>([]);
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  //state để kiểm tra việc kéo thả hình ảnh
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  //state để kiểm tra việc nhấn phím shift
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const { startUpload } = useUploadThing('imageUploader');

  useEffect(() => {
    if (!isDragging) {
      saveConfiguration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);
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
    setImages((prev) => [
      ...prev,
      ...newImages.map((image) => ({ ...image, id: uuidv4() })), // Add unique id
    ]);
  };

  //hàm xử lý khi file được chấp nh��n
  const onDropAccepted = async (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        addImage([
          {
            url: img.src,
            width: img.width,
            height: img.height,
            x: 200,
            y: 205,
            id: uuidv4(),
            side: 'front',
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
        const args: CreateConfigArgs = {
          color: options.color.value,
          model: options.model.value,
          imageUrls: [],
          croppedImages: [],
        };

        // Validate presence of images and cropped images
        if (!croppedImages.length) {
          throw new Error('Custom image not found in localStorage.');
        }
        if (!images.length) {
          throw new Error('Custom image not found in localStorage.');
        }

        // 1. Upload cropped images and get their URLs
        const uploadedUrls = await uploadCroppedImages(croppedImages);
        if (uploadedUrls.length === 0) {
          throw new Error('No images were uploaded successfully.');
        }

        // 2. Update args with uploaded cropped image URLs
        args.croppedImages = uploadedUrls.map((url, index) => ({
          side: croppedImages[index].side as ShirtSide,
          url,
        }));

        // 3. Upload images and get their URLs
        const uploadedImagesUrls = await uploadImages(images);
        if (uploadedImagesUrls.length === 0) {
          throw new Error('No images were uploaded successfully.');
        }

        // 4. Update args with uploaded image URLs
        args.imageUrls = uploadedImagesUrls.map((url, index) => ({
          url,
          width: images[index].width,
          height: images[index].height,
          side: images[index].side,
        }));

        // 5. Create configuration in the database
        const id = await _createConfig(args);
        return id;
      } catch (error) {
        throw error; // Re-throw to trigger onError
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
      router.push(`/configure/preview?id=${id}`);
    },
  });

  // Add a delay for mutation trigger if needed
  const handleCreateConfig = () => {
    setTimeout(() => createConfig(), 1000);
  };

  // Upload cropped images function
  const uploadCroppedImages = async (croppedImages: UploadedImage[]) => {
    try {
      const uploadedUrls = await Promise.all(
        croppedImages.map(async (uploadedImage) => {
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

  const uploadImages = async (images: UploadedImage[]) => {
    try {
      const uploadedUrls = await Promise.all(
        images.map(async (uploadedImage) => {
          const response = await fetch(uploadedImage.url);
          const blob = await response.blob();
          const file = new File([blob], 'image.png', { type: blob.type });

          const uploadResponse = await startUpload([file]); // Pass the File object
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

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const userImage = new Image();
        userImage.crossOrigin = 'anonymous';
        userImage.src = image.url;
        await new Promise((resolve) => (userImage.onload = resolve));

        //điều chỉnh vị trí và kích thước của hình ảnh
        ctx?.drawImage(
          userImage,
          image.x - leftOffset,
          image.y - topOffset,
          image.width / 4,
          image.height / 4,
        );
      }
      const backgroundImage = new Image();
      backgroundImage.crossOrigin = 'anonymous';
      backgroundImage.src = '/template/template-bg-front.png';
      await new Promise((resolve) => (backgroundImage.onload = resolve));

      ctx?.drawImage(backgroundImage, 0, 0, caseWidth, caseHeight);

      const base64 = canvas.toDataURL();
      const base64Data = base64.split(',')[1];

      const blob = base64ToBlob(base64Data, 'image/png');
      const file = new File(
        [blob],
        'filename' + new Date().getTime() + '.png',
        { type: 'image/png' },
      );
      const blobUrl = URL.createObjectURL(blob);
      setCroppedImages([{ side: 'front', url: blobUrl }]);
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description:
          'There was a problem saving your config, please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
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
                  src="/template/template-bg-front.png"
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
            </div>
            {images.map(({ url, width, height, id }, index) => (
              <Rnd
                key={id} // Use the unique id as the key
                default={{
                  x: 250,
                  y: 205,
                  height: height / 4,
                  width: width / 4,
                }}
                onResizeStop={(_, __, ref, ___, { x, y }) => {
                  const newHeight = parseInt(ref.style.height.slice(0, -2));
                  const newWidth = parseInt(ref.style.width.slice(0, -2));

                  setImages((prev) => {
                    // Ensure prev is an array before proceeding
                    if (!Array.isArray(prev)) {
                      return prev; // Safely return if not an array
                    }

                    // Correctly map and update positions
                    return prev.map((pos, i) =>
                      i === index
                        ? { ...pos, x, y, width: newWidth, height: newHeight } // Include all properties
                        : pos,
                    );
                  });
                }}
                onDragStart={() => setIsDragging(true)}
                onDragStop={(_, data) => {
                  const { x, y } = data;
                  setImages((prev) =>
                    prev.map((pos) => (pos.id === id ? { ...pos, x, y } : pos)),
                  );
                  setIsDragging(false);
                }}
                className="absolute z-20 border-[3px] border-primary"
                lockAspectRatio={isShiftPressed}
                resizeHandleComponent={{
                  bottomRight: <HandleComponent />,
                  bottomLeft: <HandleComponent />,
                  topRight: (
                    <>
                      <HandleComponent />
                      <button
                        onClick={() => {
                          setImages((prevImages) =>
                            prevImages.filter((_, i) => i !== index),
                          );
                        }}
                        className="absolute -top-5 -right-5 text-black p-1 rounded-full"
                      >
                        X
                      </button>
                    </>
                  ),
                  topLeft: <HandleComponent />,
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
            ))}
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
                              width: img.width,
                              height: img.height,
                              x: 200,
                              y: 205,
                              id: uuidv4(),
                              side: 'front',
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
                              [`border-${color.tw}`]: active || checked,
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
                onClick={handleCreateConfig}
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
