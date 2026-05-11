export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole;
}
