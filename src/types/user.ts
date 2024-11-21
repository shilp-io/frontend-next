// tpyes/user.ts
import { Timestamp } from "firebase/firestore";

export interface UserData {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
	role: "user" | "admin";
	projectIds: string[];
	createdAt: string | Timestamp;
	updatedAt: string | Timestamp;
	createdBy: string;
	updatedBy?: string;
	lastLogin: string;
	emailVerified: boolean;
	phoneNumber?: string;
	department?: string;
	settings: {
		notifications: boolean;
		theme: "light" | "dark";
	};
}
