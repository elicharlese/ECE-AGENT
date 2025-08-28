import React from "react"

export type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  accentClassName?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function FeatureCard({ icon, title, description, accentClassName, className, titleClassName, descriptionClassName }: FeatureCardProps) {
  return (
    <div className={("rounded-xl border border-transparent bg-white dark:bg-gray-900 p-1.5 md:px-3 md:py-2.5 shadow-sm w-full sm:w-fit max-w-[22rem] " + (className ?? "")).trim()}>
      <div className="flex items-start gap-1 md:gap-1.5">
        <div className={("rounded-lg p-0.5 md:p-1.5 " + (accentClassName ?? "bg-neutral-50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300")).trim()}>
          {icon}
        </div>
        <div>
          <h3 className={("font-medium text-gray-900 dark:text-gray-100 " + (titleClassName ?? "")).trim()}>{title}</h3>
          <p className={("mt-0.5 text-sm leading-tight text-gray-600 dark:text-gray-300 " + (descriptionClassName ?? "")).trim()}>{description}</p>
        </div>
      </div>
    </div>
  )
}
