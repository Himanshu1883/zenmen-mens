import RecentlyViewedGrid from "./RecentlyViewedGrid";

export default function RecentlyViewedSection() {
  return (
    <div className="profile-recent-shell" id="recently-viewed">
      <div className="recent-head">
        <p className="profile-eyebrow">Browsing</p>
        <h2 className="recent-title">You Recently Viewed</h2>
        <p className="recent-sub">
          Products you open from the collection are saved on this device.
        </p>
      </div>
      <RecentlyViewedGrid />
    </div>
  );
}
