# Shelf Page Design (Books & Tags)

## Overview
Shelf Page displays Books under a specific shelf. It introduces a Tag system for classifying and filtering books.

## UI Layout
- **Tag Bar**:
  - Located at the top, horizontally scrollable.
  - **All Option**: Show all books.
  - **Custom Tags**: Show user-defined tags, click to filter books.
  - **Edit/Add Tag**: Quickly edit or add new tags.
- **Sub-header**:
  - Displays the filtered book count.
  - **+ New Book Button**: Create a new book.
- **Book Grid**:
  - Displays `BookCard`.

## Components
### TagBar
- Highlights the currently selected tag.
- Tags have color dots or small icons.

### BookCard
- **Cover/Icon**: Large visual area, supports cover image or large icon.
- **Metadata**: Title, subtitle.
- **Tags**: Displays tags the book belongs to at the bottom of the card.
- **Interaction**: Click to enter `BookPage`.

## Logic
- **Filter**: When a tag is selected, only display books whose `tagIds` contain that tag.
- **Primary Tag**: Each book can specify a primary tag for main classification display in certain views.
