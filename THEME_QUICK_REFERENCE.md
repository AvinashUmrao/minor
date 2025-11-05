# Theme System - Quick Reference Card

## 🎨 Available Options

### Modes
- ☀️ **Light** - Bright interface
- 🌙 **Dark** - Dark interface  
- 🖥️ **System** - Auto-match device

### Colors
- 🔵 **Blue** - Educational (default)
- 🟣 **Purple** - Creative
- 🟢 **Green** - Calming
- 🟠 **Orange** - Energetic
- 🌸 **Rose** - Warm
- ⚫ **Slate** - Professional

## 📍 Location

Theme toggle is in the **navbar** with "Theme" label

## 💾 Persistence

✅ Automatically saved to localStorage
✅ Restored on page reload
✅ Syncs across browser tabs

## 🔧 For Developers

### Import Context
```tsx
import { useColorTheme } from "@/contexts/ThemeContext";
```

### Get Current Theme
```tsx
const { colorTheme } = useColorTheme();
// Returns: "blue" | "purple" | "green" | "orange" | "rose" | "slate"
```

### Change Theme
```tsx
const { setColorTheme } = useColorTheme();
setColorTheme("purple");
```

### Get Light/Dark Mode
```tsx
import { useTheme } from "next-themes";
const { theme, setTheme } = useTheme();
// theme: "light" | "dark" | "system"
```

## 📁 Key Files

- `src/contexts/ThemeContext.tsx` - Color theme context
- `src/components/layout/ThemeToggle.tsx` - Theme selector UI
- `src/index.css` - Color theme CSS variables
- `src/App.tsx` - Provider setup

## 🎯 Total Combinations

**18 theme variations** = 6 colors × 3 modes

## ✨ Features

- Visual color indicators
- Active selection marker
- Keyboard accessible
- Mobile responsive
- Smooth transitions
- Zero flash on load
