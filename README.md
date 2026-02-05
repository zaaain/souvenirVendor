# React TypeScript Tailwind Redux Toolkit Boilerplate

A modern React boilerplate with TypeScript, Tailwind CSS, and Redux Toolkit Query (RTK Query).

## Features

- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔄 Redux Toolkit for state management
- 📡 RTK Query for data fetching
- ⚡ Vite for fast development and building

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── store/
│   ├── api/
│   │   └── apiSlice.ts      # RTK Query API slice
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.slice.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.selectors.ts (optional)
│   │   ├── user/
│   │   │   └── user.slice.ts
│   │   └── dashboard/
│   │       └── dashboard.slice.ts
│   ├── index.ts             # configureStore
│   └── rootReducer.ts       # combineReducers
├── hooks/
│   └── redux.ts             # Typed Redux hooks
├── App.tsx                  # Main App component
├── main.tsx                 # Entry point
└── index.css                # Global styles with Tailwind
```

## Usage

### Using RTK Query

Example of using RTK Query hooks in components:

```tsx
import { useGetPostsQuery } from './store/api/apiSlice'

function Posts() {
  const { data, error, isLoading } = useGetPostsQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error occurred</div>

  return (
    <ul>
      {data?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Using Redux Hooks

```tsx
import { useAppDispatch, useAppSelector } from './hooks/redux'
```

## License

MIT

