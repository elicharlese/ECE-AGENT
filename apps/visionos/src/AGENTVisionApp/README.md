# AGENT Vision App Assets

This directory contains the assets and configuration for the AGENT Vision app.

## Info.plist
- Contains app metadata with "AGENT" as the display name
- Configured for visionOS compatibility

## Assets.xcassets
- AppIcon.appiconset: Contains the app icon configuration
- agent-bot.svg: The source SVG logo that should be used to generate PNG icons

## Next Steps
To complete the icon setup, you need to generate PNG files from the agent-bot.svg for all the sizes specified in Contents.json:

- icon-20.png (20x20)
- icon-29.png (29x29) 
- icon-38.png (38x38)
- icon-40.png (40x40)
- icon-60.png (60x60)
- icon-64.png (64x64)
- icon-68.png (68x68)
- icon-76.png (76x76)
- icon-83.5.png (83.5x83.5)
- icon-1024.png (1024x1024)

You can use tools like ImageMagick, Inkscape, or online SVG to PNG converters to generate these files.
