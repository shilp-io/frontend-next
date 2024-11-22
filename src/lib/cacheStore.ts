import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
	DataOperationError,
	Collection,
	CollectionName,
	Project,
	Requirement,
} from "@/types/data";

interface CacheConfig {
	ttl: number;
	maxSize: number;
	priority: "low" | "medium" | "high";
}

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	collectionName: CollectionName;
}

interface CacheStore {
	cache: Record<string, CacheEntry<any>>;
	isLoading: boolean;
	isInitialized: boolean;
	operationError: DataOperationError | null;
	config: CacheConfig | null;

	// Current selection state
	currentProjectId: string | null;
	currentRequirementId: string | null;
	currentProject: Project | null;
	currentRequirement: Requirement | null;

	// Initialization
	initialize: (config: CacheConfig) => void;

	// Cache operations
	setCache: <T extends Collection>(
		collectionName: CollectionName,
		id: string,
		data: T
	) => void;
	getCache: <T extends Collection>(
		collectionName: CollectionName,
		id: string
	) => T | null;
	invalidateCache: (collectionName: CollectionName, id?: string) => void;
	clearCache: () => void;

	// Selection operations
	setCurrentProjectId: (projectId: string | null) => void;
	setCurrentRequirementId: (requirementId: string | null) => void;
	setCurrentProject: (project: Project | null) => void;
	setCurrentRequirement: (requirement: Requirement | null) => void;

	// Status operations
	setLoading: (loading: boolean) => void;
	setInitialized: (initialized: boolean) => void;
	setError: (error: DataOperationError | null) => void;
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
	ttl: 5 * 60 * 1000, // 5 minutes
	maxSize: 100,
	priority: "medium",
};

export const useCacheStore = create<CacheStore>()(
	subscribeWithSelector((set, get) => ({
		cache: {},
		isLoading: false,
		isInitialized: false,
		operationError: null,
		config: null,

		currentProjectId: null,
		currentRequirementId: null,
		currentProject: null,
		currentRequirement: null,

		initialize: (config: CacheConfig) => {
			set({
				config: { ...DEFAULT_CACHE_CONFIG, ...config },
				isInitialized: true,
			});
		},

		// Selection setters
		setCurrentProjectId: (projectId: string | null) =>
			set({ currentProjectId: projectId }),

		setCurrentRequirementId: (requirementId: string | null) =>
			set({ currentRequirementId: requirementId }),

		setCurrentProject: (project: Project | null) =>
			set({ currentProject: project }),

		setCurrentRequirement: (requirement: Requirement | null) =>
			set({ currentRequirement: requirement }),

		setCache: (collectionName, id, data) => {
			const config = get().config || DEFAULT_CACHE_CONFIG;
			const currentCache = get().cache;
			const cacheSize = Object.keys(currentCache).length;

			// Handle cache size limits
			if (cacheSize >= config.maxSize) {
				// Remove oldest entries if we hit the size limit
				const sortedEntries = Object.entries(currentCache).sort(
					([, a], [, b]) => a.timestamp - b.timestamp
				);

				const newCache = { ...currentCache };
				// Remove oldest 10% of entries
				const removeCount = Math.ceil(config.maxSize * 0.1);
				sortedEntries.slice(0, removeCount).forEach(([key]) => {
					delete newCache[key];
				});

				set({ cache: newCache });
			}

			set((state) => ({
				cache: {
					...state.cache,
					[`${collectionName}:${id}`]: {
						data,
						timestamp: Date.now(),
						collectionName,
					},
				},
			}));
		},

		getCache: (collectionName, id) => {
			const config = get().config || DEFAULT_CACHE_CONFIG;
			const cacheKey = `${collectionName}:${id}`;
			const entry = get().cache[cacheKey];

			if (!entry) return null;

			// Check if cache is still valid based on TTL
			if (Date.now() - entry.timestamp > config.ttl) {
				get().invalidateCache(collectionName, id);
				return null;
			}

			return entry.data;
		},

		invalidateCache: (collectionName, id) => {
			set((state) => {
				const newCache = { ...state.cache };

				if (id) {
					delete newCache[`${collectionName}:${id}`];
				} else {
					Object.keys(newCache).forEach((key) => {
						if (key.startsWith(`${collectionName}:`)) {
							delete newCache[key];
						}
					});
				}

				return { cache: newCache };
			});
		},

		clearCache: () => set({ cache: {} }),

		setLoading: (loading) => set({ isLoading: loading }),
		setInitialized: (initialized) => set({ isInitialized: initialized }),
		setError: (error) => set({ operationError: error }),
	}))
);
