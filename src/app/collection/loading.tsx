// src/app/collection/loading.tsx

export default function CollectionLoading() {
  return (
    <>

      <div className="min-h-screen bg-[#f8fafc]">

        {/* ── Banner skeleton ── */}
        <div className="relative h-[58vh] min-h-[440px] w-full grid grid-cols-3 md:grid-cols-6 border-b border-[#e2e8f0] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="zen-bone h-full w-full" />
          ))}
          {/* Centered text bones over banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 gap-4">
            <div className="zen-bone h-6 w-28 rounded-none" />
            <div className="zen-bone h-14 w-80 md:w-[500px]" />
            <div className="zen-bone h-4 w-64 md:w-96" />
          </div>
        </div>

        {/* ── Header skeleton ── */}
        <div className="pt-12 pb-6 px-6 md:px-12 lg:px-20 space-y-3">
          <div className="zen-bone h-3 w-36" />
          <div className="zen-bone h-10 w-64" />
        </div>

        {/* ── Filter bar skeleton ── */}
        <div className="hidden md:block px-12 lg:px-20 pb-5">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="zen-bone h-4 w-16" />
              ))}
            </div>
            <div className="zen-bone h-4 w-24" />
          </div>
          {/* Search bar */}
          <div className="zen-bone h-px w-full mt-2" style={{ height: 1 }} />
        </div>

        {/* ── Count line ── */}
        <div className="hidden md:block px-6 md:px-12 lg:px-20 pb-4">
          <div className="zen-bone h-3 w-40" />
        </div>

        {/* ── Product grid skeleton ── */}
        <div className="px-4 md:px-12 lg:px-20 pb-8 md:pb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                {/* Image — 3/4 aspect with logo watermark */}
                <div
                  className="zen-bone relative mb-3 border border-[#e2e8f0]"
                  style={{ aspectRatio: "3/4", position: "relative" }}
                >
                  <img
                    src="/zenmen_watermark.png"
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "95%",
                      maxWidth: 200,
                      opacity: 0.2,
                      filter: "grayscale(1) brightness(0.6)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                </div>
                {/* Category */}
                <div className="zen-bone h-2.5 w-16 mb-2" />
                {/* Title */}
                <div className="zen-bone h-3.5 w-full mb-1.5" />
                {/* Price */}
                <div className="zen-bone h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}