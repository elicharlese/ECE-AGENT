/**
 * Layout Pattern Exports
 * Export all layout components and utilities
 */

// AppShell Layout System
export {
  AppShell,
  AppShellHeader,
  AppShellSidebar,
  AppShellMain,
  AppShellFooter,
  SidebarToggle,
  useAppShell,
} from './AppShell';

// Page Layout System
export {
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  PageSidebar,
  PageGrid,
  PageHero,
  type PageSectionProps,
  type PageSidebarProps,
  type PageGridProps,
  type PageHeroProps,
} from './PageLayout';

// Foundational Layout Components
export {
  Stack,
  VStack,
  HStack,
  type StackProps,
  type VStackProps,
  type HStackProps,
} from './Stack';

export {
  Flex,
  FlexItem,
  type FlexProps,
  type FlexItemProps,
} from './Flex';

export {
  Grid,
  GridItem,
  type GridProps,
  type GridItemProps,
} from './Grid';

export {
  Container,
  SectionContainer,
  ArticleContainer,
  FluidContainer,
  type ContainerProps,
  type SectionContainerProps,
  type ArticleContainerProps,
  type FluidContainerProps,
} from './Container';

export {
  Spacer,
  XSpacer,
  YSpacer,
  FlexSpacer,
  type SpacerProps,
  type XSpacerProps,
  type YSpacerProps,
  type FlexSpacerProps,
} from './Spacer';
