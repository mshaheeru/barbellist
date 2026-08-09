"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Stack, Text, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Building2, MapPin } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/client";
import {
  listOwnerBranches,
  selectBranch,
} from "@/lib/auth/branches";
import type { BranchSummary } from "@/lib/types";

export default function SelectBranchPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await listOwnerBranches();
      if (cancelled) return;
      if (error || !data) {
        notifications.show({
          color: "red",
          message: error ?? "Unable to load branches",
        });
        router.replace("/login");
        return;
      }
      if (data.length === 0) {
        router.replace("/login");
        return;
      }
      if (data.length === 1) {
        const { error: selectError } = await selectBranch(data[0].id);
        if (!selectError) {
          const supabase = createClient();
          await supabase.auth.refreshSession();
          window.location.assign("/dashboard");
          return;
        }
      }
      setBranches(data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onContinue = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const { error } = await selectBranch(selectedId);
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      const supabase = createClient();
      await supabase.auth.refreshSession();
      // Full navigation after session refresh — avoids empty RSC responses.
      window.location.assign("/dashboard");
    });
  };

  return (
    <AuthShell
      title="Choose a branch"
      subtitle="Select which branch you want to manage."
    >
      {loading ? (
        <Text c="dimmed" size="sm">
          Loading branches…
        </Text>
      ) : (
        <Stack gap="md">
          <Stack gap="xs">
            {branches.map((branch) => {
              const active = selectedId === branch.id;
              return (
                <UnstyledButton
                  key={branch.id}
                  onClick={() => setSelectedId(branch.id)}
                  style={{
                    border: active
                      ? "2px solid var(--mantine-color-forest-6)"
                      : "1px solid var(--mantine-color-gray-3)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    textAlign: "left",
                    background: active
                      ? "var(--mantine-color-forest-0)"
                      : "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Building2 size={20} />
                    <div>
                      <Text fw={600}>{branch.name}</Text>
                      {branch.city || branch.address ? (
                        <Text size="sm" c="dimmed">
                          <MapPin
                            size={12}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: 4,
                            }}
                          />
                          {[branch.city, branch.address]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                </UnstyledButton>
              );
            })}
          </Stack>
          <Button
            fullWidth
            size="md"
            disabled={!selectedId}
            loading={pending}
            onClick={onContinue}
          >
            Continue
          </Button>
        </Stack>
      )}
    </AuthShell>
  );
}
