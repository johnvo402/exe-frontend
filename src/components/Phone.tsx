import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        dark ? 'bg-black' : 'bg-white', // Apply background based on dark mode
        className
      )}
      {...props}>
      <div className=' z-50 inset-0'>
        <img
          className='object-cover min-w-full min-h-full'
          src={imgSrc}
          alt='overlaying phone image'
        />
      </div>
    </div>
  );
};

export default Phone;
