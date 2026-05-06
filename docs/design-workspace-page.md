# Workspace Page Design

## Overview
The Workspace Page is the entry gate of the application, used to manage and select isolated working environments. Each workspace has its own storage folder, icon library, and data configuration.

## UI Layout
The page uses a centered card layout divided into two columns.

### Left Column: Branding & Stats
- **Gradient Background**: Dynamic gradient feel (Success Soft to Accent Soft).
- **Headline**: "Isolated environments for every app stack." Emphasizes physical isolation.
- **Recent Workspaces**: Displays the last 3 used workspaces for quick switching. Shows name and physical path.

### Right Column: Panel
- **WorkspacePanel**: Provides core workspace operations.
  - **Search**: Search existing workspaces.
  - **Grid/List**: Displays all available workspaces.
  - **Create Action**: Click to open the system directory selector and create a new workspace folder.

## Functional Requirements
1. **Detect Active Workspace**: If an active workspace already exists, automatically enter `HomePage`.
2. **Persistence**: Save all known workspace paths in the global configuration.
3. **Validation**: Check if the path is valid during creation.
