// services/authService.ts
import {
	Auth,
	User,
	UserCredential,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	GithubAuthProvider,
	signOut,
	sendPasswordResetEmail,
	sendEmailVerification,
	updateEmail,
	updatePassword,
	updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { setCookie, deleteCookie } from "cookies-next";

export class AuthService {
	private auth: Auth;

	constructor() {
		this.auth = auth;
	}

	async createUser(email: string, password: string): Promise<UserCredential> {
		return createUserWithEmailAndPassword(this.auth, email, password);
	}

	async signIn(email: string, password: string): Promise<UserCredential> {
		const userCredential = await signInWithEmailAndPassword(
			this.auth,
			email,
			password
		);
		await this.setAuthCookies(userCredential.user);
		return userCredential;
	}

	async signInWithGoogle(): Promise<UserCredential> {
		const provider = new GoogleAuthProvider();
		const userCredential = await signInWithPopup(this.auth, provider);
		await this.setAuthCookies(userCredential.user);
		return userCredential;
	}

	async signInWithGithub(): Promise<UserCredential> {
		const provider = new GithubAuthProvider();
		const userCredential = await signInWithPopup(this.auth, provider);
		await this.setAuthCookies(userCredential.user);
		return userCredential;
	}

	async logout(): Promise<void> {
		await signOut(this.auth);
		this.clearAuthCookies();
	}

	async resetPassword(email: string): Promise<void> {
		return sendPasswordResetEmail(this.auth, email);
	}

	async sendVerificationEmail(user: User): Promise<void> {
		return sendEmailVerification(user);
	}

	async updateUserEmail(user: User, newEmail: string): Promise<void> {
		return updateEmail(user, newEmail);
	}

	async updateUserPassword(user: User, newPassword: string): Promise<void> {
		return updatePassword(user, newPassword);
	}

	async updateUserProfile(
		user: User,
		data: { displayName?: string; photoURL?: string }
	): Promise<void> {
		return updateProfile(user, data);
	}

	private async setAuthCookies(user: User): Promise<void> {
		const token = await user.getIdToken();
		const idTokenResult = await user.getIdTokenResult();

		setCookie("auth-token", token, {
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

		setCookie("user-role", idTokenResult.claims.role || "user", {
			maxAge: 30 * 24 * 60 * 60,
			path: "/",
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
	}

	private clearAuthCookies(): void {
		deleteCookie("auth-token");
		deleteCookie("user-role");
	}

	getCurrentUser(): User | null {
		return this.auth.currentUser;
	}
}

export const authService = new AuthService();
