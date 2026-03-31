"use client";

import { useEffect, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";

export type PlaidLinkSessionProps = {
  token: string;
  linkSessionId: string;
  onPublicToken: (publicToken: string, linkSessionId: string) => void;
  onExit: () => void;
  onOpened: () => void;
};

export function PlaidLinkSession({
  token,
  linkSessionId,
  onPublicToken,
  onExit,
  onOpened,
}: PlaidLinkSessionProps) {
  const openedRef = useRef(false);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess: (publicToken) => {
      onPublicToken(publicToken, linkSessionId);
    },
    onExit,
  });

  useEffect(() => {
    if (!ready || openedRef.current) return;

    openedRef.current = true;
    onOpened();
    open();
  }, [ready, open, onOpened]);

  return null;
}
