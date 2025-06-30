# Technical Details

This document provides a detailed breakdown of the technical implementation for the Musician Growth App.

## 1. Technology Stack

The technology choices for the MVP prioritize rapid development, a modern user experience, and ease of deployment without a backend.

*   **Frontend Framework: React with TypeScript**
    *   **Why React?** Its component-based architecture is ideal for building a modular and scalable user interface. The vast ecosystem and community support ensure solutions are readily available for common problems.
    *   **Why TypeScript?** Static typing helps catch errors early in development, improves code quality, and makes the application easier to maintain and refactor as it grows. It is particularly useful for defining the data structures for musician inputs and recommendations.

*   **Styling: Bootstrap 5 & Material Design Principles**
    *   **Why Bootstrap?** It provides a robust, mobile-first grid system and a set of pre-built components that accelerate development. We will heavily customize it to create a unique look.
    *   **Why Material Design?** We will use Material Design as a guiding philosophy for UI/UX. This means focusing on clean layouts, intuitive interactions, and meaningful motion. We will use a library like `react-bootstrap` to easily integrate Bootstrap components into our React application.

*   **State Management: React Context API**
    *   **Why Context API?** For the MVP's scope, the built-in Context API is sufficient for managing global state, such as the user's inputs and the generated recommendations. It avoids the need for external libraries like Redux, keeping the application lightweight. The context will provide a state object `{ musicianInput, recommendations }` and a dispatcher function to update them.

*   **Build Tool: Vite**
    *   **Why Vite?** Modern, fast build tool that provides excellent developer experience with hot module replacement, faster build times, and better performance than Create React App (which is now deprecated). Vite has built-in TypeScript support and works seamlessly with React.

*   **Testing: Vitest & React Testing Library**
    *   **Why this stack?** Vitest is Vite's native testing solution that provides Jest-compatible APIs with better performance. React Testing Library encourages testing practices that resemble how users interact with the application, leading to more robust and maintainable tests.

*   **Deployment: GitHub Pages**
    *   **Why GitHub Pages?** It offers free, reliable hosting for static websites directly from a GitHub repository, which is perfect for our backend-less MVP.

## 2. Detailed Project Structure

