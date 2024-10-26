import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface TShirtProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

const TShirt = ({ imgSrc, className, dark = false, ...props }: TShirtProps) => {
  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        dark ? 'bg-black' : 'bg-white',
        className,
      )}
      {...props}
    >
      <div className=" z-50 inset-0">
        <img
          className="object-cover min-w-full min-h-full"
          src={imgSrc}
          alt="overlaying t-shirt image"
        />
      </div>
    </div>
  );
};

export default TShirt;
