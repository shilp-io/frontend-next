import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useCallback,
	useRef,
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

interface DataContextValue extends DataContextState {
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
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.create<T>(collection, {
					...data,
					createdBy: userData?.uid || "anonymous",
				});
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
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.get<T>(collection, id);
			}, "get");
		},
		[handleOperation]
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
				return dataServiceRef.current.update<T>(
					collection,
					id,
					Array.isArray(updates)
						? updates
						: (updateData as Partial<T>)
				);
			}, "update");
		},
		[userData, handleOperation]
	);

	const remove = useCallback(
		async (collection: CollectionName, id: string): Promise<void> => {
			return handleOperation(async () => {
				if (!dataServiceRef.current)
					throw new Error("Data service not initialized");
				return dataServiceRef.current.delete(collection, id);
			}, "delete");
		},
		[handleOperation]
	);

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

	// Subscriptions
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
				onChange: callback,
				onError: (error: Error) => {
					setState((prev) => ({
						...prev,
						operationError: {
							message: error.message,
							operation: "subscribe",
							timestamp: new Date().toISOString(),
						},
					}));
				},
			});
		},
		[]
	);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, operationError: null }));
	}, []);

	const value = useMemo(
		() => ({
			...state,
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
			clearError,
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
			clearError,
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
