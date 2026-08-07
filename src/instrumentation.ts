export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { refreshInstagramReels } = await import("@/lib/instagram/cache");
    void refreshInstagramReels();
  }
}
