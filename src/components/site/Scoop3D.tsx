import { resolveProductImage } from "@/lib/product-images";

/**
 * CSS-based 3D scoop visualization. A floating, slowly rotating product image
 * with stacked depth layers — no WebGL/three.js dependency.
 */
export function Scoop3D({ imageUrl, alt }: { imageUrl: string | null; alt: string }) {
  const src = resolveProductImage(imageUrl);
  return (
    <div className="scoop-stage relative mx-auto h-[420px] w-full max-w-[420px]">
      {/* Soft halo */}
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-warm opacity-30 blur-3xl float-slow" />
      <div className="scoop-spin absolute inset-0 flex items-center justify-center">
        {/* Back depth layer */}
        <div
          className="absolute h-[88%] w-[88%] rounded-full bg-cover bg-center opacity-40 blur-md"
          style={{ backgroundImage: `url(${src})`, transform: "translateZ(-60px)" }}
        />
        {/* Mid layer */}
        <div
          className="absolute h-[94%] w-[94%] rounded-full bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${src})`, transform: "translateZ(-20px)" }}
        />
        {/* Front layer */}
        <img
          src={src}
          alt={alt}
          width={420}
          height={420}
          loading="eager"
          className="relative h-full w-full rounded-full object-cover shadow-warm"
          style={{ transform: "translateZ(40px)" }}
        />
      </div>
    </div>
  );
}
