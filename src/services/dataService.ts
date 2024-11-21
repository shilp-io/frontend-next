import {
	collection,
	doc,
	getDocs,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	writeBatch,
	onSnapshot,
	serverTimestamp,
	Firestore,
	increment as firestoreIncrement,
	arrayUnion as firestoreArrayUnion,
	arrayRemove as firestoreArrayRemove,
	DocumentReference,
	QuerySnapshot,
	DocumentSnapshot,
	Query,
	FieldValue,
} from "firebase/firestore";

import {
	Collection,
	QueryConfig,
	BatchOperation,
	PaginationConfig,
	PaginatedResult,
	SubscriptionConfig,
	ValidationSchema,
	CollectionName,
	UpdateOperation,
	CacheConfig,
	DataOperationError,
	Project,
	ProjectStatus,
	ProjectType,
	TaskStatus,
	Priority,
	DocumentFormat,
	Requirement,
	Regulation,
	IncrementValue,
	ArrayValue,
} from "@/types/data";
import { debug } from "console";
import { initialize } from "next/dist/server/lib/render-server";

export const increment = (value: IncrementValue): FieldValue => {
	return firestoreIncrement(value);
};

export const arrayUnion = (...elements: ArrayValue): FieldValue => {
	return firestoreArrayUnion(...elements);
};

export const arrayRemove = (...elements: ArrayValue): FieldValue => {
	return firestoreArrayRemove(...elements);
};

// Factory functions for creating new documents
export const DocumentFactory = {
	createProject(data: Partial<Project>): Project {
		return {
			id: crypto.randomUUID(),
			title: "",
			type: ProjectType.PRODUCT,
			requirementIds: [],
			regulationIds: [],
			status: ProjectStatus.PLANNING,
			startDate: serverTimestamp(),
			members: [],
			ownerId: "",
			permissions: {
				view: [],
				edit: [],
				admin: [],
				public: false,
			},
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			createdBy: "",
			...data,
		};
	},

	createRequirement(data: Partial<Requirement>): Requirement {
		return {
			id: crypto.randomUUID(),
			title: "",
			status: TaskStatus.TODO,
			priority: Priority.MEDIUM,
			projectId: "",
			regulationIds: [],
			permissions: {
				view: [],
				edit: [],
				admin: [],
				public: false,
			},
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			createdBy: "",
			...data,
		};
	},

	createRegulation(data: Partial<Regulation>): Regulation {
		return {
			id: crypto.randomUUID(),
			title: "",
			content: "",
			version: 1,
			projectId: "",
			format: DocumentFormat.MARKDOWN,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			createdBy: "",
			...data,
		};
	},
};

export class FirebaseDataService {
	private db: Firestore;
	private cache: Map<string, any>;
	private subscriptions: Map<string, () => void>;
	private validationSchemas: Map<CollectionName, ValidationSchema>;
	private cacheConfig: CacheConfig;

	constructor(
		db: Firestore,
		cacheConfig: CacheConfig = {
			ttl: 300000,
			maxSize: 1000,
			priority: "medium",
		}
	) {
		this.db = db;
		this.cache = new Map();
		this.subscriptions = new Map();
		this.validationSchemas = new Map();
		this.cacheConfig = cacheConfig;
	}
	
	// Cache Management
	private getCacheKey(
		collectionName: string,
		id?: string,
		queryParams?: QueryConfig[]
	): string {
		if (id) {
			return `${collectionName}:${id}`;
		}
		return `${collectionName}:${JSON.stringify(queryParams || [])}`;
	}

