import React, { useState, useEffect } from "react";
import { Save, X, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGumloop } from "@/lib/gumloop";
import {
	Priority,
	RequirementType,
	TaskStatus,
	type Requirement,
} from "@/types/data";
import { useData, useProjects, useRequirements } from "@/context/DataContext";
import { Permissions, Output } from "@/types/data";
import AnalysisDisplay from "./AnalysisDisplay";

interface RequirementEditorProps {
	onClose: () => void;
}

const RequirementEditor: React.FC<RequirementEditorProps> = ({ onClose }) => {
	const {
		currentProject,
		isLoading,
		operationError,
		currentRequirement,
		setCurrentRequirement,
	} = useData();
	const { update: updateProject } = useProjects();
	const { create: addRequirement, update: updateRequirement } =
		useRequirements();
	const [formData, setFormData] = useState({
		content: "",
		type: "functional" as RequirementType,
		status: "draft" as TaskStatus,
		priority: "medium" as Priority,
	});
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysis, setAnalysis] = useState<string| null>(null);
	const [showAnalysis, setShowAnalysis] = useState(false);
	const [output, setOutput] = useState<Output[]>([]);
	const [activeRunId, setActiveRunId] = useState<string | null>(null);
	const { startPipeline, getPipelineRun } = useGumloop();

	useEffect(() => {
		if (currentRequirement) {
			setFormData({
				content: currentRequirement.content || "",
				type: currentRequirement.type || "functional",
				status: currentRequirement.status || TaskStatus.DRAFT,
				priority: currentRequirement.priority || "medium",
			});
			if (currentRequirement.analysis) {
				setAnalysis(currentRequirement.analysis.rewrittenEARS);
				setShowAnalysis(true);
			}
		}
	}, [currentRequirement]);

	const handleAnalyze = async () => {
		if (!formData.content.trim()) return;

		setIsAnalyzing(true);
		try {

			const response = await startPipeline(
                formData.content,
            );
            
            if (!response?.run_id) {
                throw new Error('No run ID received from pipeline');
            }

			// Update Project with new requirementd TODO

            setActiveRunId(response.run_id);


			const pollPipelineStatus = async () => {
                const run = await getPipelineRun(response.run_id);
                if (run) {
                    switch (run.state) {
                        case 'DONE':
                            const assistantMessage = {
                                role: 'assistant',
                                content: run.outputs?.output || 'Success!'
                            };
                            setOutput(prev => [...prev, assistantMessage as Output]);
                            setIsAnalyzing(false);
							setAnalysis(assistantMessage.content);
							setShowAnalysis(true);
                            clearInterval(pollInterval);

							// Update Project with new requirement TODO 

                            break;
                        case 'RUNNING':
                            // Keep loading state true while running
                            setIsAnalyzing(true);
                            break;
                        case 'FAILED':
                            setOutput(prev => [...prev, {
                                role: 'assistant',
                                content: 'Pipeline run failed. Please try again.'
                            }]);
                            setIsAnalyzing(false);
                            clearInterval(pollInterval);
                            break;
                        default:
                            break;
                    }
                }
            }

            const pollInterval = setInterval(pollPipelineStatus, 1000);
		} catch (error) {
			console.error("Analysis failed:", error);
			setOutput((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Analysis failed. Please try again.",
				},
			]);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentProject) return;

		const requirementData: Partial<Requirement> = {
			...formData,
			projectId: currentProject.id,
			regulationIds: [],
			childrenIds: [],
			tags: [],
			attachments: [],
			comments: [],
			output: [],
			permissions: {
				edit: [currentProject.createdBy],
				view: [currentProject.createdBy],
				admin: [currentProject.createdBy],
				public: false,
			} as Permissions,
		};

		try {
			if (currentRequirement) {
				await updateRequirement(
					"requirements",
					currentRequirement.id,
					requirementData
				);
			} else {
				const req = {
					...requirementData,
					id: crypto.randomUUID(),
				};
				await addRequirement("requirements", req);
				await updateProject("projects", currentProject.id, {
					requirementIds: [
						...(currentProject.requirementIds || []),
						req.id,
					],
				});
			}
			await setCurrentRequirement(null);
			onClose();
		} catch (error) {
			console.error("Failed to save requirement:", error);
		}
	};

	if (!currentProject) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
						{currentRequirement
							? "Edit Requirement"
							: "New Requirement"}
					</h2>
					<button
						onClick={async () => {
							await setCurrentRequirement(null);
							onClose();
						}}
						className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-500"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-3 gap-6">
						<div className="col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
								Requirement Text
							</label>
							<textarea
								value={formData.content}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										content: e.target.value,
									}))
								}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
								placeholder="Enter requirement text..."
							/>
						</div>

						<div>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
										Type
									</label>
									<select
										value={formData.type}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												type: e.target
													.value as RequirementType,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
									>
										<option value="functional">
											Functional
										</option>
										<option value="non-functional">
											Non-Functional
										</option>
										<option value="performance">
											Performance
										</option>
										<option value="interface">
											Interface
										</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
										Status
									</label>
									<select
										value={formData.status}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												status: e.target
													.value as TaskStatus,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
									>
										<option value="draft">Draft</option>
										<option value="review">Review</option>
										<option value="approved">
											Approved
										</option>
										<option value="implemented">
											Implemented
										</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
										Priority
									</label>
									<select
										value={formData.priority}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												priority: e.target
													.value as Priority,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="critical">
											Critical
										</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end space-x-3">
						<button
							type="button"
							onClick={handleAnalyze}
							disabled={isAnalyzing || !formData.content.trim()}
							className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
								isAnalyzing || !formData.content.trim()
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "text-white bg-green-600 hover:bg-green-700"
							}`}
						>
							{isAnalyzing ? (
								<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<CheckCircle2 className="w-4 h-4 mr-2" />
							)}
							Analyze & Improve
						</button>
						<button
							type="submit"
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-dark-accent hover:bg-dark-accent-hover rounded-lg"
						>
							<Save className="w-4 h-4 mr-2" />
							{currentRequirement ? "Update" : "Create"}{" "}
							Requirement
						</button>
					</div>
				</form>
			</div>
			{showAnalysis && (
        <AnalysisDisplay aiOutput={analysis as string}/>
      )}
		</div>
	);
};

export default RequirementEditor;