import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note, ShoppingItem, StripeConfiguration } from "../backend";
import { useActor } from "./useActor";

export function useAllNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotesByPriceAscending();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOwnedNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["owned-notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnedNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdminAssigned() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin-assigned"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isAdminAssigned();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).claimFirstAdmin() as Promise<boolean>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["is-admin"] });
      qc.invalidateQueries({ queryKey: ["is-admin-assigned"] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error("Not connected");
      return actor.addNote(note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateNote(note);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteNote(noteId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useCreateCheckout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

export function useSetStripeConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Not connected");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stripe-configured"] }),
  });
}
