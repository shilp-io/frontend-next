// types/data.ts
import type { Timestamp, FieldValue, WhereFilterOp } from "firebase/firestore";

// Base Types
export interface BaseDocument {
	id: string;
	createdAt: string | Timestamp | FieldValue;
	updatedAt: string | Timestamp | FieldValue;
	createdBy: string;
	updatedBy?: string;
}

// Collection Types
export interface Collection extends BaseDocument {
	[key: string]: any;
}

// Context State
export interface DataContextState {
	isLoading: boolean;
	isInitialized: boolean;
	operationError: DataOperationError | null;
	cachedData: Map<string, any>;
}

// Error Handling
export interface DataOperationError {
	message: string;
	operation: string;
	timestamp: string;
	details?: Record<string, any>;
}

// Query Types
export type QueryOperator =
	| "eq"
	| "ne"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "in"
	| "not-in"
	| "array-contains"
	| "array-contains-any";

export interface QueryConfig {
	field: string;
	operator: WhereFilterOp;
	value: any;
	combine?: "AND" | "OR";
}

// Batch Operations
export type BatchOperationType = "create" | "update" | "delete";

export interface BatchOperation<T extends Collection> {
	type: BatchOperationType;
	collection: string;
	id?: string;
	data?: Partial<T>;
}

// Collection-specific Types
export interface Requirement extends Collection {
	title: string;
	description?: string;
	status: TaskStatus;
	priority: Priority;
	dueDate?: string | Timestamp | FieldValue;
	completedAt?: string | Timestamp | FieldValue;
	assignedTo?: string[];
	projectId: string;
	regulationIds: string[];
	parentId?: string;
	childrenIds?: string[];
	tags?: string[];
	attachments?: Attachment[];
	comments?: Comment[];
	output?: Output[];
	permissions: Permissions;
}

export interface Project extends Collection {
	title: string;
	type: ProjectType;
	requirementIds: string[];
	regulationIds: string[];
	description?: string;
	status: ProjectStatus;
	startDate: string | Timestamp | FieldValue;
	endDate?: string | Timestamp | FieldValue;
	members: string[];
	ownerId: string;
	settings?: ProjectSettings;
	metadata?: Record<string, any>;
	permissions: Permissions;
}

export interface Regulation extends Collection {
	title: string;
	content: string;
	version: number;
	projectId: string;
	parentId?: string;
	lastViewed?: string | Timestamp | FieldValue;
	format: DocumentFormat;
}

// Enums and Constants
export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	DONE = "done",
	ARCHIVED = "archived",
}

export enum ProjectStatus {
	PLANNING = "planning",
	ACTIVE = "active",
	ON_HOLD = "on_hold",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export enum ProjectType {
	PRODUCT = "product",
	SYSTEM = "system",
	SUBSYSTEM = "subsystem",
	COMPONENT = "component",
	INTERFACE = "interface",
}

export enum Priority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export enum DocumentFormat {
	MARKDOWN = "markdown",
	HTML = "html",
	PLAIN_TEXT = "plain_text",
	PDF = "pdf",
}

// Supporting Types

export interface Output {
	role: "user" | "assistant";
	content: string;
}

export interface Attachment {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	uploadedBy: string;
	uploadedAt: string | Timestamp;
}

export interface Comment {
	id: string;
	content: string;
	author: string;
	createdAt: string | Timestamp;
	updatedAt?: string | Timestamp;
	parentId?: string;
	mentions?: string[];
	reactions?: Record<string, string[]>;
}

export interface ProjectSettings {
	isPublic: boolean;
	customFields?: Record<string, any>;
}

export interface Permissions {
	view: string[];
	edit: string[];
	admin: string[];
	public: boolean;
}

export interface NotificationPreferences {
	email: boolean;
	push: boolean;
	frequency: "instant" | "daily" | "weekly";
	types: {
		taskAssigned: boolean;
		taskUpdated: boolean;
		commentMention: boolean;
		documentShared: boolean;
	};
}

// Cache Configuration
export interface CacheConfig {
	ttl: number; // Time to live in milliseconds
	maxSize: number; // Maximum number of items in cache
	priority?: "low" | "medium" | "high";
}

// Subscription Types
export interface SubscriptionConfig {
	collection: string;
	document?: string;
	query?: QueryConfig[];
	onChange: (data: any) => void;
	onError?: (error: Error) => void;
}

// Pagination Types
export interface PaginationConfig {
	limit: number;
	startAfter?: string;
	orderBy?: {
		field: string;
		direction: "asc" | "desc";
	};
}

export interface PaginatedResult<T> {
	items: T[];
	lastDoc: string | null;
	hasMore: boolean;
}

// Export common utility types
export type CollectionName =
	| "regulations"
	| "projects"
	| "requirements"
	| "comments"
	| "attachments";

export type UpdateOperation<T> = {
	field: keyof T;
	value: any | IncrementValue | ArrayValue;
	operation: "set" | "increment" | "append" | "remove";
};

export type IncrementValue = number;
export type ArrayValue = any[] | any;

export type ValidationRule = {
	field: string;
	type: "required" | "format" | "range" | "custom";
	params?: any;
	message: string;
};

export type ValidationSchema = Record<string, ValidationRule[]>;


