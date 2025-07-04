'use client'

import { useEffect, useRef, useState } from 'react'
import { AspectRatio } from './ui/aspect-ratio'
import { cn } from '@/lib/utils'

const TShirtPreview = ({
  croppedImageUrl,
}: {
  croppedImageUrl: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [renderedDimensions, setRenderedDimensions] = useState({
    height: 0,
    width: 0,
  })

  const handleResize = () => {
    if (!ref.current) return
    const { width, height } = ref.current.getBoundingClientRect()
    setRenderedDimensions({ width, height })
  }

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current])

  let caseBackgroundColor = 'bg-zinc-950'


  return (
    <AspectRatio ref={ref} ratio={3000 / 2001} className='relative'>
      <div
        className='absolute z-20 scale-[1.0352]'
        style={{
          left:
            renderedDimensions.width / 2 -
            renderedDimensions.width / (1216 / 121),
          top: renderedDimensions.height / 6.22,
        }}>

        <img
          width={renderedDimensions.width / (3000 / 637)}
          className={cn(
            't-shirt-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]',
            caseBackgroundColor
          )}
          src={croppedImageUrl}
          alt='t-shirt preview'
        />
      </div>
    </AspectRatio>
  )
}

export default TShirtPreview
