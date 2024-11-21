// services/userService.ts
import {
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	collection,
	query,
	where,
	documentId,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserData, Project, Requirement, Regulation } from "@/types/user";

export class UserService {
	private readonly usersCollection = "users";
	private readonly projectsCollection = "projects";
	private readonly requirementsCollection = "requirements";
	private readonly regulationsCollection = "regulations";

	// User Management
	async createUserDocument(
		uid: string,
		userData: Partial<UserData>
	): Promise<void> {
		const userRef = doc(db, this.usersCollection, uid);
		await setDoc(userRef, {
			uid,
			createdAt: new Date().toISOString(),
			lastLogin: new Date().toISOString(),
			projectIds: [],
			settings: {
				notifications: true,
				theme: "light",
			},
			...userData,
		});
	}

	async getUserById(uid: string): Promise<UserData | null> {
		const userDoc = await getDoc(doc(db, this.usersCollection, uid));
		return userDoc.exists() ? (userDoc.data() as UserData) : null;
	}

	async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
		const userRef = doc(db, this.usersCollection, uid);
		await updateDoc(userRef, {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	// Project Management
	async getUserProjects(projectIds: string[]): Promise<Project[]> {
		if (!projectIds.length) return [];

		const projectsRef = collection(db, this.projectsCollection);
		const projectsQuery = query(
			projectsRef,
			where(documentId(), "in", projectIds)
		);
		const snapshot = await getDocs(projectsQuery);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Project[];
	}

	async getProjectRequirements(
		projectId: string
	): Promise<Requirement[]> {
		if (!projectId) return [];

		const projectRef = doc(db, this.projectsCollection, projectId);
		const projectSnapshot = await getDoc(projectRef);

		const requirementIds = projectSnapshot.exists() ? projectSnapshot.data().requirementIds : [];

		return requirementIds.map(async (id: string) => {
			const requirementRef = doc(db, this.requirementsCollection, id);
			const requirementSnapshot = await getDoc(requirementRef);

			return {
				id: requirementSnapshot.id,
				...requirementSnapshot.data(),
			} as Requirement;
		});
	}

	async getProjectRegulations(
		projectId: string
	): Promise<Regulation[]> {
		if (!projectId) return [];

		const projectRef = doc(db, this.projectsCollection, projectId);
		const projectSnapshot = await getDoc(projectRef);

		const regulationIds = projectSnapshot.exists() ? projectSnapshot.data().regulationIds : [];

		return regulationIds.map(async (id: string) => {
			const regulationRef = doc(db, this.regulationsCollection, id);
			const regulationSnapshot = await getDoc(regulationRef);

			return {
				id: regulationSnapshot.id,
				...regulationSnapshot.data(),
			} as Regulation;
		});
	}

	// Project Updates
	async addUserToProject(userId: string, projectId: string): Promise<void> {
		const userRef = doc(db, this.usersCollection, userId);
		const projectRef = doc(db, this.projectsCollection, projectId);

		await updateDoc(userRef, {
			projectIds: [
				...((await this.getUserById(userId))?.projectIds || []),
				projectId,
			],
		});

		await updateDoc(projectRef, {
			members: [
				...((await getDoc(projectRef)).data()?.members || []),
				userId,
			],
		});
	}

	async removeUserFromProject(
		userId: string,
		projectId: string
	): Promise<void> {
		const userRef = doc(db, this.usersCollection, userId);
		const projectRef = doc(db, this.projectsCollection, projectId);

		const userData = await this.getUserById(userId);
		const projectData = (await getDoc(projectRef)).data();

		await updateDoc(userRef, {
			projectIds:
				userData?.projectIds?.filter((id) => id !== projectId) || [],
		});

		await updateDoc(projectRef, {
			members:
				projectData?.members.filter((id: string) => id !== userId) ||
				[],
		});
	}

	// Settings Management
	async updateUserSettings(
		uid: string,
		settings: Partial<UserData["settings"]>
	): Promise<void> {
		const userRef = doc(db, this.usersCollection, uid);
		const userData = await this.getUserById(uid);

		await updateDoc(userRef, {
			settings: {
				...userData?.settings,
				...settings,
			},
		});
	}
}

export const userService = new UserService();
