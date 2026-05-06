# Book Page Design (Entry List)

## Overview
Book Page is the final execution page of the workflow, displaying all **Entries** under that book.

## UI Layout
- **Book Header**:
  - Displays detailed information about the book.
  - **Settings Button**: Modifies the book's default execution environment (e.g., default Shell, working directory).
- **Entry List**:
  - Vertical list layout.
  - Supports Drag & Drop reordering.
  - **+ New Entry Button**: Adds a new execution action.

## Components
### EntryCard
- **Action Icon**: Displays different icons based on `actionType` (e.g., folder, app, terminal).
- **Name & Description**: Describes the purpose of the entry.
- **Execution Button**: Triggers main process execution logic immediately upon clicking.
- **Edit/Delete**: Manage the entry.

## Execution Logic
- **Inheritance**: When an entry is executed, it merges default configurations from the book level (working directory, environment variables, etc.).
- **Runner**: Sends `run-entry` requests to the main process via IPC, which are dispatched by `commandRunner`.
- **Terminal Control**: Supports advanced settings like "keep terminal open after execution".
