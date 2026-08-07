"use client";

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ZENMEN_REELS } from "@/lib/instagram/default-reels";
import { Clapperboard, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "../dashboard/GlassCard";

type ReelRow = {
  key: string;
  sourceType: "instagram_url" | "upload";
  reelUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  isActive: boolean;
  order: number;
};

export default function AdminInstagramReelsSettings() {
  const [rows, setRows] = useState<ReelRow[]>([]);
  const [health, setHealth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram-reels");
      const data = await res.json();
      if (data.success && data.config?.reels?.length) {
        setRows(
          data.config.reels.map(
            (r: Record<string, unknown>, i: number) => ({
              key: String(r._id ?? `row-${i}`),
              sourceType: (r.sourceType as ReelRow["sourceType"]) ?? "upload",
              reelUrl: String(r.reelUrl ?? ""),
              videoUrl: String(r.videoUrl ?? ""),
              thumbnailUrl: String(r.thumbnailUrl ?? ""),
              title: String(r.title ?? ""),
              isActive: r.isActive !== false,
              order: Number(r.order ?? i + 1),
            }),
          ),
        );
      } else {
        setRows(
          DEFAULT_ZENMEN_REELS.map((r, i) => ({
            key: `default-${r.id}`,
            sourceType: "upload" as const,
            reelUrl: r.permalink,
            videoUrl: r.media_url,
            thumbnailUrl: r.thumbnail_url,
            title: r.caption,
            isActive: true,
            order: i + 1,
          })),
        );
      }
    } catch {
      setMessage("Could not load reel config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        sourceType: "instagram_url",
        reelUrl: "",
        videoUrl: "",
        thumbnailUrl: "",
        title: "",
        isActive: true,
        order: prev.length + 1,
      },
    ]);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/instagram-reels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reels: rows.map((r) =>
            r.sourceType === "instagram_url"
              ? {
                  sourceType: "instagram_url",
                  reelUrl: r.reelUrl,
                  title: r.title,
                  isActive: r.isActive,
                  order: r.order,
                }
              : {
                  sourceType: "upload",
                  videoUrl: r.videoUrl,
                  thumbnailUrl: r.thumbnailUrl,
                  title: r.title,
                  isActive: r.isActive,
                  order: r.order,
                },
          ),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Save failed");
      setMessage("Reels saved. Homepage uses Graph cache when token is set, else this list.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function refreshGraph() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/instagram-reels/refresh", {
        method: "POST",
      });
      const data = await res.json();
      if (data.health) {
        setHealth(
          `Cache: ${data.health.reelsCount} reels · healthy: ${data.health.isHealthy}`,
        );
      }
      setMessage("Instagram Graph cache refreshed (in-memory).");
    } catch {
      setMessage("Refresh failed — check INSTAGRAM_ACCESS_TOKEN");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-5 h-5 text-[#7da8c7]" />
          <div>
            <h2 className="text-xl font-semibold text-[#0f172a]">Instagram Reels</h2>
            <p className="text-sm text-[#64748b]">
              Fallback when Graph API is empty. Default studio videos pre-filled.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refreshGraph()} disabled={saving}>
            Refresh Graph
          </Button>
          <Button
            className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save reels"}
          </Button>
        </div>
      </div>

      {health ? <p className="text-xs text-[#64748b] mb-4">{health}</p> : null}
      {message ? (
        <p className="text-sm text-[#0f172a] mb-4 p-3 bg-[#f8fafc] border border-[#e2e8f0]">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-[#64748b] text-sm">Loading…</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]"
            >
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label className="text-xs text-[#64748b]">Type</Label>
                  <select
                    className="block mt-1 border border-[#e2e8f0] rounded-md px-2 py-2 text-sm bg-white"
                    value={row.sourceType}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? {
                                ...r,
                                sourceType: e.target.value as ReelRow["sourceType"],
                              }
                            : r,
                        ),
                      )
                    }
                  >
                    <option value="instagram_url">Instagram URL</option>
                    <option value="upload">Uploaded / local URL</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs text-[#64748b]">Title</Label>
                  <Input
                    value={row.title}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, title: e.target.value } : r,
                        ),
                      )
                    }
                    className="mt-1 bg-white border-[#e2e8f0]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() =>
                    setRows((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {row.sourceType === "instagram_url" ? (
                <Input
                  placeholder="https://www.instagram.com/reel/…"
                  value={row.reelUrl}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, reelUrl: e.target.value } : r,
                      ),
                    )
                  }
                  className="bg-white border-[#e2e8f0]"
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Video URL e.g. /reels/img_5399.mp4"
                    value={row.videoUrl}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, videoUrl: e.target.value } : r,
                        ),
                      )
                    }
                    className="bg-white border-[#e2e8f0]"
                  />
                  <Input
                    placeholder="Thumbnail URL (optional)"
                    value={row.thumbnailUrl}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, thumbnailUrl: e.target.value } : r,
                        ),
                      )
                    }
                    className="bg-white border-[#e2e8f0]"
                  />
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addRow} className="border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Add reel
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
