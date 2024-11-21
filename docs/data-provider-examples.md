```
// Example 1: Basic CRUD Operations with Projects
import { useProjects } from '@/providers/DataProvider';
import type { Project, ProjectType, ProjectStatus } from '@/types/data';

function ProjectManager() {
  const {
    create,
    get,
    query,
    update,
    remove,
    isLoading,
    operationError
  } = useProjects();

  // Create a new project
  const handleCreateProject = async () => {
    try {
      const newProject = await create<Project>({
        title: "New Project",
        type: ProjectType.PRODUCT,
        status: ProjectStatus.PLANNING,
        startDate: new Date().toISOString(),
        requirementIds: [],
        regulationIds: [],
        members: [],
        ownerId: "user123",
        permissions: {
          view: ["user123"],
          edit: ["user123"],
          admin: ["user123"],
          public: false
        }
      });
      console.log('Created project:', newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Get a specific project
  const handleGetProject = async (id: string) => {
    const project = await get<Project>(id);
    if (project) {
      console.log('Retrieved project:', project);
    }
  };

  // Query projects with filters and pagination
  const handleQueryProjects = async () => {
    const queryConfig = [
      {
        field: 'status',
        operator: '==',
        value: ProjectStatus.ACTIVE
      },
      {
        field: 'type',
        operator: '==',
        value: ProjectType.PRODUCT
      }
    ];

    const paginationConfig = {
      limit: 10,
      orderBy: {
        field: 'createdAt',
        direction: 'desc'
      }
    };

    const { items, lastDoc, hasMore } = await query<Project>(
      queryConfig,
      paginationConfig
    );
    console.log('Query results:', items, 'Has more:', hasMore);
  };

  // Update a project
  const handleUpdateProject = async (id: string) => {
    const updates = {
      title: "Updated Title",
      status: ProjectStatus.ACTIVE
    };
    const updated = await update<Project>(id, updates);
    console.log('Updated project:', updated);
  };

  // Delete a project
  const handleDeleteProject = async (id: string) => {
    await remove(id);
    console.log('Project deleted');
  };
}

// Example 2: Real-time Subscriptions and Error Handling
function ProjectMonitor() {
  const { subscribe, clearError, operationError } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Subscribe to active projects
    const queryConfig = [{
      field: 'status',
      operator: '==',
      value: ProjectStatus.ACTIVE
    }];

    const unsubscribe = subscribe<Project>(
      null, // null for collection subscription
      (data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      },
      queryConfig
    );

    return () => unsubscribe();
  }, []);

  // Error handling
  useEffect(() => {
    if (operationError) {
      toast.error(`Error: ${operationError.message}`);
      clearError();
    }
  }, [operationError]);
}

// Example 3: Batch Operations and Atomic Updates
function ProjectBatchManager() {
  const { executeBatch, incrementField, appendToArray, removeFromArray } = useProjects();

  // Execute batch operations
  const handleBatchOperations = async () => {
    const operations = [
      {
        type: 'create' as const,
        collection: 'projects',
        data: {
          title: "New Project 1",
          type: ProjectType.PRODUCT,
          status: ProjectStatus.PLANNING
        }
      },
      {
        type: 'update' as const,
        collection: 'projects',
        id: 'existing-id',
        data: {
          status: ProjectStatus.ACTIVE
        }
      },
      {
        type: 'delete' as const,
        collection: 'projects',
        id: 'to-delete-id'
      }
    ];

    await executeBatch(operations);
  };

  // Atomic field operations
  const handleAtomicOperations = async (projectId: string) => {
    // Increment a numeric field
    await incrementField(projectId, 'visitCount', 1);

    // Add members to array
    await appendToArray(projectId, 'members', ['user456']);

    // Remove members from array
    await removeFromArray(projectId, 'members', ['user123']);
  };
}

// Example 4: Working with Requirements and Regulations
function RequirementManager() {
  const {
    create: createRequirement,
    query: queryRequirements,
    update: updateRequirement
  } = useRequirements();

  const {
    create: createRegulation,
    get: getRegulation
  } = useRegulations();

  // Create linked requirement and regulation
  const handleCreateLinked = async () => {
    // Create regulation first
    const regulation = await createRegulation({
      title: "Security Protocol",
      content: "# Security Requirements\n\n1. Data encryption...",
      version: 1,
      projectId: "project123",
      format: DocumentFormat.MARKDOWN
    });

    // Create requirement linking to regulation
    const requirement = await createRequirement({
      title: "Implement Security Protocol",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      projectId: "project123",
      regulationIds: [regulation.id],
      permissions: {
        view: ["team123"],
        edit: ["team123"],
        admin: ["user123"],
        public: false
      }
    });

    console.log('Created linked documents:', { requirement, regulation });
  };
}

// Example 5: Complex Queries and Updates
function AdvancedProjectManager() {
  const { query, update } = useProjects();

  // Complex query with multiple conditions
  const handleComplexQuery = async () => {
    const queryConfig = [
      {
        field: 'status',
        operator: 'in',
        value: [ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD]
      },
      {
        field: 'members',
        operator: 'array-contains',
        value: 'user123'
      },
      {
        field: 'type',
        operator: '==',
        value: ProjectType.PRODUCT
      }
    ];

    const { items } = await query<Project>(queryConfig);
    console.log('Complex query results:', items);
  };

  // Complex update with atomic operations
  const handleComplexUpdate = async (projectId: string) => {
    const updates = [
      {
        field: 'visitCount',
        operation: 'increment' as const,
        value: 1
      },
      {
        field: 'members',
        operation: 'append' as const,
        value: ['user789']
      },
      {
        field: 'status',
        operation: 'set' as const,
        value: ProjectStatus.ACTIVE
      }
    ];

    const updated = await update<Project>(projectId, updates);
    console.log('Complex update result:', updated);
  };
}

// Example 6: Loading and Error States
function LoadingStateExample() {
  const { query, isLoading, operationError } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { items } = await query<Project>();
        setProjects(items);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    loadProjects();
  }, []);

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (operationError) {
    return (
      <div className="error">
        Error: {operationError.message}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}

// Example 7: Combining Multiple Collections
function ProjectDashboard() {
  const { get: getProject } = useProjects();
  const { query: queryRequirements } = useRequirements();
  const { query: queryRegulations } = useRegulations();

  const loadProjectData = async (projectId: string) => {
    // Load project details
    const project = await getProject<Project>(projectId);
    
    if (!project) return null;

    // Load associated requirements
    const { items: requirements } = await queryRequirements<Requirement>([
      {
        field: 'projectId',
        operator: '==',
        value: projectId
      }
    ]);

    // Load associated regulations
    const { items: regulations } = await queryRegulations<Regulation>([
      {
        field: 'projectId',
        operator: '==',
        value: projectId
      }
    ]);

    return {
      project,
      requirements,
      regulations
    };
  };
}
```

### Instruction for AI when using the DataProvider:

When using the DataProvider:

1. Import the appropriate hook for your collection:
   - useProjects() for projects
   - useRequirements() for requirements
   - useRegulations() for regulations

2. Handle loading states using the isLoading flag

3. Handle errors using the operationError object

4. Use appropriate TypeScript types for your data

5. Remember to clean up subscriptions in useEffect

6. Use batch operations for atomic updates across multiple documents

7. Use atomic operations (incrementField, appendToArray, removeFromArray) 
   for concurrent-safe updates

8. Always handle errors in try-catch blocks

9. Use proper cleanup and error boundaries in your components

10. Consider implementing retry logic for failed operations

The examples above demonstrate all common patterns and best practices
for working with the DataProvider.

