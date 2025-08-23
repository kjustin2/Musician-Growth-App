# Database Layer

This is a simplified, extensible database layer built on Dexie (IndexedDB) with reactive Svelte stores.

## Architecture

- **types.ts** - Entity type definitions
- **validation.ts** - Validation functions and error handling
- **db.ts** - Database setup, services, and base classes

## Adding New Entities

Adding a new entity is straightforward:

### 1. Define the Type

```typescript
// In types.ts
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  userId: number;
  status: 'active' | 'completed' | 'archived';
}

export type CreateProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProject = Partial<Omit<Project, 'id' | 'createdAt'>>;
```

### 2. Add Validation

```typescript
// In validation.ts
export const validateProject = (data: any): void => {
  if (!validators.nonEmptyString(data.name)) {
    throw new ValidationError('Project name is required');
  }
  if (!validators.positiveNumber(data.userId)) {
    throw new ValidationError('Valid user ID is required');
  }
  if (data.status && !['active', 'completed', 'archived'].includes(data.status)) {
    throw new ValidationError('Status must be active, completed, or archived');
  }
};
```

### 3. Create Service Class

```typescript
// In db.ts
export class ProjectService extends EntityService<Project, CreateProject, UpdateProject> {
  constructor() {
    super(db.projects, 'Project', validateProject);
  }

  async findByUser(userId: number): Promise<Project[]> {
    return await db.projects.where('userId').equals(userId).toArray();
  }

  async findByStatus(status: string): Promise<Project[]> {
    return await db.projects.where('status').equals(status).toArray();
  }
}

export const projectService = new ProjectService();
export const projects = projectService.store;
```

### 4. Update Database Schema

```typescript
// In AppDatabase constructor
this.version(1).stores({
  users: '++id, email, createdAt',
  items: '++id, name, description, createdAt',
  projects: '++id, name, userId, status, createdAt', // Add this line
});
```

### 5. Add Table Property

```typescript
// In AppDatabase class
class AppDatabase extends Dexie {
  users!: Table<User>;
  items!: Table<Item>;
  projects!: Table<Project>; // Add this line
}
```

That's it! Your new entity is fully functional with:

- ✅ CRUD operations
- ✅ Validation
- ✅ Reactive Svelte store
- ✅ Type safety
- ✅ Logging
- ✅ Automatic timestamps

## Usage Examples

```typescript
// Create
const projectId = await projectService.add({
  name: 'My Project',
  description: 'A cool project',
  userId: 1,
  status: 'active',
});

// Read
const project = await projectService.get(projectId);
const userProjects = await projectService.findByUser(1);

// Update
await projectService.update(projectId, { status: 'completed' });

// Delete
await projectService.delete(projectId);

// Reactive UI (Svelte)
import { projects } from '$lib/database/db.js';
// $projects automatically updates when data changes
```

## Benefits

- **Simple**: No complex abstractions or boilerplate
- **Type-safe**: Full TypeScript support
- **Reactive**: Automatic UI updates via Svelte stores
- **Extensible**: Easy to add new entities
- **Performant**: Direct Dexie operations with minimal overhead
- **Maintainable**: Clear, focused code structure
