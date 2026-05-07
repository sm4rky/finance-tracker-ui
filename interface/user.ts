export interface UserProfile {
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  username?: string | null;
  passwordLoginEnabled?: boolean;
  role: string;
  plan: string;
}
