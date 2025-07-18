# Musician Growth App 🎵

A comprehensive web application that helps musicians track their progress, manage goals, and receive personalized recommendations to advance their musical careers.

## 🎯 Project Description

The Musician Growth App is a production-ready React application designed to help musicians of all levels systematically track their musical journey. From beginner to professional, users can log performances, track practice sessions, set and achieve goals, and receive data-driven recommendations to accelerate their growth.

### Key Features

- **📊 Dashboard Analytics**: Visual charts and metrics showing performance trends, practice statistics, and goal progress
- **🎤 Performance Tracking**: Log shows with venue details, audience size, earnings, and setlists
- **🎵 Practice Session Management**: Track practice time, focus areas, and skill development
- **🎯 Goal Management**: Set, track, and achieve musical goals with progress monitoring
- **🏆 Achievement System**: Unlock achievements and receive notifications for milestones
- **📈 Bulk Data Entry**: Efficiently backfill historical data with templates and validation
- **🔔 Notification Center**: Real-time notifications for achievements and important updates
- **💡 AI-Powered Recommendations**: Personalized career guidance based on your activity data and progress
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🚀 Onboarding Flow**: Guided tour for new users to learn the platform
- **♿ Accessibility Compliance**: WCAG 2.1 AA compliant with comprehensive accessibility testing and validation

### Architecture

- **Frontend**: React 18 with TypeScript
- **State Management**: React Context API
- **Data Persistence**: IndexedDB for local storage
- **UI Framework**: Bootstrap 5 with custom CSS
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Vitest and React Testing Library
- **Analytics**: Custom analytics service for performance insights

## 🛠️ Technical Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | Frontend framework |
| TypeScript | Type safety and better developer experience |
| Vite | Build tool and development server |
| IndexedDB | Client-side database for data persistence |
| Bootstrap 5 | CSS framework for responsive design |
| Vitest | Testing framework |
| React Testing Library | Component testing utilities |
| ESLint | Code linting and quality |

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Musician-Growth-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Building for Production

1. **Create a production build**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

The build artifacts will be stored in the `dist/` directory.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build |
| `npm run test` | Runs the test suite |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run lint` | Runs ESLint to check code quality |
| `npm run lint:fix` | Fixes ESLint errors automatically |
| `npm run deploy` | Deploys to GitHub Pages |

## 🏗️ Project Structure

```
src/
├── components/           # React components (feature-based organization)
│   ├── ActivityTracking/ # Performance and practice session tracking
│   ├── BulkEntry/        # Bulk data entry forms and validation
│   ├── Dashboard/        # Main dashboard with analytics and charts
│   ├── GoalManagement/   # Goal setting, tracking, and progress
│   ├── LandingPage/      # Landing page and onboarding flow
│   ├── MusicianForm/     # Profile creation and editing forms
│   ├── ProfileSelection/ # Profile management and switching
│   ├── Recommendation/   # Recommendation display and algorithms
│   └── common/           # Shared UI components (ErrorBoundary, etc.)
├── context/              # React Context for global state
│   └── AppContext.tsx    # Main application context with reducer pattern
├── core/                 # Business logic, types, and constants
│   ├── types.ts          # Comprehensive TypeScript type definitions
│   ├── constants.ts      # Application constants and configuration
│   ├── achievementTypes.ts # Achievement system types and definitions
│   └── recommendationEngine.ts # Recommendation algorithms
├── services/             # External services and data operations
│   ├── storageService.ts # IndexedDB storage operations
│   ├── analyticsService.ts # Data analysis and performance metrics
│   └── achievementService.ts # Achievement management and progress tracking
├── utils/                # Pure utility functions
│   ├── index.ts          # Common utility functions
│   └── accessibility.ts  # Comprehensive accessibility testing and validation utilities
├── hooks/                # Custom React hooks (currently empty)
├── styles/               # Global and shared CSS
├── tests/                # Cross-cutting tests (accessibility, responsive)
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 📊 Data Models and Architecture

The Musician Growth App features a comprehensive data model designed for professional music career tracking:

### Core Data Types
- **MusicianProfile**: Complete musician profile with activity history
- **PerformanceRecord**: Detailed show tracking with venue, audience, and earnings data
- **PracticeSession**: Structured practice logging with focus areas and skills
- **Goal**: Comprehensive goal management with progress tracking
- **Achievement**: Gamified achievement system with multiple tiers

### Advanced Features
- **Analytics Engine**: Automated trend analysis and insights
- **Achievement System**: 15+ achievements across 4 categories (Bronze to Platinum)
- **Recommendation Engine**: AI-driven suggestions for career growth
- **Contextual Navigation**: Smart navigation that adapts based on user journey (onboarding vs dashboard flows)
- **User Preferences**: Comprehensive settings and customization
- **Error Handling**: Robust error management with recovery options

