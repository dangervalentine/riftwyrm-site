import { StoreButton } from "./StoreButton";
import { site } from "./site";

/** Both stores side by side, each live or coming soon by its URL in
 * components/site.ts. Side by side at every width; under 360px each
 * drops its small top line to fit. Until the Play listing is live, the
 * Google Play button leads to this site's beta sign-up instead. */
export default function StoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`grid w-full max-w-md grid-cols-2 gap-2 min-[360px]:gap-3 ${className}`}>
      <StoreButton label="App Store" eyebrow="Download on the" href={site.stores.appStore} />
      {site.stores.googlePlay ? (
        <StoreButton label="Google Play" eyebrow="Get it on" href={site.stores.googlePlay} />
      ) : (
        <StoreButton label="Google Play" eyebrow="Beta on" href="/beta" />
      )}
    </div>
  );
}
