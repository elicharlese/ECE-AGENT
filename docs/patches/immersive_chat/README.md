# Immersive Chat (3D Headset View)

This feature introduces a 3D "Headset" view for the chat pane. A small toggle button transforms the chat UI into an immersive 3D space for interaction. The initial patch focuses on establishing the mode switch and rendering a performant, accessible 3D-like environment using CSS 3D transforms (no heavy runtime deps).

## Goals

- Provide a clear entry/exit toggle for a 3D chat space.
- Render a lightweight 3D representation of recent messages.
- Keep default chat behavior unchanged when not in 3D mode.
- Ensure accessibility fallbacks and SSR-safety.

## Scope (Patch 1)

- Add a toggle button (desktop only for now) to enter/exit 3D mode.
- Implement `Headset3DView` with CSS 3D transforms and basic interactions (pan/rotate via drag; click to highlight a message card).
- Hide standard message list and input while in 3D mode to avoid overlapping interactions.
- Keep tests stable (no dependency on WebGL/Three.js in this initial patch).

## Future Patches

- Replace CSS 3D view with Three.js + react-three-fiber implementation.
- Add VR/AR device integration and proper controls.
- Map message metadata to spatial positions and enable interactions (reply, react) within 3D.
- Cross-platform support and performance profiling.
