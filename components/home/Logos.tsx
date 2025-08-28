import React from "react"

export type LogosProps = {
  className?: string
}

export function Logos({ className }: LogosProps) {
  const items = [
    { src: "/placeholder-logo.svg", alt: "Company A" },
    { src: "/placeholder-logo.svg", alt: "Company B" },
    { src: "/placeholder-logo.svg", alt: "Company C" },
    { src: "/placeholder-logo.svg", alt: "Company D" },
    { src: "/placeholder-logo.svg", alt: "Company E" },
  ]

  return (
    <div className={"w-full " + (className ?? "")}> 
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">Trusted by fast-moving teams</div>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 opacity-80">
        {items.map((item, idx) => (
          <img
            key={idx}
            src={item.src}
            alt={item.alt}
            className="h-6 sm:h-7 md:h-8 opacity-70 hover:opacity-100 transition"
          />
        ))}
      </div>
    </div>
  )
}
