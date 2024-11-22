import React, { useState, useEffect } from "react";
import { Plus, History, AlertTriangle } from "lucide-react";
import { useProjects, useRequirements } from "@/context/DataContext";
import RequirementAnalysisModal from "./RequirementAnalysisModal";
import type { Requirement } from "@/types/data";

interface RequirementsTableProps {
	requirements: Requirement[];
}

const RequirementsTable: React.FC<RequirementsTableProps> = ({
	requirements,
}) => {
	const { currentProject } = useProjects();
	const { create, update, query, setCurrentRequirement } = useRequirements();
	const [editingCell, setEditingCell] = useState<{
		rowId: string;
		field: string;
	} | null>(null);
	const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

	if (!currentProject) return null;

	const handleCellEdit = async (
		requirementId: string,
		field: string,
		value: any
	) => {
		if (field === "content") {
			await update("requirements", requirementId, { content: value });
		} else {
			const requirement = requirements.find(
				(r) => r.id === requirementId
			);
			if (requirement) {
				await update("requirements", requirementId, {
					metadata: {
						...requirement.metadata,
						[field]: value,
					},
				});
			}
		}
	};

	const handleAddNewRow = async () => {
		const newRequirement = {
			id: crypto.randomUUID() as string,
			projectId: currentProject.id,
			content: "",
			type: "functional",
			status: "draft",
			priority: "medium",
			metadata: {},
			links: [],
		};

		await create("requirements", newRequirement);
		setEditingCell({ rowId: newRequirement.id, field: "content" });
		//update project
		const updatedRequirements: string[] = [
			...currentProject.requirementIds,
			newRequirement.id,
		];
		await update("projects", currentProject.id, {
			requirementIds: updatedRequirements,
		});
	};

	const handleKeyDown = (
		e: React.KeyboardEvent,
		requirementId: string,
		field: string
	) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			setEditingCell(null);
		} else if (e.key === "Tab") {
			e.preventDefault();
			const fields = [
				"content",
				...(currentProject.properties?.map((col) => col.id) || []),
			];
			const currentIndex = fields.indexOf(field);
			const nextField = fields[currentIndex + 1];
			const nextRow =
				requirements[
					requirements.findIndex((r) => r.id === requirementId) + 1
				];

			if (nextField) {
				setEditingCell({ rowId: requirementId, field: nextField });
			} else if (nextRow) {
				setEditingCell({ rowId: nextRow.id, field: fields[0] });
			} else {
				handleAddNewRow();
			}
		}
	};

	const renderCell = (requirement: Requirement, field: string) => {
		const isEditing =
			editingCell?.rowId === requirement.id &&
			editingCell?.field === field;
		let value =
			field === "content"
				? requirement.content
				: requirement.metadata?.[field];
		value = value ?? "";

		const column = currentProject.properties?.find(
			(col) => col.id === field
		);

		if (field === "content") {
			return (
				<div className="flex items-center space-x-2">
					<div
						onClick={() =>
							setEditingCell({ rowId: requirement.id, field })
						}
						className="flex-1 min-h-[2rem] flex items-center cursor-text text-sm text-gray-900 dark:text-dark-text-primary p-2 hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10 rounded"
					>
						{isEditing ? (
							<textarea
								autoFocus
								value={value}
								onChange={(e) =>
									handleCellEdit(
										requirement.id,
										field,
										e.target.value
									)
								}
								onBlur={() => setEditingCell(null)}
								onKeyDown={(e) =>
									handleKeyDown(e, requirement.id, field)
								}
								className="w-full bg-transparent border-none focus:ring-0 text-sm dark:text-dark-text-primary resize-none"
								rows={1}
								style={{ height: "auto", minHeight: "24px" }}
								onInput={(e) => {
									e.currentTarget.style.height = "auto";
									e.currentTarget.style.height =
										e.currentTarget.scrollHeight + "px";
								}}
							/>
						) : (
							value || (
								<span className="text-gray-400 dark:text-dark-text-secondary">
									Click to edit...
								</span>
							)
						)}
					</div>
					{requirement.analysis && (
						<button
							onClick={() => setShowAnalysis(requirement.id)}
							className="p-1 text-gray-400 hover:text-dark-accent dark:text-dark-text-secondary dark:hover:text-dark-accent transition-colors"
							title="View Analysis"
						>
							<History className="w-4 h-4" />
						</button>
					)}
					{requirement.content && !requirement.analysis && (
						<button
							onClick={() => setShowAnalysis(requirement.id)}
							className="p-1 text-amber-500 hover:text-amber-600 transition-colors"
							title="Requirement needs analysis"
						>
							<AlertTriangle className="w-4 h-4" />
						</button>
					)}
				</div>
			);
		}

		if (!column) return null;

		return (
			<div
				onClick={() => setEditingCell({ rowId: requirement.id, field })}
				className="min-h-[2rem] flex items-center cursor-text text-sm text-gray-900 dark:text-dark-text-primary p-2 hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10 rounded"
			>
				{isEditing ? (
					column.type === "select" ? (
						<select
							autoFocus
							value={value}
							onChange={(e) =>
								handleCellEdit(
									requirement.id,
									field,
									e.target.value
								)
							}
							onBlur={() => setEditingCell(null)}
							onKeyDown={(e) =>
								handleKeyDown(e, requirement.id, field)
							}
							className="w-full bg-transparent border-none focus:ring-0 text-sm dark:text-dark-text-primary"
						>
							<option value="">Select...</option>
							{column.options?.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					) : column.type === "date" ? (
						<input
							type="date"
							autoFocus
							value={value}
							onChange={(e) =>
								handleCellEdit(
									requirement.id,
									field,
									e.target.value
								)
							}
							onBlur={() => setEditingCell(null)}
							onKeyDown={(e) =>
								handleKeyDown(e, requirement.id, field)
							}
							className="w-full bg-transparent border-none focus:ring-0 text-sm dark:text-dark-text-primary"
						/>
					) : (
						<input
							type={column.type === "number" ? "number" : "text"}
							autoFocus
							value={value}
							onChange={(e) =>
								handleCellEdit(
									requirement.id,
									field,
									e.target.value
								)
							}
							onBlur={() => setEditingCell(null)}
							onKeyDown={(e) =>
								handleKeyDown(e, requirement.id, field)
							}
							className="w-full bg-transparent border-none focus:ring-0 text-sm dark:text-dark-text-primary"
						/>
					)
				) : (
					value || (
						<span className="text-gray-400 dark:text-dark-text-secondary">
							Click to edit...
						</span>
					)
				)}
			</div>
		);
	};

	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead>
					<tr className="bg-gray-50 dark:bg-dark-bg-start">
						<th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
							Requirement
						</th>
						{currentProject.properties?.map((column) => (
							<th
								key={column.id}
								className="text-left p-4 text-sm font-medium text-gray-500 dark:text-dark-text-secondary whitespace-nowrap"
							>
								{column.name}
								{column.required && (
									<span className="text-red-500 ml-1">*</span>
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
					{!requirements || requirements.length === 0 ? (
						<tr>
							<td
								colSpan={
									currentProject.properties?.length ? +1 : 5
								}
								className="p-4 text-center text-gray-500 dark:text-dark-text-secondary"
							>
								No requirements found.
							</td>
						</tr>
					) : (
						requirements.map((requirement) => (
							<tr
								onClick={() =>
									setCurrentRequirement(requirement.id)
								}
								key={requirement.id}
								className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
							>
								<td className="p-4">
									{renderCell(requirement, "content")}
								</td>
								{currentProject.properties?.map((column) => (
									<td key={column.id} className="p-4">
										{renderCell(requirement, column.id)}
									</td>
								))}
							</tr>
						))
					)}
					<tr>
						<td
							colSpan={currentProject.properties?.length ? +1 : 5}
							className="p-4"
						>
							<button
								onClick={handleAddNewRow}
								className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary hover:text-dark-accent dark:hover:text-dark-accent transition-colors"
							>
								<Plus className="w-4 h-4 mr-1" />
								NEW ROW
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			{showAnalysis && (
				<RequirementAnalysisModal
					requirement={
						requirements.find((r) => r.id === showAnalysis)!
					}
					onClose={() => setShowAnalysis(null)}
				/>
			)}
		</div>
	);
};

export default RequirementsTable;
