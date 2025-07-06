# Musician Growth App

A web application that provides personalized career advice to musicians based on their current journey and goals.

## 🎯 MVP Features

- **Interactive Form**: Collect musician data (instrument, performance frequency, crowd size, experience, marketing efforts)
- **Smart Recommendations**: Rule-based engine that generates personalized advice across 4 categories:
  - 📢 Marketing & Promotion
  - 🎤 Performance & Gigging  
  - 🤝 Networking & Collaboration
  - 🎯 Skill Development
- **Beautiful UI**: Modern, responsive design with Material Design principles
- **Instant Results**: Client-side processing for immediate feedback

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (modern, fast alternative to Create React App)
- **Styling**: Bootstrap 5 + Custom CSS with CSS Variables
- **State Management**: React Context API
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages with GitHub Actions

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI components
│   ├── LandingPage/     # Landing page component
│   ├── MusicianForm/    # Multi-step form component
│   └── Recommendation/  # Recommendation display components
├── context/             # React Context for state management
├── core/                # Business logic
│   ├── types.ts         # TypeScript interfaces
│   └── recommendationEngine.ts # Core recommendation logic
├── hooks/               # Custom React hooks (future use)
└── assets/              # Static assets
```

## 🎵 How It Works

1. **User Journey**: Landing → Form → Results
2. **Data Collection**: 5-step form captures musician profile
3. **Processing**: Rule-based engine analyzes profile and generates targeted recommendations
4. **Results**: 3-5 prioritized recommendations displayed in cards

## 🧪 Testing

The app includes comprehensive tests:
- Unit tests for recommendation engine logic
- Component tests for UI interactions
- Integration tests for user flows

```bash
npm test        # Run all tests
npm test --ui   # Run tests with UI
npm test --coverage  # Run with coverage report
```

## 🚀 Deployment

The app is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch triggers GitHub Actions
2. Actions runs tests and builds the app
3. Built files are deployed to `gh-pages` branch
4. GitHub Pages serves the static site

## 🎯 Recommendation Engine

The core logic evaluates:
- **Performance activity** (never to multiple times/week)
- **Audience size** (1-10 to 500+ people)
- **Experience level** (0-50+ years)
- **Current marketing efforts** (social media, website, networking, etc.)

Based on these inputs, it generates targeted advice in four key areas for musician growth.

## 🔮 Future Enhancements

- User accounts and profiles
- Backend API with database
- Advanced analytics and progress tracking
- Machine learning-powered recommendations
- Community features and collaboration tools

## 📄 License

This project is open source and available under the MIT License.