import Image from 'next/image'
import React from 'react'
import clsx from 'clsx'

export type TrustLogosProps = {
  className?: string
}

const logos = [
  { src: '/placeholder-logo.svg', alt: 'OpenAI', width: 84, height: 24 },
  { src: '/placeholder-logo.svg', alt: 'Benzinga', width: 120, height: 24 },
  { src: '/placeholder-logo.svg', alt: 'Partner', width: 96, height: 24 },
]

export function TrustLogos({ className }: TrustLogosProps) {
  return (
    <div className={clsx('flex w-full items-center justify-start gap-8 opacity-70', className)}>
      {logos.map((logo, i) => (
        <Image
          key={i}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-5 w-auto grayscale contrast-125 opacity-80"
        />
      ))}
    </div>
  )
}
// no default export
