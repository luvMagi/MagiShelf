# Settings Drawer Design

## Overview
To ensure users do not lose their current browsing position when configuring the application, all configuration forms (Shelves, Tags, Books, Entries) use a side Drawer for pop-ups.

## UI Layout
- **Placement**: Slides in from the right side of the screen.
- **Backdrop**: Darkens the background with a subtle blur.
- **Content**: Vertically scrollable, divided into multiple sections.
- **Footer**: Contains "Save" and "Cancel" (or auto-save/cancel by clicking the Backdrop).

## Form Types
### 1. Shelf/Tag/Book Basic Forms
- Includes name, description, color picker, and icon selector.

### 2. Entry Form (Most Complex)
- **Action Type Selector**: Dropdown to select action type (Open App, Run Command, etc.).
- **Dynamic Fields**: Switches fields based on the selected type:
  - `open-app` -> `appPath`, `args`
  - `open-url` -> `url`
  - `run-command` -> `command`, `workingDir`
- **Advanced Settings**: Collapsible area containing environment variables, shell type, execution mode, etc.

## Components
- **ColorPicker**: Preset palette.
- **IconSelector**: Browse built-in or user-imported icon libraries.
- **PathInput**: Invokes native system dialogs to select file or folder paths.
