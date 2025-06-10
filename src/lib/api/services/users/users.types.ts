import type { BaseEntity } from "$lib/api/types/common";

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
}

export interface UserProfile extends User {
  phone?: string;
  bio?: string;
  preferences?: {
    categories: number[];
    locations: string[];
    notifications: boolean;
  };
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  preferences?: UserProfile["preferences"];
}