```
/
├── .github/workflows/         # CI/CD workflows (e.g., for deploying to GitHub Pages)
│   └── deploy.yml
├── docs/                      # Project documentation (you are here)
├── public/                    # Static assets
│   ├── index.html             # Main HTML entry point
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── assets/                # Images, icons, etc.
│   ├── components/            # Reusable React components
│   │   ├── MusicianForm/      # The main input form component
│   │   │   ├── MusicianForm.tsx
│   │   │   └── MusicianForm.module.css
│   │   ├── Recommendation/    # Component to display a single recommendation
│   │   │   ├── Recommendation.tsx
│   │   │   └── Recommendation.module.css
│   │   └── common/            # Common UI elements (buttons, inputs)
│   ├── context/               # React Context for state management
│   │   └── AppContext.tsx
│   ├── core/                  # Core application logic
│   │   ├── recommendationEngine.ts # The algorithm for generating advice
│   │   └── types.ts           # TypeScript type definitions (e.g., MusicianProfile)
│   ├── hooks/                 # Custom React hooks
│   ├── App.tsx                # Main application component, routes, and layout
│   ├── index.tsx              # Application entry point
│   └── setupTests.ts          # Test setup and configuration
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Client-Side Logic & Recommendation Engine

The core logic is contained entirely on the client.

*   **State Management:** `AppContext.tsx` will define a context that provides the musician's input data and the resulting recommendations to the entire component tree.
*   **Recommendation Engine (`recommendationEngine.ts`):** This module will contain the primary logic. It will be a function that accepts a `MusicianProfile` object and returns an array of `Recommendation` objects. The logic will be a series of `if/else if/else` statements based on a weighted scoring system.

    *   **Example Rule:**
        ```typescript
        if (profile.performanceFrequency === 'monthly' && profile.crowdSize < 20) {
            recommendations.push({
                id: 'MKT_01',
                title: 'Boost Your Local Presence',
                description: 'Your monthly gigs are a great foundation. To grow your audience, focus on local promotion. Create posters for local cafes, engage with local music bloggers on social media, and consider running a small ad campaign targeting your city.'
            });
        }
        ```

## 4. Testing Strategy

We will aim for a high level of test coverage to ensure reliability.

*   **Unit Tests (`*.test.ts`):**
    *   **Target:** The `recommendationEngine.ts` module.
    *   **Example Case:** Create mock `MusicianProfile` objects representing different musician archetypes (e.g., "Hobbyist," "Aspiring Pro," "Weekend Warrior") and assert that the engine produces the expected recommendations for each.

*   **Component Tests (`*.test.tsx`):**
    *   **Target:** Individual components like `MusicianForm` and `Recommendation`.
    *   **Example Case:** Render the `MusicianForm` component, simulate user input into the form fields using React Testing Library's `fireEvent`, and verify that the component's state updates correctly.

*   **Integration Tests:**
    *   **Target:** The full user flow.
    *   **Example Case:** Render the main `App` component. Simulate a user filling out the `MusicianForm`, clicking the "Get Advice" button, and assert that the `Recommendation` components are rendered with the correct advice based on the form inputs. This will test the integration between the form, the context, and the recommendation display.

Tests will be run via the `npm test` command.

## 5. File Organization Philosophy and Scalability

The file structure outlined in section 2 follows a conventional "group-by-type" approach. This is a common and effective pattern for many React projects, but it's worth analyzing its trade-offs and considering alternatives as the project scales.

### Current Approach: Group by Type

In this model, files are grouped by their *kind* or *technical role*:

-   `components/`: All React components.
-   `hooks/`: All custom React hooks.
-   `core/`: All core business logic.
-   `context/`: All React contexts.

**Advantages:**
*   **Familiarity:** This is a widely understood pattern, making it easy for new developers to join the project.
*   **Easy to Find by Type:** If you need to find a specific hook or context, you know exactly where to look.
*   **Good for Small Projects:** For the MVP, where the number of files is small, this structure is simple and sufficient.

**Disadvantages:**
*   **Low Cohesion:** Files that work together to implement a single feature are spread across the codebase. For example, to understand the `MusicianForm`, you might need to look in `components/`, `hooks/`, and `core/`.
*   **Scalability Issues:** As the app grows, these top-level folders can become bloated and difficult to navigate. Refactoring or deleting a feature requires hunting for files in multiple locations.

### Alternative Approach: Group by Feature (Feature-based Colocation)

A more scalable alternative is to group files by the *feature* they belong to.

**Example Structure:**

```
src/
├── components/            # Truly shared, generic components (Button, Input, Modal)
├── features/              # Top-level directory for all features
│   ├── musicianForm/
│   │   ├── MusicianForm.tsx
│   │   ├── MusicianForm.module.css
│   │   ├── useMusicianForm.ts   # Hook specific to this feature
│   │   └── MusicianForm.test.tsx
│   ├── recommendations/
│   │   ├── RecommendationsList.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── recommendations.module.css
│   │   └── recommendations.test.tsx
│   └── ...
├── core/                  # Truly global logic and types
│   ├── recommendationEngine.ts
│   └── types.ts
├── context/               # Global context
├── App.tsx
└── index.tsx
```

**Advantages:**
*   **High Cohesion & Colocation:** All the code for a single feature lives in one directory. This makes features easier to understand, develop, and maintain.
*   **Scalability:** The project scales by adding new feature folders, rather than bloating existing folders.
*   **Easier Refactoring/Deletion:** To remove a feature, you can simply delete its folder.

### Decision for MVP and Future Path

For the **MVP**, the initial **"group-by-type"** structure is appropriate. It is simple, conventional, and sufficient for the limited scope of the initial release.

However, as we move towards the **post-MVP roadmap** and begin adding features like user accounts, dashboards, and goal tracking, the codebase will benefit significantly from a **refactor towards a "group-by-feature" structure**. This proactive change will ensure the project remains maintainable and scalable in the long term. The transition can be done incrementally, one feature at a time.
