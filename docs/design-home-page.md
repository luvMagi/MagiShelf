# Home Page Design (Shelf List)

## Overview
Home Page is the main view after entering a workspace, displaying all Shelves in the current workspace. It is the first-level directory for organizing workflows.

## UI Layout
- **Header**:
  - Title "Shelves".
  - **Settings Button**: Opens workspace global settings (export/import data, icon management).
  - **+ New Shelf Button**: Opens drawer to create a new shelf.
- **Shelf Grid**:
  - Displays `ShelfCard` using a grid layout.
  - **Empty State**: If no shelves exist, show guidance tips and a creation button.

## Components
### ShelfCard
- **Icon**: Displays shelf icon (supports custom SVG icon library).
- **Name & Description**: Shelf title and short description.
- **Stats**: Displays the number of Books contained in the shelf (To be implemented).
- **Actions**:
  - Click card: Enter `ShelfPage`.
  - Top right Edit: Modify shelf info.
  - Top right Delete: Delete shelf (requires double confirmation).

## Interaction
1. **Drag & Drop**: Support shelf reordering (MVP stage might implement via manual order field).
2. **Settings Drawer**: All add/edit operations are completed in a side drawer to maintain context.
