'use client';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Rnd } from 'react-rnd';
import { RadioGroup } from '@headlessui/react';
import { useRef, useState, useEffect } from 'react';
import {
  COLORS,
  getTailwindColor,
  MODELS,
} from '@/validators/option-validator';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Layers,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import {
  createConfig as _createConfig,
  type CreateConfigArgs,
} from './actions';
import { useRouter } from 'next/navigation';
import Dropzone, { type FileRejection } from 'react-dropzone';
import { useUploadThing } from '@/lib/uploadthing';
import { v4 as uuidv4 } from 'uuid';
import type { ShirtSide } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCw, PlusCircle } from 'lucide-react';

// Import the AI service
import { generateImagesFromPrompt } from '@/lib/ai-service';

// Define types for design elements
export interface DesignElement {
  id: string;
  type: 'image' | 'text';
  side: ShirtSide;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}
interface AIImageGeneration {
  prompt: string;
  isGenerating: boolean;
  results: string[];
}
export interface ImageElement extends DesignElement {
  type: 'image';
  url: string;
}

export interface TextElement extends DesignElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

interface CroppedImage {
  side: string;
  url: string;
}

// Font options
const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Impact', label: 'Impact' },
];

// Font weight options
const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: 'Thin' },
  { value: '300', label: 'Light' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '800', label: 'Extrabold' },
  { value: '900', label: 'Black' },
];

