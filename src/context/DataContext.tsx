import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useCallback,
	useRef,
	useState,
} from "react";
import { useUser } from "@/context/UserContext";
import { FirebaseDataService } from "@/services/dataService";
import { db } from "@/lib/firebase/config";
import type {
	Collection,
	DataContextState,
	DataOperationError,
	QueryConfig,
	PaginationConfig,
	PaginatedResult,
	BatchOperation,
	CollectionName,
	UpdateOperation,
} from "@/types/data";
import { useCacheStore } from "@/lib/cacheStore";
import { DEFAULT_CACHE_CONFIG } from "@/lib/cacheStore";
import type { Project, Requirement, Regulation } from "@/types/data";
import { WhereFilterOp } from "firebase/firestore";

interface SelectionState {
	currentUserId: string | null;
	currentProjectId?: string | null;
	currentRequirementId?: string | null;
	currentRegulationId?: string | null;
	currentProject?: Project | null;
	currentRequirement?: Requirement | null;
	currentRegulation?: Regulation | null;
}

interface DataContextValue extends DataContextState, SelectionState {
	// CRUD Operations
	create: <T extends Collection>(
		collection: CollectionName,
		data: Partial<T>
	) => Promise<T>;
	get: <T extends Collection>(
		collection: CollectionName,
		id: string
	) => Promise<T | null>;
	query: <T extends Collection>(
		collection: CollectionName,
		queryConfig?: QueryConfig[],
		paginationConfig?: PaginationConfig
	) => Promise<PaginatedResult<T>>;
	update: <T extends Collection>(
		collection: CollectionName,
		id: string,
		updates: Partial<T> | UpdateOperation<T>[]
	) => Promise<T>;
	remove: (collection: CollectionName, id: string) => Promise<void>;

	// Batch Operations
	executeBatch: <T extends Collection>(
		operations: BatchOperation<T>[]
	) => Promise<void>;

	// Atomic Operations
	incrementField: <T extends Collection>(
		collection: CollectionName,
		id: string,
		field: keyof T,
		value: number
	) => Promise<T>;
	appendToArray: <T extends Collection>(
		collection: CollectionName,
		id: string,
		field: keyof T,
		elements: any[] | any
	) => Promise<T>;
	removeFromArray: <T extends Collection>(
		collection: CollectionName,
		id: string,
		field: keyof T,
		elements: any[] | any
	) => Promise<T>;

	// Real-time Subscriptions
	subscribe: <T extends Collection>(
		collection: CollectionName,
		id: string | null,
		callback: (data: T | T[] | null) => void,
		queryConfig?: QueryConfig[]
	) => () => void;

	// Prefetch Collection
	prefetchCollection: <T extends Collection>(
		collection: CollectionName,
		queryConfig?: QueryConfig[]
	) => Promise<void>;

	setCurrentProject: (projectId: string | null) => Promise<void>;
	setCurrentRequirement: (requirementId: string | null) => Promise<void>;
	clearCurrentSelections: () => void;

	// Error Management
	clearError: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
	children: React.ReactNode;
	cacheConfig?: {
		ttl: number;
		maxSize: number;
		priority: "low" | "medium" | "high";
	};
}

