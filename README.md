# ChordLine - SvelteKit Music Growth App

A TypeScript-based SvelteKit application with IndexedDB storage, featuring strict type safety and automated deployment to GitHub Pages.

## 🎵 About ChordLine

ChordLine is a modern web application built with SvelteKit that helps musicians track their progress and achieve their musical goals. The app uses IndexedDB for local data storage, ensuring your practice data is always available offline.

## ✨ Features

- **User Authentication**: Secure login and registration system
- **Practice Tracking**: Log and monitor your practice sessions
- **Goal Setting**: Set and track musical goals
- **Offline Support**: Works without internet connection using IndexedDB
- **Responsive Design**: Optimized for desktop and mobile devices
- **Static Site Generation**: Fast loading with pre-rendered pages

## 🚀 Live Demo

The application is automatically deployed to GitHub Pages: [View Live App](https://yourusername.github.io/Musician-Growth-App/)

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2 with Svelte 4
- **Language**: TypeScript with strict type checking
- **Database**: IndexedDB via Dexie.js
- **Styling**: CSS with component-scoped styles
- **Build Tool**: Vite
- **Deployment**: GitHub Pages with GitHub Actions

## 📦 Deployment

This app automatically deploys to GitHub Pages when you push to the main branch. The deployment process:

1. Runs full validation (TypeScript, ESLint, Prettier, Svelte checks)
2. Builds the production version with proper base path
3. Deploys to GitHub Pages

### Manual Deployment

To deploy manually:

```bash
npm run build:gh-pages  # Build for GitHub Pages
```

### Setting Up GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. Push to main branch to trigger deployment

## 🏗️ Project Structure

```
src/
├── frontend/          # Frontend SvelteKit application
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── dashboard/ # Dashboard components
│   │   │   └── shared/    # Shared UI components
│   │   ├── logic/         # Business logic (TypeScript)
│   │   └── styles/        # CSS styles
│   ├── routes/            # SvelteKit file-based routing
│   │   ├── +layout.svelte # Root layout
│   │   ├── +layout.ts     # Layout configuration
│   │   └── +page.svelte   # Home page
│   └── app.html          # HTML template
├── backend/           # Backend logic and database
│   ├── database/      # Database types and schemas
│   ├── services/      # Business services
│   └── logger.ts      # Logging utilities
└── app.d.ts          # Global type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Musician-Growth-App.git
cd Musician-Growth-App
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📝 Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run validate           # Auto-fix + validate all (recommended workflow)
npm run validate:manual    # Run all checks manually (fallback)
npm run type-check         # TypeScript type checking
npm run check              # Svelte type checking
npm run check:watch        # Svelte type checking in watch mode
npm run lint               # Run ESLint (check only)
npm run format             # Format code with Prettier
```

## 🔧 Development Guidelines

### Code Quality Standards

This project enforces strict TypeScript standards and code quality through automated tooling.

### Tools Used

- **TypeScript**: Strict type checking with additional compiler options
- **ESLint**: Code linting with TypeScript and Svelte support
- **Prettier**: Code formatting
- **Svelte Check**: Svelte-specific type checking

### Pre-Commit Workflow

Before committing code, always run:

```bash
npm run validate
```

This enhanced validation script will:

1. **Auto-fix issues**: Runs `lint:fix` and `format` to automatically resolve fixable problems
2. **Run checks**: Validates TypeScript types, Svelte components, remaining lint issues, and formatting
3. **Report results**: Shows clear success/failure status with colored output

### TypeScript Configuration

The project uses strict TypeScript settings including:

- `strict: true` - All strict type checking options
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `noImplicitReturns: true` - Error when not all code paths return a value
- `noUncheckedIndexedAccess: true` - Add undefined to index signature results

### ESLint Rules

**TypeScript-Specific Rules:**

- `@typescript-eslint/no-explicit-any`: No `any` types allowed
- `@typescript-eslint/explicit-function-return-type`: Explicit function return types required (warning)
- `@typescript-eslint/no-unused-vars`: No unused variables (except those prefixed with `_`)
- `@typescript-eslint/prefer-nullish-coalescing`: Prefer `??` over `||`
- `@typescript-eslint/prefer-optional-chain`: Prefer `?.` over manual checks
- `@typescript-eslint/no-floating-promises`: All promises must be handled
- `@typescript-eslint/no-unsafe-*`: Prevent unsafe operations on `any` types
- `@typescript-eslint/no-non-null-assertion`: Forbid `!` non-null assertions
- `@typescript-eslint/switch-exhaustiveness-check`: Ensure switch statements are exhaustive

**Code Quality Rules:**

- `prefer-template`: Use template literals instead of string concatenation
- `object-shorthand`: Use ES6 object shorthand
- `eqeqeq`: Always use strict equality (`===`)
- `curly`: Always use braces for control statements
- `no-implicit-coercion`: Prevent implicit type coercion
- `prefer-arrow-callback`: Prefer arrow functions for callbacks
- `no-duplicate-imports`: Prevent duplicate imports

### Best Practices

1. **Type Everything**: Avoid `any`, use proper types
2. **Handle Errors**: Always handle promises and potential errors
3. **Use Stores**: For reactive state in Svelte components
4. **Consistent Naming**: Use camelCase for variables, PascalCase for components
5. **Small Functions**: Keep functions focused and testable
6. **Comments**: Document complex logic and business rules

### SvelteKit Conventions

- Use `$lib` for importing from the lib directory
- Place reusable components in `src/lib/components`
- Use `+page.svelte` for pages and `+layout.svelte` for layouts
- Leverage SvelteKit's file-based routing system
- Use `$app` imports for SvelteKit-specific functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and run `npm run validate`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Database powered by [Dexie.js](https://dexie.org/)
- Deployed on [GitHub Pages](https://pages.github.com/)
