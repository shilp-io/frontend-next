import React, { useState, useEffect } from "react";
import {
	Plus,
	FolderPlus,
	Search,
	Filter,
	Grid,
	List,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import NewDocumentModal from "./NewDocumentModal";
import { useProjects, useRequirements } from "@/context/DataContext";
import DocumentsList from "@/components/document/DocumentsList";
import RequirementsDocument from "@/components/requirement/RequirementsDocument";
import DocumentHierarchy from "./DocumentHierarchy";
import { useUser } from "@/context/UserContext";
import { WhereFilterOp } from "firebase/firestore";
import type { Project } from "@/types/data";

const DocumentManager: React.FC = () => {
	const {
		currentUserId,
		query: queryProjects,
		currentProject,
		setCurrentProject,
		isLoading: projectsLoading,
		operationError: projectError,
		prefetchCollection: prefetchProjects,
	} = useProjects();

	const {
		query: queryRequirements,
		currentRequirement,
		setCurrentRequirement,
		isLoading: requirementsLoading,
		operationError: requirementError,
		prefetchCollection: prefetchRequirements,
	} = useRequirements();

	const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
		new Set()
	);
	const [projects, setProjects] = useState<Project[]>([]);
	const [requirementsByProject, setRequirementsByProject] = useState<
		Record<string, any[]>
	>({});

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [showSidebar, setShowSidebar] = useState(true);
	const [showNewDocument, setShowNewDocument] = useState(false);

	// Fetch initial data
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Prefetch collections for better performance

				const queryConfig = currentUserId
				? [
						{
							field: "createdBy",
							operator: "==" as WhereFilterOp,
							value: currentUserId,
						},
				  ]
				: [];

				await Promise.all([
					prefetchProjects("projects"),
					prefetchRequirements("requirements"),
				]);

				const projectsResult = await queryProjects("projects", queryConfig);
				const projectItems = projectsResult.items as Project[];
				setProjects(projectItems);

				// Load requirements for each project
				const requirementsMap: Record<string, any[]> = {};
				await Promise.all(
					projectItems.map(async (project: Project) => {
						const requirements = await queryRequirements(
							"requirements",
							[
								{
									field: "projectId",
									operator: "==",
									value: project.id,
								},
							]
						);
						requirementsMap[project.id] = requirements.items;
					})
				);
				setRequirementsByProject(requirementsMap);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	const toggleProjectExpansion = (projectId: string) => {
		setExpandedProjects((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(projectId)) {
				newSet.delete(projectId);
			} else {
				newSet.add(projectId);
			}
			return newSet;
		});
	};

	const handleProjectSelect = async (projectId: string) => {
		await setCurrentProject(projectId);
		if (!expandedProjects.has(projectId)) {
			toggleProjectExpansion(projectId);
		}
	};

	const handleRequirementSelect = async (requirementId: string) => {
		await setCurrentRequirement(requirementId);
	};

	const handleNewProject = (newProject: Project) => {
		setProjects((prevProjects) => [...prevProjects, newProject]);
		setShowNewDocument(false);
	};

	if (projectsLoading || requirementsLoading) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 text-center">
				<div className="animate-pulse">
					Loading requirements documents...
				</div>
			</div>
		);
	}

	if (projectError) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 text-center">
				<div className="text-red-600">
					Error: {projectError.message}
				</div>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		);
	}

	if (requirementError) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 text-center">
				<div className="text-red-600">
					Error: {requirementError.message}
				</div>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6">
			{/* Header Section */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Requirements Documents
					</h1>
					<p className="text-sm text-gray-500 mt-1">
						Manage and organize your system requirements
					</p>
				</div>
				<button
					onClick={() => setShowNewDocument(true)}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
				>
					<Plus className="w-4 h-4 mr-2" />
					New Document
				</button>
			</div>

			<div className="flex">
				<button
					onClick={() => setShowSidebar(!showSidebar)}
					className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-r-lg p-2 shadow-sm z-10 hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
				>
					{showSidebar ? (
						<ChevronLeft className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</button>

				{/* Document Hierarchy Sidebar */}
				<div
					className={`transition-all duration-300 ${
						showSidebar ? "w-80" : "w-0"
					} overflow-hidden`}
				>
					<div className="w-80">
						<DocumentHierarchy documents={projects} />
					</div>
				</div>

				{/* Search and Filter Bar */}
				<div
					className={`flex-1 transition-all duration-300 ${
						showSidebar ? "ml-6" : "ml-0"
					}`}
				>
					<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
						<div className="flex items-center space-x-4">
							<div className="flex-1 relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-4 w-4 text-gray-400" />
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
									placeholder="Search documents..."
								/>
							</div>
							<div className="flex items-center space-x-2">
								<button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
									<Filter className="h-4 w-4 mr-2" />
									Filter
								</button>
								<div className="border-l border-gray-300 h-6 mx-2" />
								<div className="flex items-center bg-gray-100 rounded-md p-1">
									<button
										onClick={() => setViewMode("grid")}
										className={`p-1.5 rounded-md ${
											viewMode === "grid"
												? "bg-white shadow-sm text-red-600"
												: "text-gray-500 hover:text-gray-900"
										}`}
										aria-label="Grid view"
									>
										<Grid className="h-4 w-4" />
									</button>
									<button
										onClick={() => setViewMode("list")}
										className={`p-1.5 rounded-md ${
											viewMode === "list"
												? "bg-white shadow-sm text-red-600"
												: "text-gray-500 hover:text-gray-900"
										}`}
										aria-label="List view"
									>
										<List className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Empty State or Documents List */}
					{projects.length === 0 ? (
						<div className="text-center bg-white rounded-xl shadow-sm p-12">
							<FolderPlus className="w-12 h-12 text-red-600 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								No documents yet
							</h2>
							<p className="text-gray-500 mb-8 max-w-md mx-auto">
								Create your first requirements document to start
								managing and linking requirements across your
								systems.
							</p>
							<button
								onClick={() => setShowNewDocument(true)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
							>
								<Plus className="w-5 h-5 mr-2" />
								Create New Document
							</button>
						</div>
					) :currentProject ? (
						<RequirementsDocument 
							project={currentProject}
							requirements={requirementsByProject[currentProject.id] || []}
						/>
					) : (
						<DocumentsList
							viewMode={viewMode}
							projects={projects}
							onClickDocument={handleProjectSelect}
						/>
					)}

					{/* New Document Modal */}
					{showNewDocument && (
						<NewDocumentModal
							onClose={() => setShowNewDocument(false)}
							onSuccess={handleNewProject}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default DocumentManager;
