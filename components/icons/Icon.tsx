import * as React from 'react'
import {
  IconDotsVertical,
  IconChevronDown,
  IconChevronRight,
  IconCheck,
  IconX,
  IconPlayerPlay,
  IconLoader2,
  IconBrandGithub,
  IconBrandGoogle,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCamera,
  IconEdit,
  IconDeviceFloppy,
  IconWallet,
  IconShield,
  IconMessage,
  IconUsers,
  IconRobot,
  IconArrowRight,
  IconDatabase,
  IconWorld,
  IconGitBranch,
  IconFileSearch,
  IconTerminal,
  IconCalculator,
  IconSettings,
} from '@tabler/icons-react'

// Extend this mapping as we migrate more icons
const iconMap = {
  'more-vertical': IconDotsVertical,
  // chevrons
  'chevron-down': IconChevronDown,
  'chevron-right': IconChevronRight,
  // status
  'check': IconCheck,
  'x': IconX,
  'play': IconPlayerPlay,
  'loader': IconLoader2,
  // brands
  'github': IconBrandGithub,
  'brand-github': IconBrandGithub,
  'google': IconBrandGoogle,
  'brand-google': IconBrandGoogle,
  // UI
  'user': IconUser,
  'mail': IconMail,
  'phone': IconPhone,
  'map-pin': IconMapPin,
  'calendar': IconCalendar,
  'camera': IconCamera,
  'edit': IconEdit,
  'save': IconDeviceFloppy,
  'wallet': IconWallet,
  'shield': IconShield,
  // app landing
  'message-square': IconMessage,
  'users': IconUsers,
  'bot': IconRobot,
  'arrow-right': IconArrowRight,
  // tools panel
  'database': IconDatabase,
  'globe': IconWorld,
  'git-branch': IconGitBranch,
  'file-search': IconFileSearch,
  'terminal': IconTerminal,
  'calculator': IconCalculator,
  'settings': IconSettings,
} as const

export type IconName = keyof typeof iconMap

// Use Tabler's component prop types but omit size/stroke to redefine them
type BaseIconProps = Omit<React.ComponentProps<typeof IconDotsVertical>, 'ref' | 'size' | 'stroke'>

export interface IconProps extends BaseIconProps {
  name: IconName
  size?: number
  stroke?: number
  className?: string
}

export function Icon({ name, size = 20, stroke = 1.75, className, ...rest }: IconProps) {
  const Cmp = iconMap[name] ?? IconDotsVertical
  return <Cmp size={size} stroke={stroke} className={className} {...rest} />
}