export function DataProvider({ children, cacheConfig }: DataProviderProps) {
	const { userData } = useUser();
	const dataServiceRef = useRef<FirebaseDataService | null>(null);
	const [state, setState] = React.useState<DataContextState>({
		isLoading: false,
		isInitialized: false,
		operationError: null,
		cachedData: new Map(),
	});
	// Add selection state
	const [selectionState, setSelectionState] = useState<SelectionState>({
		currentUserId: userData?.uid || null,
		currentProjectId: null,
		currentRequirementId: null,
		currentRegulationId: null,
		currentProject: null,
		currentRequirement: null,
		currentRegulation: null,
	});

	const {
		initialize,
		setLoading,
		setError,
		isInitialized,
		setCache,
		getCache,
		invalidateCache,
		setCurrentProjectId,
		setCurrentRequirementId,
		setCurrentProject,
		setCurrentRequirement,
	} = useCacheStore();

	// Error handling wrapper
	const handleOperation = useCallback(
		async <T,>(
			operation: () => Promise<T>,
			operationName: string
		): Promise<T> => {
			if (!state.isInitialized) {
				throw new Error(
					"Data service not initialized. Please wait for initialization to complete."
				);
			}

			// Set loading state only if we're not already loading
			if (!state.isLoading) {
				setState((prev) => ({
					...prev,
					isLoading: true,
					operationError: null,
				}));
			}

			try {
				const result = await operation();
				setState((prev) => ({ ...prev, isLoading: false }));
				return result;
			} catch (error) {
				const dataError: DataOperationError = {
					message:
						error instanceof Error
							? error.message
							: "Unknown error occurred",
					operation: operationName,
					timestamp: new Date().toISOString(),
				};
				setState((prev) => ({
					...prev,
					isLoading: false,
					operationError: dataError,
				}));
				throw error;
			}
		},
		[state.isInitialized, state.isLoading]
	);

	// Selection methods
	const handleSetCurrentProject = useCallback(
		async (projectId: string | null) => {
			setLoading(true);
			try {
				if (!projectId) {
					setSelectionState((prev) => ({
						...prev,
						currentProjectId: null,
						currentProject: null,
					}));
					setCurrentProjectId(null);
					setCurrentProject(null);
					return;
				}

				// Try to get from cache first
				let project = getCache<Project>("projects", projectId);

				// If not in cache, fetch from database
				if (!project && dataServiceRef.current) {
					project = await dataServiceRef.current.get<Project>(
						"projects",
						projectId
					);
					if (project) {
						setCache("projects", projectId, project);
					}
				}

				setSelectionState((prev) => ({
					...prev,
					currentProjectId: projectId,
					currentProject: project,
				}));

				setCurrentProjectId(projectId);
				setCurrentProject(project);
			} catch (error) {
				setError({
					message:
						error instanceof Error
							? error.message
							: "Failed to set current project",
					operation: "setCurrentProject",
					timestamp: new Date().toISOString(),
				});
			} finally {
				setLoading(false);
			}
		},
		[setLoading, setError, setCache, getCache]
	);

	const handleSetCurrentRequirement = useCallback(
		async (requirementId: string | null) => {
			setLoading(true);
			try {
				if (!requirementId) {
					setSelectionState((prev) => ({
						...prev,
						currentRequirementId: null,
						currentRequirement: null,
					}));
					setCurrentRequirementId(null);
					setCurrentRequirement(null);
					return;
				}

				// Try to get from cache first
				let requirement = getCache<Requirement>(
					"requirements",
					requirementId
				);

				// If not in cache, fetch from database
				if (!requirement && dataServiceRef.current) {
					requirement = await dataServiceRef.current.get<Requirement>(
						"requirements",
						requirementId
					);
					if (requirement) {
						setCache("requirements", requirementId, requirement);
					}
				}

				setSelectionState((prev) => ({
					...prev,
					currentRequirementId: requirementId,
					currentRequirement: requirement,
				}));

				setCurrentRequirementId(requirementId);
				setCurrentRequirement(requirement);
			} catch (error) {
				setError({
					message:
						error instanceof Error
							? error.message
							: "Failed to set current requirement",
					operation: "setCurrentRequirement",
					timestamp: new Date().toISOString(),
				});
			} finally {
				setLoading(false);
			}
		},
		[setLoading, setError, setCache, getCache]
	);

	const clearCurrentSelections = useCallback(() => {
		setSelectionState({
			currentUserId: userData?.uid || null,
			currentProjectId: null,
			currentRequirementId: null,
			currentProject: null,
			currentRequirement: null,
			currentRegulation: null,
			currentRegulationId: null,
		});
		setCurrentProjectId(null);
		setCurrentRequirementId(null);
		setCurrentProject(null);
		setCurrentRequirement(null);
	}, []);

	// Initialize data service
	useEffect(() => {
		if (state.isInitialized || state.isLoading) return;

		const initializeDataService = async () => {
			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				if (!dataServiceRef.current) {
					dataServiceRef.current = new FirebaseDataService(
						db,
						cacheConfig
					);
				}

				initialize(cacheConfig || DEFAULT_CACHE_CONFIG);

				setState((prev) => ({
					...prev,
					isInitialized: true,
					isLoading: false,
				}));
			} catch (error) {
				console.error("Failed to initialize data service:", error);
				setState((prev) => ({
					...prev,
					isLoading: false,
					operationError: {
						message:
							error instanceof Error
								? error.message
								: "Failed to initialize data service",
						operation: "initialization",
						timestamp: new Date().toISOString(),
					},
				}));
			}
		};

		initializeDataService();

		return () => {
			if (dataServiceRef.current) {
				dataServiceRef.current.destroy();
				dataServiceRef.current = null;
			}
			setState((prev) => ({ ...prev, isInitialized: false }));
		};
	}, [cacheConfig]);

	// CRUD Operations
	const create = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			data: Partial<T>
		): Promise<T> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current) {
					throw new Error("Data service not initialized");
				}

				if (!collection) {
					throw new Error("Collection name is required");
				}

				if (!data || Object.keys(data).length === 0) {
					throw new Error("Data object cannot be empty");
				}

				try {
					const enrichedData = {
						...data,
						createdBy: userData?.uid || "anonymous",
						createdAt: new Date().toISOString(),
					};

					const createdDoc = await dataServiceRef.current.create<T>(
						collection,
						enrichedData
					);

					if (!createdDoc) {
						throw new Error("Failed to create document");
					}

					return createdDoc;
				} catch (error) {
					throw new Error(
						`Failed to create document in ${collection}: ${
							error instanceof Error ? error.message : "Unknown error"
						}`
					);
				}
			}, "create");
		},
		[userData, handleOperation]
	);

	const get = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			id: string
		): Promise<T | null> => {
			return handleOperation(async () => {
				// Check cache first
				const cachedData = getCache<T>(collection, id);
				if (cachedData) {
					console.log(`Cache hit for ${collection}:${id}`);
					return cachedData;
				}

				console.log(`Cache miss for ${collection}:${id}`);
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");

				const data = await dataServiceRef.current.get<T>(
					collection,
					id
				);

				if (data) {
					setCache(collection, id, data);
				}

				return data;
			}, "get");
		},
		[handleOperation]
	);

	// bulk prefetch for a collection
	const prefetchCollection = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			queryConfig?: QueryConfig[]
		): Promise<void> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");

				const result = await dataServiceRef.current.query<T>(
					collection,
					queryConfig
				);

				// Cache all fetched documents
				result.items.forEach((doc) => {
					setCache(collection, doc.id, doc);
				});
			}, "prefetch");
		},
		[handleOperation]
	);

	const update = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			id: string,
			updates: Partial<T> | UpdateOperation<T>[]
		): Promise<T> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");

				const updateData = {
					...(Array.isArray(updates) ? {} : updates),
					updatedBy: userData?.uid || "anonymous",
				};

				const updated = await dataServiceRef.current.update<T>(
					collection,
					id,
					Array.isArray(updates)
						? updates
						: (updateData as Partial<T>)
				);

				// Update cache with new data
				setCache(collection, id, updated);

				return updated;
			}, "update");
		},
		[userData, handleOperation]
	);

	const remove = useCallback(
		async (collection: CollectionName, id: string): Promise<void> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");

				await dataServiceRef.current.delete(collection, id);
				// Invalidate cache for deleted item
				invalidateCache(collection, id);
			}, "delete");
		},
		[handleOperation]
	);

	// Subscribe to real-time updates
	const subscribe = useCallback(
		<T extends Collection>(
			collection: CollectionName,
			id: string | null,
			callback: (data: T | T[] | null) => void,
			queryConfig?: QueryConfig[]
		): (() => void) => {
			if (!dataServiceRef.current)
				throw new Error("Data service not initialized");

			return dataServiceRef.current.subscribe({
				collection,
				document: id || undefined,
				query: queryConfig,
				onChange: (data) => {
					// Update cache with real-time data
					if (id && data) {
						setCache(collection, id, data);
					}
					callback(data as T | T[] | null);
				},
				onError: (error: Error) => {
					setError({
						message: error.message,
						operation: "subscribe",
						timestamp: new Date().toISOString(),
					});
				},
			});
		},
		[]
	);

	const query = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			queryConfig?: QueryConfig[],
			paginationConfig?: PaginationConfig
		): Promise<PaginatedResult<T>> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.query<T>(
					collection,
					queryConfig,
					paginationConfig
				);
			}, "query");
		},
		[handleOperation]
	);

	// Subscribe to selected items for real-time updates
	useEffect(() => {
		if (!selectionState.currentProjectId || !dataServiceRef.current) return;

		const unsubscribe = dataServiceRef.current.subscribe({
			collection: "projects",
			document: selectionState.currentProjectId,
			onChange: (data) => {
				if (data) {
					setCache(
						"projects",
						selectionState.currentProjectId!,
						data
					);
					setSelectionState((prev) => ({
						...prev,
						currentProject: data as Project,
					}));
					setCurrentProject(data as Project);
				}
			},
			onError: (error: Error) => {
				setError({
					message: error.message,
					operation: "projectSubscription",
					timestamp: new Date().toISOString(),
				});
			},
		});

		return () => unsubscribe();
	}, [selectionState.currentProjectId]);

	useEffect(() => {
		if (!selectionState.currentRequirementId || !dataServiceRef.current)
			return;

		const unsubscribe = dataServiceRef.current.subscribe({
			collection: "requirements",
			document: selectionState.currentRequirementId,
			onChange: (data) => {
				if (data) {
					setCache(
						"requirements",
						selectionState.currentRequirementId!,
						data
					);
					setSelectionState((prev) => ({
						...prev,
						currentRequirement: data as Requirement,
					}));
					setCurrentRequirement(data as Requirement);
				}
			},
			onError: (error: Error) => {
				setError({
					message: error.message,
					operation: "requirementSubscription",
					timestamp: new Date().toISOString(),
				});
			},
		});

		return () => unsubscribe();
	}, [selectionState.currentRequirementId]);

	// Batch Operations
	const executeBatch = useCallback(
		async <T extends Collection>(
			operations: BatchOperation<T>[]
		): Promise<void> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.executeBatch(operations);
			}, "batch");
		},
		[handleOperation]
	);

	// Atomic Operations
	const incrementField = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			id: string,
			field: keyof T,
			value: number
		): Promise<T> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.incrementField<T>(
					collection,
					id,
					field,
					value
				);
			}, "increment");
		},
		[handleOperation]
	);

	const appendToArray = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			id: string,
			field: keyof T,
			elements: any[] | any
		): Promise<T> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.appendToArray<T>(
					collection,
					id,
					field,
					elements
				);
			}, "append");
		},
		[handleOperation]
	);

	const removeFromArray = useCallback(
		async <T extends Collection>(
			collection: CollectionName,
			id: string,
			field: keyof T,
			elements: any[] | any
		): Promise<T> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.removeFromArray<T>(
					collection,
					id,
					field,
					elements
				);
			}, "remove");
		},
		[handleOperation]
	);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, operationError: null }));
	}, []);

	const value = useMemo(
		() => ({
			...state,
			...selectionState,
			create,
			get,
			query,
			update,
			remove,
			executeBatch,
			incrementField,
			appendToArray,
			removeFromArray,
			subscribe,
			prefetchCollection,
			clearError,
			isLoading: useCacheStore.getState().isLoading,
			isInitialized: useCacheStore.getState().isInitialized,
			operationError: useCacheStore.getState().operationError,
			setCurrentProject: handleSetCurrentProject,
			setCurrentRequirement: handleSetCurrentRequirement,
			clearCurrentSelections,
		}),
		[
			state,
			create,
			get,
			query,
			update,
			remove,
			executeBatch,
			incrementField,
			appendToArray,
			removeFromArray,
			subscribe,
			prefetchCollection,
			clearError,
			selectionState,
			handleSetCurrentProject,
			handleSetCurrentRequirement,
			clearCurrentSelections,
		]
	);

	if (!state.isInitialized) {
		return <div>Loading data service...</div>;
	}

	return (
		<DataContext.Provider value={value}>{children}</DataContext.Provider>
	);
}

