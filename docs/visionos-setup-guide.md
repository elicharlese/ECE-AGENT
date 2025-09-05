# VisionOS Spatial Application Setup Guide

## Overview

This guide provides a foundational setup for a VisionOS spatial application within our Nx monorepo, integrating with existing Next.js, Expo, and Electron apps. It focuses on creating a testable structure without Vision Pro hardware, using SwiftUI and RealityKit for spatial features while bridging to React/TypeScript components.

Reference: https://developer.apple.com/visionos

## Application Architecture

### Nx Workspace Structure
- **New App Module**: Create `apps/visionos/` as a native iOS app using Xcode, integrated via Nx's build system.
- **Hybrid Approach**: Use React Native VisionOS (if available) or web views for shared UI components; native SwiftUI for spatial elements.
- **Shared Libraries**: Reuse `libs/shared-ui/` for UI components, `libs/data/` for backend integration.
- **Dependencies**: Add VisionOS-specific libs like RealityKit; maintain TypeScript for cross-platform logic.

### Key Components
- **Spatial UI**: SwiftUI views for 3D environments.
- **Data Layer**: Shared with existing apps via Supabase/LiveKit.
- **Testing**: Unit tests in Swift; integration tests via Nx.

## Step-by-Step Setup

### 1. Prerequisites
- macOS Sonoma+, Xcode 15+.
- Nx CLI installed.
- Apple Developer account for VisionOS access.

### 2. Create VisionOS App in Nx
```bash
npx nx generate @nx/react:app visionos --directory=apps/visionos --routing=false
```
- Modify for VisionOS: Update project.json to use Xcode build.

### 3. Install Dependencies
```bash
npm install @react-native-community/cli react-native-visionos
```
- For native: Add RealityKit via Swift Package Manager.

### 4. Scaffold Initial Code
- Create SwiftUI View:
```swift
import SwiftUI
import RealityKit

struct SpatialView: View {
    var body: some View {
        RealityView { content in
            // Add 3D content
        }
    }
}
```
- Bridge to React: Use web views for shared components.

### 5. Configure Build
- Update nx.json for VisionOS target.
- Add CI: Use GitHub Actions with macOS runners.

## Challenges and Solutions

### Cross-Platform Compatibility
- **Challenge**: Bridging React/TypeScript with Swift.
- **Solution**: Use web views or React Native VisionOS for hybrid UI.

### Testing Without Hardware
- **Challenge**: No official emulator.
- **Solution**: Use suggested tools below.

### Performance
- **Challenge**: 3D rendering optimization.
- **Solution**: Profile with Xcode Instruments; optimize RealityKit usage.

## Simulation Tools Without Hardware

### 1. Unity with AR Foundation
- **Description**: Use Unity's AR Foundation for spatial simulation on desktop/mobile.
- **Pros**: Free, comprehensive 3D tools, cross-platform.
- **Cons**: Learning curve, not VisionOS-specific.
- **Setup**: Install Unity Hub, create AR project, export to iOS simulator.

### 2. A-Frame Web-Based AR
- **Description**: Web framework for 3D/AR experiences.
- **Pros**: Free, browser-based, easy setup.
- **Cons**: Limited to web, not native spatial.
- **Setup**: Include in Next.js app: `npm install aframe`; create scene in HTML.

### 3. Three.js for 3D Previews
- **Description**: JavaScript 3D library for web previews.
- **Pros**: Integrates with existing React, free.
- **Cons**: Not AR-specific, requires adaptation.
- **Setup**: Add to Next.js: `npm install three`; use WebXR for AR simulation.

### 4. Xcode Simulator (Basic)
- **Description**: iOS simulator for basic UI testing.
- **Pros**: Free with Xcode, familiar.
- **Cons**: No spatial features.
- **Setup**: Run in Xcode for non-spatial elements.

### 5. Community Tools (e.g., VisionOS Simulator Projects)
- **Description**: Open-source projects on GitHub for VisionOS simulation.
- **Pros**: Free, community-driven.
- **Cons**: Unofficial, may be outdated.
- **Setup**: Search GitHub for "VisionOS simulator"; clone and run.

## Next Steps
- Implement prototype.
- Test with suggested tools.
- Iterate based on feedback.</instructions>
</edit_file>