	private setCache(key: string, data: any): void {
		if (this.cache.size >= this.cacheConfig.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey as string);
		}
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});
	}

	private getCache(key: string): any | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	// Query Builder
	private buildQuery(
		collectionRef: any,
		queryConfigs?: QueryConfig[],
		paginationConfig?: PaginationConfig
	): Query {
		let q = collectionRef;

		if (queryConfigs) {
			queryConfigs.forEach((config) => {
				q = query(
					q,
					where(config.field, config.operator, config.value)
				);
			});
		}

		if (paginationConfig) {
			if (paginationConfig.orderBy) {
				q = query(
					q,
					orderBy(
						paginationConfig.orderBy.field,
						paginationConfig.orderBy.direction
					)
				);
			}
			q = query(q, limit(paginationConfig.limit));
			if (paginationConfig.startAfter) {
				q = query(q, startAfter(paginationConfig.startAfter));
			}
		}

		return q;
	}

	// CRUD Operations
	async create<T extends Collection>(
		collectionName: CollectionName,
		data: Partial<T>
	): Promise<T> {
		try {
			const collectionRef = collection(this.db, collectionName);
			const documentRef = doc(collectionRef);

			const timestamp = serverTimestamp();
			const newData = {
				...data,
				id: documentRef.id,
				createdAt: timestamp,
				updatedAt: timestamp,
			} as T;

			await setDoc(documentRef, newData);
			this.setCache(
				this.getCacheKey(collectionName, documentRef.id),
				newData
			);

			return newData;
		} catch (error) {
			throw this.handleError(error, "create", { collectionName, data });
		}
	}

	async get<T extends Collection>(
		collectionName: CollectionName,
		id: string
	): Promise<T | null> {
		try {
			const cacheKey = this.getCacheKey(collectionName, id);
			const cached = this.getCache(cacheKey);
			if (cached) return cached;

			const docRef = doc(this.db, collectionName, id);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) return null;

			const data = docSnap.data() as T;
			this.setCache(cacheKey, data);

			return data;
		} catch (error) {
			throw this.handleError(error, "get", { collectionName, id });
		}
	}

	async query<T extends Collection>(
		collectionName: CollectionName,
		queryConfigs?: QueryConfig[],
		paginationConfig?: PaginationConfig
	): Promise<PaginatedResult<T>> {
		try {
			const cacheKey = this.getCacheKey(
				collectionName,
				undefined,
				queryConfigs
			);
			const cached = this.getCache(cacheKey);
			if (cached) return cached;

			const collectionRef = collection(this.db, collectionName);
			const q = this.buildQuery(
				collectionRef,
				queryConfigs,
				paginationConfig
			);
			const querySnapshot = await getDocs(q);

			const items = querySnapshot.docs.map((doc) => doc.data() as T);
			const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

			const result = {
				items,
				lastDoc: lastDoc?.id || null,
				hasMore: items.length === (paginationConfig?.limit || 0),
			};

			this.setCache(cacheKey, result);
			return result;
		} catch (error) {
			throw this.handleError(error, "query", {
				collectionName,
				queryConfigs,
				paginationConfig,
			});
		}
	}

	async update<T extends Collection>(
		collectionName: CollectionName,
		id: string,
		updates: Partial<T> | UpdateOperation<T>[]
	): Promise<T> {
		try {
			const docRef = doc(this.db, collectionName, id);
			const timestamp = serverTimestamp();

			let updateData: any;

			if (Array.isArray(updates)) {
				updateData = updates.reduce((acc, update) => {
					const { field, operation, value } = update;

					switch (operation) {
						case "set":
							acc[field as string] = value;
							break;
						case "increment":
							if (typeof value === "number") {
								acc[field as string] = increment(value);
							} else {
								throw new Error(
									"Increment operation requires a numeric value"
								);
							}
							break;
						case "append":
							if (Array.isArray(value)) {
								acc[field as string] = arrayUnion(...value);
							} else {
								acc[field as string] = arrayUnion(value);
							}
							break;
						case "remove":
							if (Array.isArray(value)) {
								acc[field as string] = arrayRemove(...value);
							} else {
								acc[field as string] = arrayRemove(value);
							}
							break;
						default:
							throw new Error(
								`Unsupported operation: ${operation}`
							);
					}
					return acc;
				}, {} as Record<string, any>);
			} else {
				updateData = updates;
			}

			updateData.updatedAt = timestamp;

			await updateDoc(docRef, updateData);

			const updated = await this.get<T>(collectionName, id);
			this.cache.delete(this.getCacheKey(collectionName, id));

			return updated!;
		} catch (error) {
			throw this.handleError(error, "update", {
				collectionName,
				id,
				updates,
			});
		}
	}

	// Utility method for atomic field operations
	async atomicUpdate<T extends Collection>(
		collectionName: CollectionName,
		id: string,
		field: keyof T,
		operation: "increment" | "append" | "remove",
		value: IncrementValue | ArrayValue
	): Promise<T> {
		const update: UpdateOperation<T> = {
			field,
			operation,
			value,
		};

		return this.update(collectionName, id, [update]);
	}

	// Convenience methods for common atomic operations
	async incrementField<T extends Collection>(
		collectionName: CollectionName,
		id: string,
		field: keyof T,
		value: number
	): Promise<T> {
		return this.atomicUpdate(collectionName, id, field, "increment", value);
	}

	async appendToArray<T extends Collection>(
		collectionName: CollectionName,
		id: string,
		field: keyof T,
		elements: ArrayValue
	): Promise<T> {
		return this.atomicUpdate(collectionName, id, field, "append", elements);
	}

	async removeFromArray<T extends Collection>(
		collectionName: CollectionName,
		id: string,
		field: keyof T,
		elements: ArrayValue
	): Promise<T> {
		return this.atomicUpdate(collectionName, id, field, "remove", elements);
	}

	async delete(collectionName: CollectionName, id: string): Promise<void> {
		try {
			const docRef = doc(this.db, collectionName, id);
			await deleteDoc(docRef);
			this.cache.delete(this.getCacheKey(collectionName, id));
		} catch (error) {
			throw this.handleError(error, "delete", { collectionName, id });
		}
	}

	// Batch Operations
	async executeBatch<T extends Collection>(
		operations: BatchOperation<T>[]
	): Promise<void> {
		try {
			const batch = writeBatch(this.db);

			operations.forEach((operation) => {
				const docRef = operation.id
					? doc(this.db, operation.collection, operation.id)
					: doc(collection(this.db, operation.collection));

				switch (operation.type) {
					case "create":
						batch.set(docRef, {
							...operation.data,
							id: docRef.id,
							createdAt: serverTimestamp(),
							updatedAt: serverTimestamp(),
						});
						break;
					case "update":
						batch.update(docRef, {
							...operation.data,
							updatedAt: serverTimestamp(),
						});
						break;
					case "delete":
						batch.delete(docRef);
						break;
				}

				this.cache.delete(
					this.getCacheKey(operation.collection, operation.id)
				);
			});

			await batch.commit();
		} catch (error) {
			throw this.handleError(error, "batch", { operations });
		}
	}

	// Real-time Subscriptions
	subscribe<T extends Collection>(config: SubscriptionConfig): () => void {
		const {
			collection: collectionName,
			document: documentId,
			query: queryConfigs,
			onChange,
			onError,
		} = config;

		try {
			let unsubscribe: () => void;

			if (documentId) {
				const docRef = doc(this.db, collectionName, documentId);
				unsubscribe = onSnapshot(
					docRef,
					(snapshot) => {
						const data = snapshot.data() as T;
						this.setCache(
							this.getCacheKey(collectionName, documentId),
							data
						);
						onChange(data);
					},
					(error) => onError?.(error)
				);
			} else {
				const collectionRef = collection(this.db, collectionName);
				const q = this.buildQuery(collectionRef, queryConfigs);
				unsubscribe = onSnapshot(
					q,
					(snapshot) => {
						const items = snapshot.docs.map(
							(doc) => doc.data() as T
						);
						this.setCache(
							this.getCacheKey(
								collectionName,
								undefined,
								queryConfigs
							),
							items
						);
						onChange(items);
					},
					(error) => onError?.(error)
				);
			}

			const subscriptionId = `${collectionName}:${documentId || "query"}`;
			this.subscriptions.set(subscriptionId, unsubscribe);

			return () => {
				unsubscribe();
				this.subscriptions.delete(subscriptionId);
			};
		} catch (error) {
			throw this.handleError(error, "subscribe", config);
		}
	}

	// Validation
	setValidationSchema(
		collectionName: CollectionName,
		schema: ValidationSchema
	): void {
		this.validationSchemas.set(collectionName, schema);
	}

	private validateData<T extends Collection>(
		collectionName: CollectionName,
		data: Partial<T>
	): void {
		const schema = this.validationSchemas.get(collectionName);
		if (!schema) return;

		const errors: string[] = [];

		Object.entries(schema).forEach(([field, rules]) => {
			rules.forEach((rule) => {
				const value = data[field as keyof T];

				switch (rule.type) {
					case "required":
						if (
							value === undefined ||
							value === null ||
							value === ""
						) {
							errors.push(rule.message);
						}
						break;
					case "format":
						if (
							value &&
							!new RegExp(rule.params).test(String(value))
						) {
							errors.push(rule.message);
						}
						break;
					case "range":
						if (
							value !== undefined &&
							(value < rule.params.min || value > rule.params.max)
						) {
							errors.push(rule.message);
						}
						break;
					case "custom":
						if (rule.params(value) === false) {
							errors.push(rule.message);
						}
						break;
				}
			});
		});

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(", ")}`);
		}
	}

	// Error Handling
	private handleError(
		error: any,
		operation: string,
		details?: Record<string, any>
	): DataOperationError {
		console.error(`Firebase operation failed: ${operation}`, error);

		return {
			message: error.message || "An unknown error occurred",
			operation,
			timestamp: new Date().toISOString(),
			details,
		};
	}

	// Cleanup
	destroy(): void {
		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();
		this.cache.clear();
	}
}
