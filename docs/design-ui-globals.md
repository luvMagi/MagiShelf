# Global UI Design

## Design Philosophy
MagiShelf adopts a modern, immersive **Glassmorphism** style combined with a Dark Theme to create a translucent, layered visual experience.

## Color Palette
- **Background**: Dark gray/black `#000000` or `#0b0b0b`.
- **Panel**: Translucent white `rgba(255, 255, 255, 0.05)` with `backdrop-blur-xl`.
- **Accent**: 
  - Default: Blue/Indigo.
  - Dynamic: Allows users to customize colors for Shelves and Books.
- **Text**:
  - Primary: `#ffffff` (High brightness).
  - Secondary: `rgba(255, 255, 255, 0.7)` (Medium brightness).
  - Muted: `rgba(255, 255, 255, 0.4)` (Low brightness).

## UI Elements
- **Cards**: 
  - `rounded-2xl` (1rem corner radius).
  - `border-white/10` (subtle border to increase boundary definition).
  - `hover:scale-[1.02]` (subtle scale up on hover).
- **Buttons**:
  - **Ghost**: No background, turns white on hover.
  - **Accent**: Uses theme accent background, highlighted.
- **Typography**:
  - Titles: `font-bold`, large font size.
  - Content: `font-normal`, small font size.

## Animations (Framer Motion)
- **Page Transitions**: Smooth fade-in and subtle displacement when switching pages.
- **List Items**: Items pop out in order (Stagger) when entering.
- **Hover**: All interactive elements have smooth state transitions.
