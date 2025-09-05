'use client';

/**
 * Design System Showcase Page
 * Demonstrates all components and patterns in the ECE-AGENT Design System
 */

import React, { useState } from 'react';
import {
  // Layout Components
  AppShell,
  AppShellHeader,
  AppShellSidebar,
  AppShellMain,
  AppShellFooter,
  SidebarToggle,
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  PageGrid,
  PageHero,
  // Foundational Layout Components
  Stack,
  VStack,
  HStack,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Container,
  SectionContainer,
  ArticleContainer,
  FluidContainer,
  Spacer,
  XSpacer,
  YSpacer,
  FlexSpacer,
  // Navigation Components
  ResponsiveNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  // Primitive Components
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Skeleton,
  // Hooks
  useResponsive,
  usePlatform,
  useUserPreferences,
} from '@/libs/design-system';

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();
  const { platform, os, deviceType, isTouch } = usePlatform();
  const { prefersReducedMotion, prefersDarkMode } = useUserPreferences();

  return (
    <AppShell>
      <AppShellHeader className="px-6">
        <div className="flex items-center gap-4">
          <SidebarToggle />
          <h1 className="text-xl font-semibold">ECE-AGENT Design System</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {breakpoint} | {platform} | {deviceType}
            </span>
          </div>
        </div>
      </AppShellHeader>

      <AppShellSidebar className="p-4">
        <nav className="space-y-2">
          <h3 className="mb-2 text-sm font-semibold">Components</h3>
          <a href="#buttons" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Buttons
          </a>
          <a href="#inputs" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Inputs
          </a>
          <a href="#cards" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Cards
          </a>
          <a href="#dialogs" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Dialogs
          </a>
          <a href="#layouts" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Layouts
          </a>
        </nav>
      </AppShellSidebar>

      <AppShellMain>
        <PageLayout>
          <PageHeader
            title="Design System Showcase"
            subtitle="Cross-platform components with responsive design"
            actions={
              <>
                <Button variant="outline" size="sm">
                  Documentation
                </Button>
                <Button size="sm">Get Started</Button>
              </>
            }
          />

          <PageContent>
            {/* Platform Info Section */}
            <PageSection id="platform-info">
              <Card>
                <CardHeader
                  title="Platform Detection"
                  description="Current device and platform information"
                />
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Breakpoint</p>
                      <p className="text-lg font-semibold">{breakpoint}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform</p>
                      <p className="text-lg font-semibold">{platform}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">OS</p>
                      <p className="text-lg font-semibold">{os}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Device</p>
                      <p className="text-lg font-semibold">{deviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Touch</p>
                      <p className="text-lg font-semibold">{isTouch ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dark Mode</p>
                      <p className="text-lg font-semibold">{prefersDarkMode ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reduced Motion</p>
                      <p className="text-lg font-semibold">{prefersReducedMotion ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Screen Type</p>
                      <p className="text-lg font-semibold">
                        {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Buttons Section */}
            <PageSection id="buttons">
              <h2 className="mb-4 text-2xl font-bold">Buttons</h2>
              <Card>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Variants</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default">Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">States</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                      <Button fullWidth>Full Width</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Badges Section */}
            <PageSection id="badges">
              <h2 className="mb-4 text-2xl font-bold">Badges</h2>
              <Card className="mb-6">
                <CardHeader
                  title="Badge Variants"
                  description="Small status indicators and labels"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Variants</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge size="sm">Small</Badge>
                        <Badge size="default">Default</Badge>
                        <Badge size="lg">Large</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Alerts Section */}
            <PageSection id="alerts">
              <h2 className="mb-4 text-2xl font-bold">Alerts</h2>
              <Card className="mb-6">
                <CardHeader
                  title="Alert Messages"
                  description="Contextual feedback messages"
                />
                <CardContent className="space-y-4">
                  <Alert variant="default">
                    <AlertTitle>Default Alert</AlertTitle>
                    <AlertDescription>
                      This is a default alert with informational content.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTitle>Error Alert</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Please try again.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="warning">
                    <AlertTitle>Warning Alert</AlertTitle>
                    <AlertDescription>
                      Please review your information before proceeding.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="success">
                    <AlertTitle>Success Alert</AlertTitle>
                    <AlertDescription>
                      Your changes have been saved successfully.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </PageSection>

            {/* Avatars Section */}
            <PageSection id="avatars">
              <h2 className="mb-4 text-2xl font-bold">Avatars</h2>
              <Card className="mb-6">
                <CardHeader
                  title="User Avatars"
                  description="User profile images with fallbacks"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <Avatar size="sm">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar size="default">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar size="lg">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar size="xl">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">With Images</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarImage src="/broken-image.jpg" alt="Broken" />
                          <AvatarFallback>BK</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Skeletons Section */}
            <PageSection id="skeletons">
              <h2 className="mb-4 text-2xl font-bold">Skeletons</h2>
              <Card className="mb-6">
                <CardHeader
                  title="Loading Placeholders"
                  description="Skeleton components for loading states"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Text Skeletons</h3>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Card Skeleton</h3>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[250px]" />
                              <Skeleton className="h-4 w-[200px]" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Inputs Section */}
            <PageSection id="inputs">
              <h2 className="mb-4 text-2xl font-bold">Inputs</h2>
              <Card>
                <CardContent className="space-y-6 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Default Input"
                      placeholder="Enter text..."
                      helperText="This is a helper text"
                    />
                    <Input
                      label="Required Input"
                      placeholder="This field is required"
                      required
                    />
                    <Input
                      label="With Error"
                      placeholder="Enter email..."
                      errorMessage="Please enter a valid email address"
                      invalid
                    />
                    <Input
                      label="Clearable Input"
                      placeholder="Type something..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onClear={() => setInputValue('')}
                    />
                    <Input
                      label="Ghost Variant"
                      variant="ghost"
                      placeholder="Ghost input..."
                    />
                    <Input
                      label="Filled Variant"
                      variant="filled"
                      placeholder="Filled input..."
                    />
                    <Input
                      label="With Left Icon"
                      placeholder="Search..."
                      leftIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      }
                    />
                    <Input
                      label="Loading State"
                      placeholder="Processing..."
                      loading
                    />
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Cards Section */}
            <PageSection id="cards">
              <h2 className="mb-4 text-2xl font-bold">Cards</h2>
              <PageGrid columns={3} gap="md">
                <Card>
                  <CardHeader
                    title="Default Card"
                    description="Standard card with header and content"
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is a default card component with standard styling and padding.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline">
                      Action
                    </Button>
                  </CardFooter>
                </Card>

                <Card variant="elevated">
                  <CardHeader
                    title="Elevated Card"
                    description="Card with shadow effect"
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has an elevated appearance with shadow for depth.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="ghost" interactive>
                  <CardHeader
                    title="Interactive Ghost"
                    description="Clickable card with hover effect"
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card is interactive and responds to clicks and hover.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="gradient">
                  <CardHeader
                    title="Gradient Card"
                    description="Card with gradient background"
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card features a subtle gradient background.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader
                    title="Card with Action"
                    action={
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    }
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has an action button in the header.
                    </p>
                  </CardContent>
                </Card>

                <Card fullHeight>
                  <CardHeader
                    title="Full Height"
                    description="Stretches to fill container"
                  />
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card will stretch to match the height of its siblings.
                    </p>
                  </CardContent>
                </Card>
              </PageGrid>
            </PageSection>

            {/* Dialogs Section */}
            <PageSection id="dialogs">
              <h2 className="mb-4 text-2xl font-bold">Dialogs</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dialog Example</DialogTitle>
                          <DialogDescription>
                            This is a responsive dialog that adapts to different screen sizes
                            and platforms.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            label="Name"
                            placeholder="Enter your name..."
                            className="mb-4"
                          />
                          <Input
                            label="Email"
                            placeholder="Enter your email..."
                            type="email"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => setDialogOpen(false)}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Small Dialog</Button>
                      </DialogTrigger>
                      <DialogContent size="sm">
                        <DialogHeader>
                          <DialogTitle>Small Dialog</DialogTitle>
                          <DialogDescription>
                            A compact dialog for simple confirmations.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button size="sm">Confirm</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Large Dialog</Button>
                      </DialogTrigger>
                      <DialogContent size="lg">
                        <DialogHeader>
                          <DialogTitle>Large Dialog</DialogTitle>
                          <DialogDescription>
                            A larger dialog for more complex forms and content.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 sm:grid-cols-2">
                          <Input label="First Name" />
                          <Input label="Last Name" />
                          <Input label="Email" type="email" />
                          <Input label="Phone" type="tel" />
                        </div>
                        <DialogFooter>
                          <Button>Submit</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Layout System Showcase */}
            <PageSection id="layouts">
              <h2 className="mb-4 text-2xl font-bold">Layout System</h2>
              
              {/* Stack Layout */}
              <Card className="mb-6">
                <CardHeader
                  title="Stack Layout"
                  description="Vertical and horizontal stacking with responsive spacing"
                />
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Vertical Stack (VStack)</h3>
                    <VStack spacing="md" className="rounded border p-4">
                      <Card className="w-full">
                        <CardContent className="p-3">Item 1</CardContent>
                      </Card>
                      <Card className="w-full">
                        <CardContent className="p-3">Item 2</CardContent>
                      </Card>
                      <Card className="w-full">
                        <CardContent className="p-3">Item 3</CardContent>
                      </Card>
                    </VStack>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Horizontal Stack (HStack)</h3>
                    <HStack spacing="md" className="rounded border p-4">
                      <Card className="flex-1">
                        <CardContent className="p-3">Item 1</CardContent>
                      </Card>
                      <Card className="flex-1">
                        <CardContent className="p-3">Item 2</CardContent>
                      </Card>
                      <Card className="flex-1">
                        <CardContent className="p-3">Item 3</CardContent>
                      </Card>
                    </HStack>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Responsive Stack</h3>
                    <Stack direction="responsive" spacing="responsive" className="rounded border p-4">
                      <Card className="flex-1">
                        <CardContent className="p-3">Responsive Item 1</CardContent>
                      </Card>
                      <Card className="flex-1">
                        <CardContent className="p-3">Responsive Item 2</CardContent>
                      </Card>
                      <Card className="flex-1">
                        <CardContent className="p-3">Responsive Item 3</CardContent>
                      </Card>
                    </Stack>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Changes from vertical on mobile to horizontal on desktop
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Flex Layout */}
              <Card className="mb-6">
                <CardHeader
                  title="Flex Layout"
                  description="Flexible box layout with responsive controls"
                />
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Flex with Items</h3>
                    <Flex gap="md" className="rounded border p-4">
                      <FlexItem flex={1}>
                        <Card>
                          <CardContent className="p-3">Flex: 1</CardContent>
                        </Card>
                      </FlexItem>
                      <FlexItem flex={2}>
                        <Card>
                          <CardContent className="p-3">Flex: 2</CardContent>
                        </Card>
                      </FlexItem>
                      <FlexItem flex={1}>
                        <Card>
                          <CardContent className="p-3">Flex: 1</CardContent>
                        </Card>
                      </FlexItem>
                    </Flex>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Flex with Spacers</h3>
                    <Flex align="center" className="rounded border p-4">
                      <Card>
                        <CardContent className="p-3">Left</CardContent>
                      </Card>
                      <FlexSpacer />
                      <Card>
                        <CardContent className="p-3">Center</CardContent>
                      </Card>
                      <FlexSpacer />
                      <Card>
                        <CardContent className="p-3">Right</CardContent>
                      </Card>
                    </Flex>
                  </div>
                </CardContent>
              </Card>

              {/* Grid Layout */}
              <Card className="mb-6">
                <CardHeader
                  title="Grid Layout"
                  description="CSS Grid layout with responsive controls"
                />
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Responsive Grid</h3>
                    <Grid cols="responsive" gap="responsive" className="rounded border p-4">
                      {Array.from({ length: 6 }, (_, i) => (
                        <GridItem key={i}>
                          <Card>
                            <CardContent className="p-3">Grid Item {i + 1}</CardContent>
                          </Card>
                        </GridItem>
                      ))}
                    </Grid>
                    <p className="mt-2 text-xs text-muted-foreground">
                      1 column on mobile, 2 on tablet, 3 on desktop
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Grid with Spanning</h3>
                    <Grid cols={4} gap="md" className="rounded border p-4">
                      <GridItem colSpan={2}>
                        <Card>
                          <CardContent className="p-3">Span 2 columns</CardContent>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardContent className="p-3">Item 1</CardContent>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card>
                          <CardContent className="p-3">Item 2</CardContent>
                        </Card>
                      </GridItem>
                      <GridItem colSpan="full">
                        <Card>
                          <CardContent className="p-3">Full width item</CardContent>
                        </Card>
                      </GridItem>
                    </Grid>
                  </div>
                </CardContent>
              </Card>

              {/* Container Layout */}
              <Card className="mb-6">
                <CardHeader
                  title="Container Layout"
                  description="Responsive containers with max-width constraints"
                />
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Container Sizes</h3>
                    <VStack spacing="sm">
                      <Container size="sm" className="rounded border bg-muted/50 p-2">
                        <p className="text-center text-sm">Small Container (max-w-sm)</p>
                      </Container>
                      <Container size="md" className="rounded border bg-muted/50 p-2">
                        <p className="text-center text-sm">Medium Container (max-w-md)</p>
                      </Container>
                      <Container size="lg" className="rounded border bg-muted/50 p-2">
                        <p className="text-center text-sm">Large Container (max-w-lg)</p>
                      </Container>
                      <Container size="responsive" className="rounded border bg-muted/50 p-2">
                        <p className="text-center text-sm">Responsive Container (adapts to screen size)</p>
                      </Container>
                    </VStack>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Navigation Showcase */}
            <PageSection id="navigation">
              <h2 className="mb-4 text-2xl font-bold">Navigation Components</h2>
              <Card>
                <CardHeader
                  title="Responsive Navbar"
                  description="Navigation bar with mobile menu support"
                />
                <CardContent>
                  <div className="rounded border">
                    <ResponsiveNavbar
                      variant="default"
                      brand={
                        <NavbarBrand>
                          <Badge variant="default">Logo</Badge>
                          <span>Brand Name</span>
                        </NavbarBrand>
                      }
                      menu={
                        <>
                          <NavbarItem active>Home</NavbarItem>
                          <NavbarItem>About</NavbarItem>
                          <NavbarItem>Services</NavbarItem>
                          <NavbarItem>Contact</NavbarItem>
                        </>
                      }
                      actions={
                        <HStack spacing="sm">
                          <Button variant="ghost" size="sm">Sign In</Button>
                          <Button size="sm">Sign Up</Button>
                        </HStack>
                      }
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Resize to see mobile hamburger menu
                  </p>
                </CardContent>
              </Card>
            </PageSection>

            {/* Responsive Showcase */}
            <PageSection id="responsive">
              <h2 className="mb-4 text-2xl font-bold">Responsive Design</h2>
              <Card>
                <CardHeader
                  title="Adaptive Components"
                  description="Components that adjust based on screen size"
                />
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Resize your browser window to see how components adapt to different screen sizes.
                  </p>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium">Current Breakpoint: {breakpoint}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        xs: &lt;640px | sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded bg-primary/10 p-3 text-center">
                        <p className="text-xs font-medium">Mobile</p>
                        <p className="text-2xl">{isMobile ? '✓' : '✗'}</p>
                      </div>
                      <div className="rounded bg-primary/10 p-3 text-center">
                        <p className="text-xs font-medium">Tablet</p>
                        <p className="text-2xl">{isTablet ? '✓' : '✗'}</p>
                      </div>
                      <div className="rounded bg-primary/10 p-3 text-center">
                        <p className="text-xs font-medium">Desktop</p>
                        <p className="text-2xl">{isDesktop ? '✓' : '✗'}</p>
                      </div>
                      <div className="rounded bg-primary/10 p-3 text-center">
                        <p className="text-xs font-medium">Touch</p>
                        <p className="text-2xl">{isTouch ? '✓' : '✗'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </PageContent>
        </PageLayout>
      </AppShellMain>

      <AppShellFooter className="px-6">
        <p className="text-sm text-muted-foreground">
          ECE-AGENT Design System v1.0.0 | Cross-platform UI Components
        </p>
      </AppShellFooter>
    </AppShell>
  );
}
