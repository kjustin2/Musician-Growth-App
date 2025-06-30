# Build and Deployment Guide

This document provides detailed instructions for building the Musician Growth App and deploying it to GitHub Pages.

## 1. Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Git](https://git-scm.com/)

## 2. Local Development

To run the application on your local machine for development and testing:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/musician-growth-app.git
    cd musician-growth-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will open the application in your default web browser at `http://localhost:5173` (Vite's default port). The server supports hot module replacement (HMR), so changes you make to the source code will be reflected instantly.

**Note:** Due to npm naming restrictions, the project uses lowercase naming (musician-growth-app) internally while maintaining the capitalized name for display purposes.

## 3. The Build Process

To create a production-ready version of the application, you will use the build script configured in `package.json`.

*   **Command:**
    ```bash
    npm run build
    ```
*   **What it does:**
    *   This command invokes Vite's build process.
    *   It bundles the React application using Rollup, optimizing it for performance.
    *   It transpiles the TypeScript code to JavaScript.
    *   It minifies the HTML, CSS, and JavaScript files.
    *   The final, static assets are placed in the `/dist` directory. This is the folder that will be deployed.

## 4. Deployment to GitHub Pages

We will use the `gh-pages` package to simplify deployment. This process is semi-automated.

### Step 4.1: One-Time Setup

1.  **Install `gh-pages`:**
    ```bash
    npm install gh-pages --save-dev
    ```

2.  **Update `package.json`:**
    Add the following properties to your `package.json` file:

    *   A `homepage` property, which tells Create React App where the app will be hosted. The format is `https://{username}.github.io/{repository-name}`.
        ```json
        "homepage": "https://your-username.github.io/musician-growth-app",
        ```

    *   `predeploy` and `deploy` scripts:
        ```json
        "scripts": {
          // ... other scripts
          "predeploy": "npm run build",
          "deploy": "gh-pages -d dist"
        }
        ```
        *   `predeploy`: This script automatically runs `npm run build` before deploying, ensuring you always deploy the latest version.
        *   `deploy`: This script takes the contents of the `dist` directory (`-d dist`) and pushes it to a special `gh-pages` branch in your GitHub repository. GitHub Pages automatically serves the content of this branch.

### Step 4.2: Deploying the Application

Once the setup is complete, deploying is a single command:

```bash
npm run deploy
```

After the script finishes, your application will be live at the URL specified in the `homepage` property.

## 5. Continuous Integration / Continuous Deployment (CI/CD)

For a more robust workflow, we will set up a GitHub Actions workflow to automate deployment.

*   **File:** `.github/workflows/deploy.yml`
*   **Trigger:** The workflow will trigger on every push to the `main` branch.
*   **Steps:**
    1.  **Checkout:** The action checks out the repository's code.
    2.  **Setup Node.js:** It installs the correct version of Node.js.
    3.  **Install Dependencies:** It runs `npm ci` for a clean, fast installation.
    4.  **Build:** It runs `npm run build` to create the production build.
    5.  **Deploy:** It uses a community action (like `peaceiris/actions-gh-pages`) to deploy the contents of the `dist` folder to the `gh-pages` branch.

This setup ensures that every time we merge a new feature into `main`, it is automatically deployed, streamlining the development lifecycle.