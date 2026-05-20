import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import type { UserResponse } from "@/interface/user";

type AuthSessionState = {
  accessToken: string | null;
  user: User | null;
  /** Filled from `POST /api/users/ensure` after a successful sync. */
  userProfile: UserResponse | null;
  setFromSession: (session: Session | null) => void;
  setUserProfile: (profile: UserResponse | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthSessionState>((set, get) => ({
  accessToken: null,
  user: null,
  userProfile: null,
  setFromSession: (session) => {
    if (!session) {
      set({ accessToken: null, user: null, userProfile: null });
      return;
    }
    const prevUser = get().user;
    const sameAccount = prevUser?.id === session.user.id;
    set({
      accessToken: session.access_token,
      user: session.user,
      userProfile: sameAccount ? get().userProfile : null,
    });
  },
  setUserProfile: (profile) => set({ userProfile: profile }),
  clear: () =>
    set({
      accessToken: null,
      user: null,
      userProfile: null,
    }),
}));