// Text alignment options
const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const DesignConfigurator = () => {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('DesignConfigurator');
  const { startUpload } = useUploadThing('imageUploader');
  // Add these states to the component
  const [aiImageGeneration, setAiImageGeneration] = useState<AIImageGeneration>(
    {
      prompt: '',
      isGenerating: false,
      results: [],
    },
  );

  // State for current side and elements
  const [currentSide, setCurrentSide] = useState<ShirtSide>('front');
  const [elements, setElements] = useState<
    Record<ShirtSide, (ImageElement | TextElement)[]>
  >({
    front: [],
    back: [],
    left: [],
    right: [],
  });
  const [croppedImages, setCroppedImages] = useState<
    Record<ShirtSide, CroppedImage[]>
  >({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  // Text editor state
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState(FONT_WEIGHTS[0].value);
  const [textColor, setTextColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>(
    'center',
  );

  // Selected element for editing
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // UI state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Product options state
  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
  });

  // Refs for t-shirt container
  const tShirtCaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add a new state for inline text editing
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditText, setInlineEditText] = useState('');

  const [isLocked, setIsLocked] = useState<boolean>(false); // Trạng thái khóa/mở
  const [timeLeft, setTimeLeft] = useState<number>(180); // Thời gian còn lại (3 phút = 180 giây)

  // Hàm xử lý khi nhấn nút
  const handleClick = (): void => {
    if (!isLocked) {
      setIsLocked(true);
      setTimeLeft(180); // Đặt lại thời gian về 3 phút
      toast({
        title: 'Wait in 3 minute',
      });
    }
  };

  // Đếm ngược khi nút bị khóa
  useEffect(() => {
    if (!isLocked) return; // Không chạy nếu nút không bị khóa

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown); // Dừng khi hết thời gian
          setIsLocked(false); // Mở khóa nút
          return 0;
        }
        return prev - 1; // Giảm thời gian
      });
    }, 1000); // Cập nhật mỗi giây

    // Cleanup để tránh memory leak
    return () => clearInterval(countdown);
  }, [isLocked]);

  // Tính phút và giây từ timeLeft
  const minutes: number = Math.floor(timeLeft / 60);
  const seconds: number = timeLeft % 60;
  const displayTime: string = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

  // Save configuration when elements change
  useEffect(() => {
    const saveConfig = async () => {
      await saveConfiguration();
    };
    saveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, options]);

  // Handle shift key for aspect ratio locking
  useEffect(() => {
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle file drop rejection
  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);
    toast({
      title: `${file.file.type} type is not supported.`,
      description: 'Please choose a PNG, JPG, or JPEG image instead.',
      variant: 'destructive',
    });
  };

  // Add image element to current side
  const addImageElement = (newImages: ImageElement[]) => {
    setElements((prevElements) => ({
      ...prevElements,
      [currentSide]: [...prevElements[currentSide], ...newImages],
    }));
  };

  // Add text element to current side
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast({
        title: 'Text Required',
        description: 'Please enter some text to add to your design.',
        variant: 'destructive',
      });
      return;
    }

    const newTextElement: TextElement = {
      id: uuidv4(),
      type: 'text',
      content: textInput,
      fontFamily: selectedFont,
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: textColor,
      textAlign: textAlign,
      side: currentSide,
      x: 380,
      y: 380,
      width: 200,
      height: 50,
      visible: true,
    };

    setElements((prevElements) => ({
      ...prevElements,
      [currentSide]: [...prevElements[currentSide], newTextElement],
    }));

    // Reset text input
    setTextInput('');

    toast({
      title: 'Text Added',
      description: 'Your text has been added to the design.',
    });
  };

  // Handle file drop acceptance
  const onDropAccepted = async (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        addImageElement([
          {
            id: uuidv4(),
            type: 'image',
            url: img.src,
            width: Math.min(img.width, 120),
            height: Math.min(img.height, 120),
            x: 380,
            y: 380,
            side: currentSide,
            visible: true,
          },
        ]);
      };
    });
    setIsDragOver(false);
  };
  const generateImagesWithAI = async () => {
    void handleClick();
    if (!aiImageGeneration.prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description:
          'Please enter a description for the image you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setAiImageGeneration((prev) => ({ ...prev, isGenerating: true }));

    try {
      // Try to generate images using the free API
      let imageUrls: string[] = [];

      try {
        imageUrls = await generateImagesFromPrompt(aiImageGeneration.prompt);
      } catch (apiError) {
        console.error('Error with primary API:', apiError);

        // If the free API fails (e.g., due to rate limiting), use the fallback
        const fallbackResponse = await fetch('/api/generate-images/fallback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: aiImageGeneration.prompt }),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          imageUrls = data.images;

          // Inform the user we're using placeholders
          toast({
            title: 'Using Placeholders',
            description:
              'The AI service is currently busy. Using placeholders instead.',
            variant: 'destructive',
          });
        } else {
          throw new Error('Both primary and fallback APIs failed');
        }
      }

      setAiImageGeneration((prev) => ({
        ...prev,
        isGenerating: false,
        results: imageUrls,
      }));

      toast({
        title: 'Images Generated',
        description: 'AI has created images based on your description.',
      });
    } catch (error) {
      setAiImageGeneration((prev) => ({ ...prev, isGenerating: false }));
      toast({
        title: 'Generation Failed',
        description:
          'There was an error generating your images. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Add this function to handle AI-generated images (which might be base64)
  const addAIGeneratedImage = (imageUrl: string) => {
    // Check if the image is a base64 string or a URL
    const isBase64 = imageUrl.startsWith('data:');

    if (isBase64) {
      // For base64 images, we can use them directly
      addImageElement([
        {
          id: uuidv4(),
          type: 'image',
          url: imageUrl,
          width: 150,
          height: 150,
          x: 380,
          y: 380,
          side: currentSide,
          visible: true,
        },
      ]);

      toast({
        title: 'Image Added',
        description: 'The AI-generated image has been added to your design.',
      });
    } else {
      // For URLs, load the image first to get dimensions
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        addImageElement([
          {
            id: uuidv4(),
            type: 'image',
            url: img.src,
            width: Math.min(img.width, 150),
            height: Math.min(img.height, 150),
            x: 380,
            y: 380,
            side: currentSide,
            visible: true,
          },
        ]);

        toast({
          title: 'Image Added',
          description: 'The AI-generated image has been added to your design.',
        });
      };
    }
  };
  // Add this function to convert text elements to image blobs
  const textElementToImage = async (element: TextElement): Promise<Blob> => {
    // Create a canvas to render the text
    const canvas = document.createElement('canvas');

    // Set canvas dimensions based on the text element
    canvas.width = element.width;
    canvas.height = element.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configure text styling
    ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.textAlign;

    // Calculate text position
    let textX = 0;
    if (element.textAlign === 'center') {
      textX = canvas.width / 2;
    } else if (element.textAlign === 'right') {
      textX = canvas.width;
    }

    // Draw text on canvas
    ctx.fillText(element.content, textX, element.fontSize);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    });
  };

  // Update the createConfig mutation function to handle text elements
  const { mutate: createConfig, isPending } = useMutation({
    mutationKey: ['create-config'],
    mutationFn: async () => {
      const hasVisibleElements = Object.values(elements).some((sideElements) =>
        sideElements.some((element) => element.visible),
      );

      if (!hasVisibleElements) {
        toast({
          title: 'Configuration Error',
          description: 'Please add at least one visible element to continue.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const sides: ShirtSide[] = ['front', 'back', 'left', 'right'];
        const args: CreateConfigArgs = {
          color: options.color.value,
          model: options.model.value,
          imageUrls: [],
          croppedImages: [],
        };

        for (const side of sides) {
          // Upload cropped images and get their URLs for each side
          const uploadedCroppedUrls = await uploadCroppedImages(side);

          // Update args with uploaded cropped image URLs for each side
          args.croppedImages.push(
            ...uploadedCroppedUrls.map((url, index) => ({
              side: croppedImages[side][index].side as ShirtSide,
              url,
            })),
          );

          // Get all visible elements for this side
          const visibleElements = elements[side].filter(
            (element) => element.visible,
          );

          if (visibleElements.length > 0) {
            // Process and upload all elements (both images and text)
            const uploadedElementUrls = await uploadElements(visibleElements);

            // Update args with uploaded element URLs
            args.imageUrls.push(
              ...uploadedElementUrls.map((url, index) => ({
                url,
                width: visibleElements[index].width,
                height: visibleElements[index].height,
                side: visibleElements[index].side,
                x: visibleElements[index].x,
                y: visibleElements[index].y,
              })),
            );
          }
        }

        // Create configuration in the database
        const id = await _createConfig(args);
        return id;
      } catch (error) {
        toast({
          title: 'Configuration Error',
          description: 'There was an error on our end. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Configuration Error',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (id) => {
      router.push(`/configure/preview?configId=${id}`);
    },
  });

  // Add a new function to upload all elements (both images and text)
  const uploadElements = async (elements: (ImageElement | TextElement)[]) => {
    try {
      const uploadedUrls = await Promise.all(
        elements.map(async (element) => {
          let file: File;

          if (element.type === 'image') {
            // Handle image elements as before
            const response = await fetch((element as ImageElement).url);
            const blob = await response.blob();
            file = new File(
              [blob],
              new Date().getTime() + '-' + element.side + '.png',
              {
                type: blob.type,
              },
            );
          } else {
            // Convert text elements to image blobs
            const blob = await textElementToImage(element as TextElement);
            file = new File(
              [blob],
              new Date().getTime() + '-text-' + element.side + '.png',
              {
                type: 'image/png',
              },
            );
          }

          const uploadResponse = await startUpload([file]);
          if (!uploadResponse || !uploadResponse[0]?.url) {
            throw new Error('Failed to upload element');
          }

          const { url } = uploadResponse[0];
          return url;
        }),
      );

      return uploadedUrls;
    } catch (error) {
      toast({
        title: 'Upload Error',
        description:
          'There was an error uploading your design elements. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Upload cropped images
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

      return uploadedUrls;
    } catch (error) {
      toast({
        title: 'Upload Error',
        description:
          'There was an error uploading your images. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Upload design images
  const uploadImages = async (images: ImageElement[]) => {
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

      return uploadedUrls;
    } catch (error) {
      toast({
        title: 'Upload Error',
        description:
          'There was an error uploading your images. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Convert base64 to blob
  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Save configuration to canvas
  async function saveConfiguration() {
    try {
      const sides: ShirtSide[] = ['front', 'back', 'left', 'right'];

      for (const side of sides) {
        const {
          left: caseLeft,
          top: caseTop,
          width: caseWidth,
          height: caseHeight,
        } = tShirtCaseRef.current?.getBoundingClientRect() || {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        };

        const { left: containerLeft, top: containerTop } =
          containerRef.current?.getBoundingClientRect() || {
            left: 0,
            top: 0,
          };

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

        // Draw visible elements
        const visibleElements = elements[side].filter(
          (element) => element.visible,
        );

        for (const element of visibleElements) {
          if (element.type === 'image') {
            const userImage = new window.Image();
            userImage.crossOrigin = 'anonymous';
            userImage.src = element.url;
            await new Promise((resolve) => (userImage.onload = resolve));

            ctx?.drawImage(
              userImage,
              element.x - leftOffset,
              element.y - topOffset,
              element.width,
              element.height,
            );
          } else if (element.type === 'text') {
            if (ctx) {
              ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
              ctx.fillStyle = element.color;
              ctx.textAlign = element.textAlign;

              let textX = element.x - leftOffset;
              if (element.textAlign === 'center') {
                textX += element.width / 2;
              } else if (element.textAlign === 'right') {
                textX += element.width;
              }

              ctx.fillText(
                element.content,
                textX,
                element.y - topOffset + element.fontSize,
              );
            }
          }
        }

        const backgroundImage = new window.Image();
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

  // Handle file upload via button
  const handleFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.multiple = true;
    fileInput.click();

    fileInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file) => {
          const img = new window.Image();
          img.src = URL.createObjectURL(file);
          img.onload = async () => {
            addImageElement([
              {
                id: uuidv4(),
                type: 'image',
                url: img.src,
                width: Math.min(img.width, 120),
                height: Math.min(img.height, 120),
                x: 380,
                y: 380,
                side: currentSide,
                visible: true,
              },
            ]);
          };
        });
      }
    });
  };

  // Delete an element
  const deleteElement = (id: string) => {
    setElements((prevElements) => ({
      ...prevElements,
      [currentSide]: prevElements[currentSide].filter(
        (element) => element.id !== id,
      ),
    }));

    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Toggle element visibility
  const toggleElementVisibility = (id: string) => {
    setElements((prevElements) => ({
      ...prevElements,
      [currentSide]: prevElements[currentSide].map((element) =>
        element.id === id ? { ...element, visible: !element.visible } : element,
      ),
    }));
  };

  // Update text element properties
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setElements((prevElements) => ({
      ...prevElements,
      [currentSide]: prevElements[currentSide].map((element) =>
        element.id === id && element.type === 'text'
          ? { ...element, ...updates }
          : element,
      ),
    }));
  };

  // Add a function to handle double-click on text elements for inline editing
  const startInlineEditing = (element: TextElement) => {
    setInlineEditingId(element.id);
    setInlineEditText(element.content);
  };

  // Add a function to save inline edited text
  const saveInlineEditedText = () => {
    if (inlineEditingId) {
      updateTextElement(inlineEditingId, {
        content: inlineEditText,
      });
      setInlineEditingId(null);
    }
  };

  // Select element for editing
  const selectElement = (id: string) => {
    setSelectedElement(id === selectedElement ? null : id);

    // If selecting a text element, load its properties into the editor
    const element = elements[currentSide].find((el) => el.id === id);
    if (element && element.type === 'text') {
      setTextInput(element.content);
      setSelectedFont(element.fontFamily);
      setFontSize(element.fontSize);
      setFontWeight(element.fontWeight);
      setTextColor(element.color);
      setTextAlign(element.textAlign);
    }
  };

  // Apply text changes to selected element
  const applyTextChanges = () => {
    if (selectedElement) {
      const element = elements[currentSide].find(
        (el) => el.id === selectedElement,
      );
      if (element && element.type === 'text') {
        updateTextElement(selectedElement, {
          content: textInput,
          fontFamily: selectedFont,
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: textColor,
          textAlign: textAlign,
        });

        toast({
          title: 'Text Updated',
          description: 'Your text changes have been applied.',
        });
      }
    }
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-4 mb-20 pb-20">
      <Dropzone
        onDropRejected={onDropRejected}
        onDropAccepted={onDropAccepted}
        accept={{
          'image/png': ['.png'],
          'image/jpeg': ['.jpeg', '.jpg'],
        }}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        noClick
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            ref={containerRef}
            className={cn(
              'relative overflow-hidden col-span-3 w-full max-w-5xl flex items-center justify-center rounded-lg border-2 border-dashed text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300',
            )}
            aria-label="Design area. Drag and drop images here or use the upload button."
          >
            <input {...getInputProps()} />

            {isDragOver && (
              <div className="absolute inset-0 z-50 bg-primary/10 flex items-center justify-center">
                <p className="text-primary font-medium text-lg">
                  Drop your images here
                </p>
              </div>
            )}

            <div
              className="relative bg-opacity-50 pointer-events-none aspect-[2000/2000]"
              style={{ width: '100%' }}
            >
              <AspectRatio
                ref={tShirtCaseRef}
                ratio={2000 / 2000}
                className="pointer-events-none relative z-50 aspect-[2000/2000] w-full"
              >
                <Image
                  fill
                  alt={`${options.model.label} t-shirt ${currentSide} view`}
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
            </div>

            {elements[currentSide].map((element) => (
              <Rnd
                key={element.id}
                default={{
                  x: element.x,
                  y: element.y,
                  height: element.height,
                  width: element.width,
                }}
                style={{
                  display: element.visible ? 'block' : 'none',
                  zIndex: selectedElement === element.id ? 30 : 20,
                }}
                onResizeStop={(_, __, ref, ___, { x, y }) => {
                  const newHeight = Number.parseInt(
                    ref.style.height.slice(0, -2),
                  );
                  const newWidth = Number.parseInt(
                    ref.style.width.slice(0, -2),
                  );

                  setElements((prev) => {
                    return {
                      ...prev,
                      [currentSide]: prev[currentSide].map((el) =>
                        el.id === element.id
                          ? {
                              ...el,
                              x,
                              y,
                              width: newWidth,
                              height: newHeight,
                            }
                          : el,
                      ),
                    };
                  });
                }}
                onDragStop={(_, data) => {
                  const { x, y } = data;
                  setElements((prev) => ({
                    ...prev,
                    [currentSide]: prev[currentSide].map((el) =>
                      el.id === element.id ? { ...el, x, y } : el,
                    ),
                  }));
                }}
                className={cn(
                  'absolute border-none',
                  selectedElement === element.id ? 'ring-2 ring-primary' : '',
                )}
                lockAspectRatio={element.type === 'image' && isShiftPressed}
                onClick={() => {
                  if (inlineEditingId) {
                    saveInlineEditedText();
                  }
                  selectElement(element.id);
                }}
                resizeHandleComponent={{
                  topRight:
                    selectedElement === element.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                        className="absolute -top-5 -right-5 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors"
                        aria-label="Delete element"
                      >
                        <X size={16} />
                      </button>
                    ) : undefined,
                }}
              >
                {element.type === 'image' ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={element.url || '/placeholder.svg'}
                      fill
                      alt="Design element"
                      className="pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                ) : inlineEditingId === element.id ? (
                  <input
                    type="text"
                    value={inlineEditText}
                    onChange={(e) => setInlineEditText(e.target.value)}
                    onBlur={saveInlineEditedText}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveInlineEditedText();
                      }
                    }}
                    autoFocus
                    className="w-full h-full text-center bg-transparent outline-none"
                    style={{
                      fontFamily: element.fontFamily,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                    style={{
                      fontFamily: element.fontFamily,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                    }}
                    onDoubleClick={() =>
                      startInlineEditing(element as TextElement)
                    }
                  >
                    {element.content}
                  </div>
                )}
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
            <h2 className="tracking-tight font-bold text-3xl">
              {t('customize.title')}
            </h2>

            <div className="w-full h-px bg-zinc-200 my-6" />

            <Tabs defaultValue="design" className="w-full">
              <TabsList className="grid w-full grid-cols-2 grid-rows-2 h-18">
                <TabsTrigger value="design">
                  {t('customize.design')}
                </TabsTrigger>
                <TabsTrigger value="text">{t('customize.text')}</TabsTrigger>
                <TabsTrigger value="ai">{t('customize.ai')}</TabsTrigger>
                <TabsTrigger value="elements">
                  {t('customize.elements')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Button
                    onClick={handleFileUpload}
                    className="w-full"
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('upload')}
                  </Button>

                  <RadioGroup
                    value={options.color}
                    onChange={(val) => {
                      setOptions((prev) => ({
                        ...prev,
                        color: val,
                      }));
                    }}
                    aria-label="Color selection"
                  >
                    <Label>
                      {t('color.title')}: {t(`color.${options.color.label}`)}
                    </Label>
                    <div className="mt-3 flex items-center space-x-3 flex-wrap gap-2">
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
                          aria-label={`Select ${color.label} color`}
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
                    <Label htmlFor="model-dropdown">{t('Model.title')}</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          id="model-dropdown"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          aria-label="Model selection"
                        >
                          {options.model.label}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
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
                            aria-label={`Select ${model.label} model`}
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
                    <Label>{t('select_side.title')}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['front', 'back', 'left', 'right'] as ShirtSide[]).map(
                        (side) => (
                          <button
                            key={side}
                            onClick={() => setCurrentSide(side)}
                            className={cn(
                              'flex flex-col items-center p-2 rounded-md border transition-all',
                              currentSide === side
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300',
                            )}
                            aria-label={`${side} view`}
                            aria-pressed={currentSide === side}
                          >
                            <div className="relative w-16 h-16 mb-2">
                              <Image
                                src={`/template/template-bg-${side}-${options.model.value}.png`}
                                alt={`${side} view`}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="capitalize text-sm font-medium">
                              {t(`select_side.${side}`)}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {elements[side].length}{' '}
                              {elements[side].length === 1
                                ? t(`select_side.element`)
                                : t(`select_side.elements`)}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">{t(`Text.content`)}</Label>
                    <Input
                      id="text-input"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text here"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">{t(`Text.font_family`)}</Label>
                    <Select
                      value={selectedFont}
                      onValueChange={setSelectedFont}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="font-size">
                        {t(`Text.font_size`)}: {fontSize}px
                      </Label>
                    </div>
                    <Slider
                      id="font-size"
                      min={10}
                      max={72}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-weight">{t(`Text.font_weight`)}</Label>
                    <Select value={fontWeight} onValueChange={setFontWeight}>
                      <SelectTrigger id="font-weight">
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_WEIGHTS.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-align">
                      {t(`Text.text_alignment`)}
                    </Label>
                    <Select
                      value={textAlign}
                      onValueChange={(value: 'left' | 'center' | 'right') =>
                        setTextAlign(value)
                      }
                    >
                      <SelectTrigger id="text-align">
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_ALIGNMENTS.map((alignment) => (
                          <SelectItem
                            key={alignment.value}
                            value={alignment.value}
                          >
                            {alignment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">{t(`Text.text_color`)}</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-300"
                        style={{ backgroundColor: textColor }}
                      />
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    {selectedElement ? (
                      <Button onClick={applyTextChanges} className="w-full">
                        {t(`Text.update`)}
                      </Button>
                    ) : (
                      <Button
                        onClick={addTextElement}
                        className="w-full"
                        disabled={!textInput.trim()}
                      >
                        <Type className="mr-2 h-4 w-4" />
                        {t(`Text.add`)}
                      </Button>
                    )}

                    {selectedElement && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedElement(null)}
                      >
                        {t(`Text.cancel`)}
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="elements" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {t('element.description')} {t(`select_side.${currentSide}`)}
                  </h3>

                  {elements[currentSide].length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="mx-auto h-8 w-8 opacity-50 mb-2" />
                      <p>{t('element.noneyet')}</p>
                      <p className="text-xs mt-1">
                        <p>{t('element.nonyet_desc')}</p>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {elements[currentSide].map((element) => (
                        <div
                          key={element.id}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-md border transition-all',
                            selectedElement === element.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200',
                          )}
                          onClick={() => selectElement(element.id)}
                        >
                          <div className="relative w-10 h-10 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                            {element.type === 'image' ? (
                              <Image
                                src={element.url || '/placeholder.svg'}
                                alt="Element thumbnail"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Type className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {element.type === 'text'
                                ? `"${(element as TextElement).content.substring(0, 20)}${(element as TextElement).content.length > 20 ? '...' : ''}"`
                                : `Image ${elements[currentSide].filter((e) => e.type === 'image').findIndex((e) => e.id === element.id) + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {element.type === 'text'
                                ? `${(element as TextElement).fontFamily}, ${(element as TextElement).fontSize}px`
                                : `${element.width}×${element.height}px`}
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleElementVisibility(element.id);
                              }}
                              aria-label={
                                element.visible
                                  ? 'Hide element'
                                  : 'Show element'
                              }
                            >
                              {element.visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              aria-label="Delete element"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">{t('ai.description')}</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder={t('ai.placeholder')}
                      value={aiImageGeneration.prompt}
                      onChange={(e: any) =>
                        setAiImageGeneration((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={generateImagesWithAI}
                    className="w-full"
                    disabled={
                      !aiImageGeneration.prompt.trim() ||
                      aiImageGeneration.isGenerating ||
                      isLocked
                    }
                  >
                    {isLocked ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {displayTime}
                      </>
                    ) : aiImageGeneration.isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t('ai.generate_image')}
                      </>
                    )}
                  </Button>

                  {aiImageGeneration.results.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Generated Images</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {aiImageGeneration.results.map((imageUrl, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardContent className="p-2">
                              <div className="relative aspect-square mb-2">
                                <Image
                                  src={imageUrl || '/placeholder.svg'}
                                  alt={`AI generated image ${index + 1}`}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => addAIGeneratedImage(imageUrl)}
                              >
                                <PlusCircle className="mr-1 h-3 w-3" />
                                {t('ai.add')}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
                    <p className="font-medium mb-1">{t('ai.about.title')}:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li>{t('ai.about.one')}</li>
                      <li>{t('ai.about.two')}</li>
                      <li>{t('ai.about.three')}</li>
                      <li>{t('ai.about.four')}</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">{t(`Tips.title`)}</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {t(`Tips.one`)}</li>
                <li>• {t(`Tips.two`)}</li>
                <li>• {t(`Tips.three`)}</li>
              </ul>
            </div>
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
                disabled={
                  isPending ||
                  !Object.values(elements).some((sideElements) =>
                    sideElements.some((element) => element.visible),
                  )
                }
                onClick={() => createConfig()}
                size="sm"
                className="w-full"
              >
                {isPending ? t('saving') : t('continue')}
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignConfigurator;
