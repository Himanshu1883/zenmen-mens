// src/app/collection/loading.tsx
export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] pt-28 px-6 md:px-12 lg:px-20">
      <div className="h-6 w-48 bg-[rgba(200,169,110,0.08)] animate-pulse mb-4" />
      <div className="h-12 w-72 bg-[rgba(200,169,110,0.05)] animate-pulse mb-12" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-[rgba(200,169,110,0.05)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
