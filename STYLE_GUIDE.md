# Threads-Inspired Style Guide

Style reference for PCO Events, based on the Threads (threads.com) design language.

---

## Color Tokens

### Light Mode

```css
:root {
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F0F2F5;
  --bg-tertiary: #E4E6EB;
  --bg-input: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-hover: rgba(0, 0, 0, 0.05);
  --bg-active: rgba(0, 0, 0, 0.08);

  /* Text */
  --text-primary: #050505;
  --text-secondary: #65676B;
  --text-tertiary: #8A8D91;
  --text-placeholder: #8A8D91;
  --text-inverse: #FFFFFF;

  /* Borders & Dividers */
  --border-primary: #CED0D4;
  --border-secondary: #E5E5E5;
  --divider: #E5E5E5;

  /* Accent */
  --accent-primary: #1877F2;
  --accent-primary-hover: #1565D8;
  --accent-positive: #31A24C;
  --accent-negative: #FA383E;
  --accent-warning: #F0932B;
}
```

### Dark Mode

```css
[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #101010;
  --bg-secondary: #181818;
  --bg-tertiary: #242526;
  --bg-input: #242526;
  --bg-card: #1E1E1E;
  --bg-hover: rgba(255, 255, 255, 0.06);
  --bg-active: rgba(255, 255, 255, 0.1);

  /* Text */
  --text-primary: #F3F5F7;
  --text-secondary: #B0B3B8;
  --text-tertiary: #6E7074;
  --text-placeholder: #6E7074;
  --text-inverse: #050505;

  /* Borders & Dividers */
  --border-primary: #3E4042;
  --border-secondary: rgb(51, 54, 56);
  --divider: rgb(51, 54, 56);
}
```

---

## Typography

### Font Stack

```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Helvetica, Arial, sans-serif;
  --font-mono: "Menlo", "Consolas", "Monaco", monospace;
}
```

### Scale

| Token         | Size   | Weight | Line Height | Use                      |
|---------------|--------|--------|-------------|--------------------------|
| `--text-xs`   | 12px   | 400    | 16px        | Captions, timestamps     |
| `--text-sm`   | 14px   | 400    | 20px        | Secondary text, labels   |
| `--text-base` | 16px   | 400    | 22px        | Body / post text         |
| `--text-lg`   | 18px   | 600    | 24px        | Subheadings              |
| `--text-xl`   | 20px   | 700    | 26px        | Section headers          |
| `--text-2xl`  | 24px   | 700    | 30px        | Page titles              |
| `--text-3xl`  | 32px   | 700    | 38px        | Hero / large headings    |

```css
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## Spacing

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
}
```

---

## Border Radius

```css
:root {
  --radius-sm: 6px;    /* Buttons, inputs, chips */
  --radius-md: 8px;    /* Cards, modals */
  --radius-lg: 12px;   /* Large cards, sheets */
  --radius-xl: 18px;   /* Chat bubbles, pills */
  --radius-full: 9999px; /* Avatars, circular elements */
}
```

---

## Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## Components

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-size: 16px;
  font-weight: 600;
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 200ms ease;
}
.btn-primary:hover {
  background: var(--accent-primary-hover);
}

/* Secondary / Outline Button */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 200ms ease;
}
.btn-secondary:hover {
  background: var(--bg-hover);
}

/* Ghost / Text Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

### Cards

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.card-elevated {
  background: var(--bg-card);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-lg);
}
```

### Inputs

```css
.input {
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 16px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 200ms ease;
}
.input::placeholder {
  color: var(--text-placeholder);
}
.input:focus {
  border-color: var(--accent-primary);
}
```

### Dividers

```css
.divider {
  height: 1px;
  background: var(--divider);
  border: none;
  margin: var(--space-4) 0;
}
```

### Avatars

```css
.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
}
.avatar-lg {
  width: 48px;
  height: 48px;
}
```

---

## Layout

```css
/* App shell */
.app-container {
  max-width: 640px;        /* Content column */
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* Navigation bar */
.nav {
  height: 74px;
  border-bottom: 1px solid var(--divider);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
}

/* Feed / list item */
.list-item {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--divider);
}
```

---

## Motion

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 350ms;
  --ease-soft: cubic-bezier(0.08, 0.52, 0.52, 1);
  --ease-strong: cubic-bezier(0.12, 0.8, 0.32, 1);
}
```

---

## Tailwind CSS Mapping (if using Tailwind)

```js
// tailwind.config.js extend example
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-primary-hover)',
          positive: 'var(--accent-positive)',
          negative: 'var(--accent-negative)',
        },
        border: {
          DEFAULT: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '18px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.1)',
        md: '0 2px 12px rgba(0,0,0,0.15)',
        lg: '0 8px 20px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
        xl: '0 12px 28px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
};
```
