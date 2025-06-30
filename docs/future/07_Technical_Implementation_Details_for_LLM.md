<!-- Summary: This document provides detailed technical implementation insights for the Musician Growth App, focusing on the "Path to Stardom" features. It includes data models, backend logic snippets (NestJS), frontend component examples (React), API endpoint definitions, and testing strategies, all structured for easy understanding by a Large Language Model (LLM) for implementation purposes. -->
# 07_Technical_Implementation_Details_for_LLM

This document serves as a deep dive into the technical implementation aspects of the Musician Growth App, particularly focusing on the "Path to Stardom" features. It is structured to provide clear, actionable insights and code examples for a Large Language Model (LLM) tasked with implementing these features.

## 1. Data Models (Prisma Schema & TypeScript Interfaces)

Our core data models will define the structure of user data, roadmaps, tasks, and progress tracking. We will use Prisma for our ORM, so the schema is defined in `schema.prisma`.

### 1.1. `User` Model

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  profile       Profile?  // One-to-one relation with Profile
  userProgress  UserTaskProgress[] // One-to-many relation with UserTaskProgress
  goals         Goal[]
}
```

### 1.2. `Profile` Model

```prisma
// prisma/schema.prisma
model Profile {
  id            String    @id @default(uuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  artistName    String
  instrument    String?
  performanceFrequency String?
  averageCrowdSize Int?
  yearsExperience Int?
  marketingEfforts String[] // Array of strings for marketing activities
  currentStats  Json?     // Flexible JSON field for dynamic stats (e.g., streaming numbers)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 1.3. `Roadmap` Model (Templates)

```prisma
// prisma/schema.prisma
model Roadmap {
  id            String    @id @default(uuid())
  name          String    @unique
  description   String?
  isPublic      Boolean   @default(true)
  stages        RoadmapStage[] // One-to-many relation with RoadmapStage
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 1.4. `RoadmapStage` Model

```prisma
// prisma/schema.prisma
model RoadmapStage {
  id            String    @id @default(uuid())
  roadmapId     String
  roadmap       Roadmap   @relation(fields: [roadmapId], references: [id])
  title         String
  description   String?
  order         Int
  tasks         Task[]    // One-to-many relation with Task
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 1.5. `Task` Model

```prisma
// prisma/schema.prisma
model Task {
  id            String    @id @default(uuid())
  stageId       String
  stage         RoadmapStage @relation(fields: [stageId], references: [id])
  title         String
  description   String?
  taskType      String    // e.g., 'CHECKLIST', 'DATA_INPUT', 'INFO'
  metadata      Json?     // Flexible JSON for task-specific data (e.g., checklist items, input field definitions)
  userProgress  UserTaskProgress[] // One-to-many relation with UserTaskProgress
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 1.6. `UserTaskProgress` Model

```prisma
// prisma/schema.prisma
model UserTaskProgress {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  taskId        String
  task          Task      @relation(fields: [taskId], references: [id])
  status        String    // 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
  progressData  Json?     // Stores dynamic data for the task (e.g., completed checklist items, input values)
  completedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([userId, taskId]) // A user can only have one progress entry per task
}
```

## 2. Backend Logic (NestJS Snippets)

### 2.1. `RoadmapService` (Core Logic for Roadmap Management)

```typescript
// src/roadmaps/roadmaps.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Profile, Roadmap, RoadmapStage, Task, UserTaskProgress } from '@prisma/client';

@Injectable()
export class RoadmapsService {
  constructor(private prisma: PrismaService) {}

  async assignRoadmapToUser(userId: string, roadmapId: string): Promise<UserTaskProgress[]> {
    // Logic to assign all tasks from a roadmap to a user with 'NOT_STARTED' status
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { stages: { include: { tasks: true } } },
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap with ID ${roadmapId} not found`);
    }

    const userTasksToCreate = roadmap.stages.flatMap(stage =>
      stage.tasks.map(task => ({
        userId: userId,
        taskId: task.id,
        status: 'NOT_STARTED',
        progressData: {},
      })),
    );

    // Use a transaction to ensure all tasks are assigned or none are
    return this.prisma.$transaction(
      userTasksToCreate.map(data => this.prisma.userTaskProgress.create({ data })),
    );
  }

  async getUserRoadmapProgress(userId: string): Promise<any> {
    // Retrieve a user's progress across all their assigned tasks
    return this.prisma.userTaskProgress.findMany({
      where: { userId: userId },
      include: { task: { include: { stage: { include: { roadmap: true } } } } },
      orderBy: { task: { stage: { order: 'asc' } } },
    });
  }

  async getRecommendedRoadmap(profile: Profile): Promise<Roadmap> {
    // Simplified AI-powered recommendation logic (placeholder)
    // In a real scenario, this would involve more complex ML models
    if (profile.yearsExperience < 2 && profile.performanceFrequency === 'Never / Just Practice') {
      return this.prisma.roadmap.findUnique({ where: { name: 'Beginner Musician Journey' } });
    } else if (profile.averageCrowdSize < 50 && profile.marketingEfforts.includes('None of the above')) {
      return this.prisma.roadmap.findUnique({ where: { name: 'Marketing & Fanbase Growth' } });
    }
    // Fallback or more complex logic
    return this.prisma.roadmap.findFirst();
  }
}
```

### 2.2. `UserProgressController` (Handling Task Completion)

```typescript
// src/user-progress/user-progress.controller.ts
import { Controller, Post, Param, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProgressService } from './user-progress.service';
import { UpdateUserTaskProgressDto } from './dto/update-user-task-progress.dto';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private userProgressService: UserProgressService) {}

  @Patch(':taskId')
  async updateTaskProgress(
    @Param('taskId') taskId: string,
    @Req() req,
    @Body() updateUserTaskProgressDto: UpdateUserTaskProgressDto,
  ) {
    const userId = req.user.id; // Assuming user ID is attached to request by JwtAuthGuard
    return this.userProgressService.updateTaskProgress(userId, taskId, updateUserTaskProgressDto);
  }

  @Post('assign-roadmap/:roadmapId')
  async assignRoadmap(@Param('roadmapId') roadmapId: string, @Req() req) {
    const userId = req.user.id;
    return this.userProgressService.assignRoadmap(userId, roadmapId);
  }
}
```

### 2.3. `UserProgressService` (Service for User Progress Logic)

```typescript
// src/user-progress/user-progress.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserTaskProgressDto } from './dto/update-user-task-progress.dto';
import { UserTaskProgress } from '@prisma/client';

@Injectable()
export class UserProgressService {
  constructor(private prisma: PrismaService) {}

  async updateTaskProgress(
    userId: string,
    taskId: string,
    updateDto: UpdateUserTaskProgressDto,
  ): Promise<UserTaskProgress> {
    const existingProgress = await this.prisma.userTaskProgress.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (!existingProgress) {
      throw new NotFoundException(`Progress for task ${taskId} not found for user ${userId}`);
    }

    // Example: Logic for marking a task as completed
    if (updateDto.status === 'COMPLETED' && existingProgress.status !== 'COMPLETED') {
      return this.prisma.userTaskProgress.update({
        where: { id: existingProgress.id },
        data: { status: 'COMPLETED', completedAt: new Date(), progressData: updateDto.progressData || {} },
      });
    } else if (updateDto.status === 'IN_PROGRESS') {
      return this.prisma.userTaskProgress.update({
        where: { id: existingProgress.id },
        data: { status: 'IN_PROGRESS', progressData: updateDto.progressData || {} },
      });
    }
    throw new BadRequestException('Invalid status update or task already completed.');
  }

  async assignRoadmap(userId: string, roadmapId: string): Promise<UserTaskProgress[]> {
    // This would call the RoadmapsService to get tasks and assign them
    // For simplicity, assuming RoadmapsService handles the actual assignment logic
    // and returns the created UserTaskProgress records.
    // In a real app, this service would orchestrate calls to RoadmapsService.
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { stages: { include: { tasks: true } } },
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap with ID ${roadmapId} not found`);
    }

    const userTasksToCreate = roadmap.stages.flatMap(stage =>
      stage.tasks.map(task => ({
        userId: userId,
        taskId: task.id,
        status: 'NOT_STARTED',
        progressData: {},
      })),
    );

    return this.prisma.$transaction(
      userTasksToCreate.map(data => this.prisma.userTaskProgress.create({ data })),
    );
  }
}
```

## 3. Frontend Components (React Snippets)

### 3.1. `MusicianProfileForm.tsx` (Simplified)

```tsx
// src/components/MusicianProfileForm/MusicianProfileForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext for user ID

interface MusicianProfileFormProps {
  onSubmit: (profileData: any) => void;
  initialData?: any;
}

const MusicianProfileForm: React.FC<MusicianProfileFormProps> = ({ onSubmit, initialData }) => {
  const { user } = useAuth();
  const [instrument, setInstrument] = useState(initialData?.instrument || '');
  const [performanceFrequency, setPerformanceFrequency] = useState(initialData?.performanceFrequency || '');
  // ... other state variables for form fields

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSubmit({
        userId: user.id,
        instrument,
        performanceFrequency,
        // ... other form data
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Instrument:
        <input type="text" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
      </label>
      <label>
        Performance Frequency:
        <select value={performanceFrequency} onChange={(e) => setPerformanceFrequency(e.target.value)}>
          <option value="">Select...</option>
          <option value="Never">Never</option>
          <option value="Monthly">Monthly</option>
          {/* ... other options */}
        </select>
      </label>
      {/* ... other form fields */}
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default MusicianProfileForm;
```

### 3.2. `RoadmapDisplay.tsx` (Simplified)

```tsx
// src/components/RoadmapDisplay/RoadmapDisplay.tsx
import React from 'react';
import { Task, UserTaskProgress } from '@prisma/client'; // Re-using Prisma types for frontend

interface RoadmapDisplayProps {
  roadmapStages: Array<{
    id: string;
    title: string;
    tasks: Array<Task & { userProgress?: UserTaskProgress }>;
  }>;
  onTaskStatusChange: (taskId: string, newStatus: string, progressData?: any) => void;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmapStages, onTaskStatusChange }) => {
  return (
    <div className="roadmap-container">
      {roadmapStages.map(stage => (
        <div key={stage.id} className="roadmap-stage">
          <h2>{stage.title}</h2>
          <div className="tasks-list">
            {stage.tasks.map(task => (
              <div key={task.id} className={`task-item status-${task.userProgress?.status || 'NOT_STARTED'}`}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                {task.taskType === 'CHECKLIST' && (
                  <input
                    type="checkbox"
                    checked={task.userProgress?.status === 'COMPLETED'}
                    onChange={(e) => onTaskStatusChange(task.id, e.target.checked ? 'COMPLETED' : 'IN_PROGRESS')}
                  />
                )}
                {/* Render other task types (DATA_INPUT) based on task.metadata */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoadmapDisplay;
```

## 4. API Endpoints

Here are examples of key REST API endpoints that the frontend would interact with:

*   **`POST /auth/register`:** Register a new user.
*   **`POST /auth/login`:** Authenticate user and return JWT.
*   **`GET /profiles/:userId`:** Get a user's profile.
*   **`PATCH /profiles/:userId`:** Update a user's profile.
*   **`GET /roadmaps`:** Get a list of available roadmap templates.
*   **`POST /user-progress/assign-roadmap/:roadmapId`:** Assign a specific roadmap to the authenticated user.
*   **`GET /user-progress`:** Get the authenticated user's current roadmap progress.
*   **`PATCH /user-progress/:taskId`:** Update the status or data for a specific task for the authenticated user.
    *   **Request Body Example (`UpdateUserTaskProgressDto`):**
        ```json
        {
          "status": "COMPLETED",
          "progressData": {
            "checklistItemsCompleted": ["item1", "item2"],
            "streamingNumbers": {"spotify": 1500, "appleMusic": 800}
          }
        }
        ```
*   **`GET /recommendations`:** Get personalized recommendations for the authenticated user based on their progress.

## 5. Testing Strategy (Code Examples)

### 5.1. Backend Unit Test (NestJS Service)

```typescript
// src/roadmaps/roadmaps.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapsService } from './roadmaps.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoadmapsService', () => {
  let service: RoadmapsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        {
          provide: PrismaService,
          useValue: {
            roadmap: {
              findUnique: jest.fn(),
            },
            userTaskProgress: {
              create: jest.fn(),
            },
            $transaction: jest.fn(x => x), // Mock transaction to just return the array
          },
        },
      ],
    }).compile();

    service = module.get<RoadmapsService>(RoadmapsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignRoadmapToUser', () => {
    it('should assign all tasks from a roadmap to a user', async () => {
      const mockRoadmap = {
        id: 'roadmap1',
        name: 'Test Roadmap',
        stages: [
          { id: 'stage1', tasks: [{ id: 'task1' }, { id: 'task2' }] },
          { id: 'stage2', tasks: [{ id: 'task3' }] },
        ],
      };
      (prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(mockRoadmap);
      (prisma.userTaskProgress.create as jest.Mock).mockImplementation(data => data);

      const result = await service.assignRoadmapToUser('user1', 'roadmap1');

      expect(result).toHaveLength(3);
      expect(prisma.userTaskProgress.create).toHaveBeenCalledTimes(3);
      expect(result[0].userId).toBe('user1');
      expect(result[0].status).toBe('NOT_STARTED');
    });

    it('should throw NotFoundException if roadmap not found', async () => {
      (prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.assignRoadmapToUser('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 5.2. Frontend Component Test (React Testing Library)

```tsx
// src/components/MusicianProfileForm/MusicianProfileForm.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicianProfileForm from './MusicianProfileForm';
import { AuthContext } from '../../context/AuthContext'; // Mock AuthContext

describe('MusicianProfileForm', () => {
  const mockOnSubmit = jest.fn();
  const mockUser = { id: 'user123', email: 'test@example.com' };

  it('renders correctly with initial data', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <MusicianProfileForm onSubmit={mockOnSubmit} initialData={{ instrument: 'Guitar' }} />
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/Instrument:/i)).toHaveValue('Guitar');
  });

  it('submits form with correct data', () => {
    render(
      <AuthContext.Provider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <MusicianProfileForm onSubmit={mockOnSubmit} />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Instrument:/i), { target: { value: 'Drums' } });
    fireEvent.change(screen.getByLabelText(/Performance Frequency:/i), { target: { value: 'Weekly' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      userId: 'user123',
      instrument: 'Drums',
      performanceFrequency: 'Weekly',
    });
  });
});
```

## 6. Clean Code Practices in Action

Throughout the implementation, we will adhere to the following clean code principles:

*   **Single Responsibility Principle (SRP):** Services (`RoadmapsService`, `UserProgressService`) handle business logic, while controllers (`UserProgressController`) handle HTTP requests. Components (`MusicianProfileForm`, `RoadmapDisplay`) are responsible for UI rendering.
*   **Dependency Injection:** NestJS's built-in DI system is used to inject `PrismaService` and other services, promoting loose coupling and testability.
*   **Modularity:** Code is organized into logical modules (e.g., `roadmaps`, `user-progress`, `prisma`) to improve maintainability.
*   **Type Safety:** Extensive use of TypeScript interfaces and Prisma-generated types ensures type safety across the application, reducing runtime errors.
*   **Error Handling:** Controllers and services include explicit error handling for common scenarios (e.g., `NotFoundException`, `BadRequestException`).
*   **Readability:** Clear variable names, concise function bodies, and consistent formatting are prioritized.
