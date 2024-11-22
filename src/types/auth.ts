import { Timestamp } from "@firebase/firestore";
export type RouteAccess = 'public' | 'private' | 'admin';

export interface RouteConfig {
  path: string;
  access: RouteAccess;
  roles?: string[];
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  photoURL?: string;
  createdAt: string | Timestamp;
  lastLogin: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  customClaims?: Record<string, any>;
}

export interface AuthError {
  code: string;
  message: string;
}