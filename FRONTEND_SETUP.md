# Frontend Setup Guide - Phase 2

## Step 1: Install Dependencies

```bash
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom
npm install zustand
npm install sonner
npm install lucide-react
npm install clsx tailwind-merge
```

## Step 2: Setup Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nie: {
          blue: '#003366',
          yellow: '#FFD700',
        }
      }
    },
  },
  plugins: [],
}
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Step 3: Setup ShadCN UI

```bash
npx shadcn-ui@latest init
```

Follow prompts:
- TypeScript? No (we're using JS)
- Style: Default
- Base color: Slate
- CSS variables: Yes

## Step 4: Install ShadCN Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add breadcrumb
```

## Step 5: Project Structure

```
frontend/src/
├── components/
│   ├── ui/          # ShadCN components
│   ├── layout/      # Layout components
│   ├── admin/       # Admin dashboard components
│   ├── teacher/     # Teacher dashboard components
│   ├── student/     # Student dashboard components
│   └── common/      # Shared components
├── contexts/        # React contexts (Auth, Theme)
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── routes/         # Route components
└── App.jsx
```

## Step 6: Key Files to Create

1. **Auth Context** (`src/contexts/AuthContext.jsx`)
2. **Theme Context** (`src/contexts/ThemeContext.jsx`)
3. **Router Setup** (`src/App.jsx` with React Router)
4. **Layout Component** (`src/components/layout/MainLayout.jsx`)
5. **NIE Header** (`src/components/layout/NIEHeader.jsx`)

## Step 7: NIE Branding

Add NIE Mysore logo to `public/logo.png` or use SVG in header component.

Color scheme:
- Primary: NIE Blue (#003366)
- Accent: NIE Yellow (#FFD700)
- Background: White/Light gray
- Dark mode: Slate colors

## Step 8: Start Development

```bash
npm run dev
```

## 📝 Next Steps

1. Create Auth Context Provider
2. Setup React Router with protected routes
3. Build layout with sidebar navigation
4. Create dashboard components for each role
5. Add toast notifications
6. Implement dark mode
7. Add loading states and skeletons

See individual component files for implementation details.

