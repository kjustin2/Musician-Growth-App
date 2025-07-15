# Design Document

## Overview

The GitHub Pages deployment failure is caused by an explicitly declared Windows-specific Rollup dependency (`@rollup/rollup-win32-x64-msvc`) in the package.json devDependencies. This creates a platform incompatibility when GitHub Actions tries to install dependencies on Linux runners.

The solution involves removing the platform-specific dependency and allowing Vite/Rollup to automatically select the appropriate platform-specific binaries through its normal dependency resolution process.

## Architecture

### Current Problem
- `@rollup/rollup-win32-x64-msvc@4.45.1` is explicitly listed in devDependencies
- GitHub Actions runs on `ubuntu-latest` (Linux x64)
- npm ci fails because it tries to install a Windows-specific package on Linux

### Solution Architecture
- Remove explicit platform-specific Rollup dependencies
- Let Vite handle Rollup dependency resolution automatically
- Ensure the GitHub Actions workflow uses proper caching and error handling
- Maintain cross-platform compatibility for local development

## Components and Interfaces

### Package Dependencies
- **Current State**: Explicit `@rollup/rollup-win32-x64-msvc` dependency
- **Target State**: No explicit platform-specific dependencies
- **Behavior**: Vite will automatically install the correct Rollup binary for each platform

### GitHub Actions Workflow
- **Current State**: Basic workflow with npm ci, test, build, deploy
- **Target State**: Enhanced workflow with better error handling and caching
- **Components**:
  - Dependency installation with platform-agnostic packages
  - Test execution with proper exit codes
  - Build process with error handling
  - Deployment only on successful builds

### Build Process
- **Vite Configuration**: Already properly configured with base path for GitHub Pages
- **Rollup Integration**: Handled automatically by Vite
- **Output**: Static files in `dist/` directory ready for GitHub Pages

## Data Models

### Package.json Structure
```json
{
  "devDependencies": {
    // Remove: "@rollup/rollup-win32-x64-msvc": "^4.45.1"
    // Keep all other dependencies as-is
  }
}
```

### GitHub Actions Workflow Structure
```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node (with caching)
      - install-dependencies (npm ci)
      - run-tests (with proper exit handling)
      - build (npm run build)
      - deploy (conditional on main branch)
```

## Error Handling

### Dependency Installation Errors
- **Prevention**: Remove platform-specific dependencies
- **Detection**: npm ci will fail fast if incompatible packages exist
- **Recovery**: Automatic through proper dependency management

### Build Errors
- **Prevention**: Run tests before building
- **Detection**: Build process will exit with non-zero code on failure
- **Recovery**: Workflow will stop and report the specific error

### Deployment Errors
- **Prevention**: Only deploy on successful builds from main branch
- **Detection**: GitHub Actions will report deployment failures
- **Recovery**: Manual intervention required for deployment issues

## Testing Strategy

### Local Testing
- Test on Windows (current development environment)
- Verify `npm install`, `npm run dev`, `npm run build` work correctly
- Ensure no functionality is lost

### CI/CD Testing
- GitHub Actions will test on Linux environment
- Automated test suite runs before deployment
- Build verification ensures artifacts are created correctly

### Cross-Platform Verification
- Package installation works on both Windows and Linux
- Build outputs are identical across platforms
- No platform-specific code or dependencies remain

## Implementation Approach

### Phase 1: Dependency Cleanup
1. Remove the explicit Windows-specific Rollup dependency
2. Verify local development still works
3. Test that Vite automatically handles Rollup dependencies

### Phase 2: Workflow Enhancement
1. Ensure GitHub Actions workflow is robust
2. Add proper error handling and reporting
3. Verify caching is working correctly

### Phase 3: Verification
1. Test deployment on a feature branch first
2. Verify the deployed application works correctly
3. Monitor for any remaining platform-specific issues

## Technical Decisions

### Why Remove Platform-Specific Dependencies
- Vite automatically manages Rollup dependencies based on the target platform
- Explicit platform-specific dependencies create unnecessary constraints
- Modern build tools handle cross-platform compatibility automatically

### Why Keep Current Workflow Structure
- The existing workflow is well-structured
- Only the dependency issue needs to be resolved
- Minimal changes reduce risk of introducing new issues

### Why Use npm ci in CI/CD
- `npm ci` is designed for automated environments
- Faster and more reliable than `npm install`
- Uses package-lock.json for reproducible builds