export function useData() {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error("useData must be used within a DataProvider");
	}
	if (!context.isInitialized) {
		throw new Error("Data service is not yet initialized");
	}
	return context;
}

// Custom hooks for specific collections
export function useProjects() {
	const data = useData();

	return useMemo(
		() => ({
			...data,
			collection: "projects" as CollectionName,
			loadDocuments: async () => {
				if (!data.isInitialized) {
					throw new Error("Data service is not yet initialized");
				}
				return data.query("projects");
			},
			currentProject: data.currentProject,
			setCurrentProject: data.setCurrentProject,
		}),
		[data]
	);
}

export function useRequirements() {
	const data = useData();

	return useMemo(
		() => ({
			...data,
			collection: "requirements" as CollectionName,
			loadDocuments: async () => {
				if (!data.isInitialized) {
					throw new Error("Data service is not yet initialized");
				}
				return data.query("requirements");
			},
			currentRequirement: data.currentRequirement,
			setCurrentRequirement: data.setCurrentRequirement,
		}),
		[data]
	);
}

export function useRegulations() {
	const data = useData();

	return useMemo(
		() => ({
			...data,
			collection: "regulations" as CollectionName,
			loadDocuments: async () => {
				if (!data.isInitialized) {
					throw new Error("Data service is not yet initialized");
				}
				return data.query("regulations");
			},
		}),
		[data]
	);
}