For detailed documentation of all data models and types, see [docs/data-models.md](docs/data-models.md).

## 🎮 Usage Guide

### For New Users

1. **Create a Profile**: Set up your musician profile with instrument and experience details
2. **Take the Tour**: Follow the onboarding flow to learn about all features
3. **Log Your First Activity**: Add a performance or practice session
4. **Set Goals**: Create your first musical goal to work towards
5. **Track Progress**: Use the dashboard to monitor your growth over time

### Core Workflows

#### Performance Tracking
- Navigate to Activity Tracking → Performance Entry
- Fill in show details (venue, audience, payment, etc.)
- View performance history and trends in the dashboard

#### Practice Session Logging
- Go to Activity Tracking → Practice Entry
- Log practice time, focus areas, and skills worked on
- Track practice consistency and improvement over time

#### Goal Management
- Access Goal Management from the dashboard
- Create goals with specific targets and deadlines
- Monitor progress automatically based on your activities

#### Bulk Data Entry
- Use Bulk Entry to quickly add multiple activities
- Apply templates for common values
- Validate and import historical data efficiently

## ♿ Accessibility

The Musician Growth App is built with accessibility as a core principle, ensuring all users can effectively use the application regardless of their abilities.

### WCAG 2.1 AA Compliance

- **Color Contrast**: All text meets minimum 4.5:1 contrast ratio requirements
- **Keyboard Navigation**: Full keyboard accessibility with visible focus indicators
- **Screen Reader Support**: Proper ARIA labels, roles, and semantic HTML
- **Touch Targets**: Minimum 44px touch targets for mobile accessibility
- **Responsive Design**: Accessible across all device sizes and orientations

### Accessibility Testing Tools

The application includes comprehensive accessibility validation utilities:

```typescript
import { 
  validateAccessibility, 
  calculateContrastRatio, 
  validateTabAccessibility,
  ACCESSIBILITY_COLORS 
} from '@/utils/accessibility';

// Validate element accessibility
const result = validateAccessibility(element, {
  checkContrast: true,
  checkKeyboard: true,
  checkResponsive: true,
  viewportWidth: window.innerWidth
});
```

### Built-in Accessibility Features

- **WCAG-Compliant Color Palette**: Pre-validated color combinations
- **Automated Contrast Validation**: Real-time color contrast checking
- **Keyboard Navigation Testing**: Comprehensive keyboard accessibility validation
- **Responsive Accessibility**: Touch target and mobile accessibility validation
- **Screen Reader Optimization**: Proper semantic structure and ARIA attributes

For detailed accessibility documentation, see [docs/accessibility.md](docs/accessibility.md).

## 🧪 Testing

The application includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Unit Tests**: Core business logic and utilities
- **Component Tests**: React component functionality
- **Integration Tests**: User workflows and data flow
- **Storage Tests**: IndexedDB operations and data persistence
- **Accessibility Tests**: WCAG compliance and usability validation

Current test coverage: **90%+ of critical paths**

## 🔧 Development

### Code Quality

The project enforces code quality through:
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (integrated with ESLint)
- **Husky**: Git hooks for pre-commit checks

### Contributing Guidelines

1. **Code Style**: Follow the existing TypeScript and React patterns
2. **Testing**: Add tests for new features and bug fixes
3. **Documentation**: Update README and inline comments as needed
4. **Type Safety**: Maintain strict TypeScript compliance

## 📱 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Requirements

- **IndexedDB**: Required for data persistence
- **ES6+ Features**: Modern JavaScript support
- **Local Storage**: For user preferences and onboarding state

## 🚀 Deployment

### GitHub Pages

The project is configured for GitHub Pages deployment:

```bash
npm run deploy
```

### Custom Deployment

For other hosting platforms:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure your server to serve `index.html` for all routes (SPA support)

### Environment Configuration

The application uses these environment variables:

- `VITE_APP_TITLE`: Application title (default: "Musician Growth App")
- `VITE_BASE_URL`: Base URL for deployment (default: "/Musician-Growth-App/")

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure Node.js version 16+ is installed
2. **Storage Issues**: Check that IndexedDB is supported in your browser
3. **Performance**: Clear browser cache and IndexedDB data if needed

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'true'` in browser console.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For questions, issues, or feature requests:
- Create an issue in the GitHub repository
- Review the documentation in the `docs/` folder
- Check the troubleshooting section above

## 🎉 Acknowledgments

- Built with React, TypeScript, and modern web technologies
- Inspired by the need for better musician progress tracking tools
- Designed for musicians of all levels and genres

---

**Happy practicing! 🎵**