// context/UserContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "@/services/userService";
import type { UserData } from "@/types/user";

interface UserContextValue {
	userData: UserData | null;
	isLoading: boolean;
	error: Error | null;
	refreshUserData: () => Promise<void>;
	addUserToProject: (projectId: string) => Promise<void>;
	removeUserFromProject: (projectId: string) => Promise<void>;
	updateSettings: (settings: Partial<UserData["settings"]>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const { user, userData: authUserData } = useAuth();
	const [state, setState] = useState<UserContextValue>({
		userData: null,
		isLoading: true,
		error: null,
		refreshUserData: async () => {},
		addUserToProject: async () => {},
		removeUserFromProject: async () => {},
		updateSettings: async () => {},
	});

	// Initialize user data when auth state changes
	useEffect(() => {
		const initializeUserData = async () => {
			if (!user || !authUserData) {
				setState((prev) => ({
					...prev,
					userData: null,
					isLoading: false,
				}));
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true }));

			try {
				// Fetch current user data
				const currentUser = await userService.getUserById(user.uid);

				if (!currentUser) {
					throw new Error("Failed to fetch user data");
				}

				// Set initial user data from auth context with required fields
				setState((prev) => ({
					...prev,
					userData: currentUser,
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error as Error,
					isLoading: false,
				}));
			}
		};

		initializeUserData();
	}, [user, authUserData]);

	const refreshUserData = async () => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			const userData = await userService.getUserById(user.uid);
			setState((prev) => ({
				...prev,
				userData,
				isLoading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	const addUserToProject = async (projectId: string) => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.addUserToProject(user.uid, projectId);
			await refreshUserData();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	}

	const removeUserFromProject = async (projectId: string) => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.removeUserFromProject(user.uid, projectId);
			await refreshUserData();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	}

	const updateSettings = async (
		settings: Partial<NonNullable<UserContextValue["userData"]>["settings"]>
	) => {
		if (!user?.uid) return;
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			await userService.updateUserSettings(user.uid, settings);
			await refreshUserData();
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error as Error,
				isLoading: false,
			}));
		}
	};

	return (
		<UserContext.Provider
			value={{
				...state,
				refreshUserData,
				addUserToProject,
				removeUserFromProject,
				updateSettings,
			}}
		>
			{!state.isLoading && children}
		</UserContext.Provider>
	);
}

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
