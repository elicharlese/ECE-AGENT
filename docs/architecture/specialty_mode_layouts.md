# Specialty Mode Layouts Plan

## Current Status

- Specialty mode layouts are not yet implemented in the web app
- This document defines the plan and integration points for future work

## Overview
This document outlines the design and implementation plan for specialty mode layouts in the multi-group chat and AI chat system. Each mode will have a custom layout with tools suited to the class of the layout.

## Modes and Layouts

### 1. Design Mode
- **Purpose**: 3D design and visualization
- **Primary Tools**:
  - Spline 3D editor integration
  - Asset library browser
  - Material and texture editor
  - Preview or render panel
- **Layout Components**:
  - Main 3D viewport
  - Properties panel right
  - Asset browser bottom
  - Timeline or animation controls bottom

### 2. Security Mode
- **Purpose**: Security analysis and vulnerability assessment
- **Primary Tools**:
  - Network scanner
  - Vulnerability database
  - Threat modeling canvas
  - Report generator
- **Layout Components**:
  - Dashboard with security metrics
  - Scan results panel
  - Threat map visualization
  - Reporting tools panel

### 3. Development Mode
- **Purpose**: Code development and debugging
- **Primary Tools**:
  - Integrated code editor
  - Terminal or console
  - Debugging tools
  - Version control interface
- **Layout Components**:
  - Code editor main
  - File explorer left
  - Terminal or output bottom
  - Debug controls right

### 4. Analysis Mode
- **Purpose**: Data analysis and visualization
- **Primary Tools**:
  - Data import or export
  - Charting and visualization
  - Statistical analysis
  - Report builder
- **Layout Components**:
  - Data grid or table view
  - Visualization canvas
  - Analysis controls panel
  - Results summary

### 5. Communication Mode
- **Purpose**: Enhanced communication and collaboration
- **Primary Tools**:
  - Multi-group chat
  - Video conferencing
  - File sharing
  - Polls and surveys
- **Layout Components**:
  - Chat interface main
  - Video panel top or right
  - Participant list right
  - Shared documents bottom

### 6. Automation Mode
- **Purpose**: Workflow automation and task scheduling
- **Primary Tools**:
  - Workflow designer
  - Task scheduler
  - Automation logs
  - Trigger configuration
- **Layout Components**:
  - Workflow canvas
  - Task list and scheduler
  - Automation logs panel
  - Configuration controls

## Implementation Approach

1. **Base Layout Component**: Create a flexible base layout component that can be extended for each mode
2. **Mode-Specific Components**: Implement custom components for each mode's unique tools
3. **Tool Integration**: Integrate existing tools (Spline, LLM, etc.) into the appropriate mode layouts
4. **Responsive Design**: Ensure layouts work well on different screen sizes
5. **State Management**: Implement mode-specific state management

## UI Libraries
- shadcn/ui for accessible components
- Tailwind CSS for styling
- Lucide React for icons
- Material UI for advanced components where needed
- Hero Icons for additional iconography

## Next Steps
1. Implement Design Mode layout as proof of concept
2. Create base layout component
3. Develop mode switching mechanism
4. Integrate with existing tools

## Roadmap

- Initial POC for Design Mode integrated into the existing web app shell
- Mode switcher navigation and persistence
- Progressive enhancement for Security and Development modes aligned with available tools
