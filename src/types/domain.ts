export type RequirementDocument = {
  id: string;
  title: string;
  description: string;
  type: "product" | "system" | "subsystem" | "component" | "interface";
  requirements: Requirement[];
  properties: Property[];
  createdAt: number;
  parentId?: string;
  childIds: string[];
  x?: number;
  y?: number;
  externalDocuments?: ExternalDocument[];
};

export type ExternalDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  tags: string[];
  uploadedAt: number;
};

export type Property = {
  id: string;
  name: string;
  type: "text" | "date" | "select" | "multiselect" | "number";
  options?: string[];
  required?: boolean;
  width?: number;
};

export type RequirementMetadata = {
  [key: string]: string | number | string[] | null;
};

export type Requirement = {
  id: string;
  content: string;
  type: "functional" | "non-functional" | "performance" | "interface";
  status: "draft" | "review" | "approved" | "implemented";
  priority: "low" | "medium" | "high" | "critical";
  metadata: RequirementMetadata;
  links: RequirementLink[];
  analysis?: RequirementAnalysis;
  createdAt: number;
  updatedAt: number;
};

export type RequirementLink = {
  id: string;
  sourceId: string;
  targetId: string;
  type: "derives" | "depends" | "conflicts" | "related";
  description?: string;
  createdAt: number;
};

export type RequirementAnalysis = {
  rewrittenEARS: string;
  rewrittenINCOSE: string;
  selectedFormat: "EARS" | "INCOSE";
  feedback: string[];
  complianceIssues: string[];
};
