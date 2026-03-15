import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useVisitorCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["visitorCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getVisitorCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useIncrementVisitor() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.incrementVisitorCount();
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerUser(name, phone);
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ phone }: { phone: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.loginUser(phone);
    },
  });
}

export function useGetAllDuas() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["duas"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDuas();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuranSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["quranSettings"],
    queryFn: async () => {
      if (!actor) return ["", []] as [string, Array<[bigint, boolean]>];
      return actor.getQuranSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminLogin(username, password);
    },
  });
}

export function useGetAllUsers(adminToken: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers", adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getAllUsers(adminToken);
    },
    enabled: !!actor && !isFetching && !!adminToken,
  });
}

export function useSetReciterUrl() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adminToken,
      url,
    }: { adminToken: string; url: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setReciterUrl(adminToken, url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quranSettings"] }),
  });
}

export function useSetSurahEnabled() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adminToken,
      surahNumber,
      enabled,
    }: {
      adminToken: string;
      surahNumber: bigint;
      enabled: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setSurahEnabled(adminToken, surahNumber, enabled);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quranSettings"] }),
  });
}

export function useAddDua() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adminToken,
      title,
      text,
      arabicText,
    }: {
      adminToken: string;
      title: string;
      text: string;
      arabicText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addDua(adminToken, title, text, arabicText);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["duas"] }),
  });
}

export function useDeleteDua() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adminToken,
      duaId,
    }: { adminToken: string; duaId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteDua(adminToken, duaId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["duas"] }),
  });
}
