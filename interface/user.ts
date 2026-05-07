export interface UserProfile {
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  username?: string | null;
  role: string;
  plan: string;
}
