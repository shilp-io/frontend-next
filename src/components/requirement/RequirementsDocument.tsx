import React, { useState, useEffect } from "react";
import { Plus, Settings, Upload, Table, List, FileDown } from "lucide-react";
import { useData, useRequirements, useProjects } from "@/context/DataContext";
import RequirementsTable from "./RequirementsTable";
import RequirementEditor from "./RequirementEditor";
import ExternalDocumentUpload from "@/components/regulation/ExternalDocumentUpload";
import SimpleRequirementsView from "./SimpleRequirementsView";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Project, Requirement } from "@/types/data";

interface RequirementsDocumentProps {
	project: Project;
	requirements: Requirement[];
}

const RequirementsDocument: React.FC<RequirementsDocumentProps> = ({
	project,
	requirements,
}) => {
	const {
		currentProject,
		currentRequirement,
		operationError,
		clearError,
		isLoading,
	} = useData();

	// UI state
	const [showEditor, setShowEditor] = useState(false);
	const [showColumnManager, setShowColumnManager] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showViewer, setShowViewer] = useState(false);
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [showBulkImport, setShowBulkImport] = useState(false);
	const [viewMode, setViewMode] = useState<"table" | "simple">("table");

	useEffect(() => {
		if (currentRequirement) {
			setShowEditor(true);
		} else {
			setShowEditor(false);
		}
	}, [currentRequirement]);

	if (!currentProject) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center text-gray-500 dark:text-dark-text-secondary">
					No document selected
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm">
			{operationError && (
				<Alert variant="destructive" className="mb-4">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{operationError.message}
						<button
							onClick={clearError}
							className="ml-2 underline hover:no-underline"
						>
							Dismiss
						</button>
					</AlertDescription>
				</Alert>
			)}

			<div className="p-4 border-b border-gray-200 dark:border-dark-border">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
							{project.title}
						</h2>
						<p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
							{project.description}
						</p>
					</div>

					<div className="flex items-center space-x-2">
						{/* View Mode Toggle */}
						<div className="flex items-center bg-gray-100 dark:bg-dark-bg-start rounded-md p-1 mr-4">
							<button
								onClick={() => setViewMode("table")}
								className={`p-1.5 rounded-md ${
									viewMode === "table"
										? "bg-white dark:bg-dark-surface shadow-sm text-dark-accent"
										: "text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
								}`}
								title="Table View"
							>
								<Table className="h-4 w-4" />
							</button>
							<button
								onClick={() => setViewMode("simple")}
								className={`p-1.5 rounded-md ${
									viewMode === "simple"
										? "bg-white dark:bg-dark-surface shadow-sm text-dark-accent"
										: "text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
								}`}
								title="Simple View"
							>
								<List className="h-4 w-4" />
							</button>
						</div>

						{/* Action Buttons */}
						<div className="relative">
							<button
								onClick={() =>
									setShowExportMenu(!showExportMenu)
								}
								className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
								disabled={isLoading}
							>
								<FileDown className="w-4 h-4 mr-2" />
								Export
							</button>
						</div>

						<button
							onClick={() => setShowBulkImport(true)}
							className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
							disabled={isLoading}
						>
							<Upload className="w-4 h-4 mr-2" />
							Bulk Import
						</button>

						<button
							onClick={() => setShowEditor(true)}
							className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dark-accent hover:bg-dark-accent-hover transition-colors"
							disabled={isLoading}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Requirement
						</button>

						<button
							onClick={() => setShowColumnManager(true)}
							className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
							disabled={isLoading}
						>
							<Settings className="w-4 h-4 mr-2" />
							Manage Columns
						</button>

						<button
							onClick={() => setShowUploadModal(true)}
							className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-dark-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
							disabled={isLoading}
						>
							<Upload className="w-4 h-4 mr-2" />
							Upload Document
						</button>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center p-8">
					<div className="animate-pulse text-gray-500 dark:text-dark-text-secondary">
						Loading...
					</div>
				</div>
			)}

			{/* Content */}
			{!isLoading &&
				(viewMode === "table" ? (
					<RequirementsTable requirements={requirements} />
				) : (
					<SimpleRequirementsView requirements={requirements} />
				))}

			{/* Modals */}
			{showEditor && (
				<RequirementEditor onClose={() => setShowEditor(false)} />
			)}

			{/* {showColumnManager && (
				<ColumnManager onClose={() => setShowColumnManager(false)} />
			)} */}

			{showUploadModal && (
				<ExternalDocumentUpload
					onClose={() => setShowUploadModal(false)}
				/>
			)}

			{/* {showViewer && selectedExternalDoc && (
				<ExternalDocumentViewer
					document={selectedExternalDoc}
					onClose={() => {
						setShowViewer(false);
						setSelectedExternalDoc(null);
					}}
				/>
			)}

			{showBulkImport && (
				<BulkImportModal onClose={() => setShowBulkImport(false)} />
			)} */}
		</div>
	);
};

export default RequirementsDocument;
