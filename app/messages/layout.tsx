'use client'

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col bg-gray-50 dark:bg-gray-900 h-[100svh]">
      <div className="flex-1 min-h-0 flex overflow-hidden h-full">
        {children}
      </div>
    </div>
  )
}
