// Map seeded image_url paths -> bundled ES module URLs.
import vanilla from "@/assets/flavor-vanilla.jpg";
import chocolate from "@/assets/flavor-chocolate.jpg";
import pistachio from "@/assets/flavor-pistachio.jpg";
import caramel from "@/assets/flavor-caramel.jpg";
import strawberry from "@/assets/flavor-strawberry.jpg";
import mango from "@/assets/flavor-mango.jpg";

const map: Record<string, string> = {
  "/src/assets/flavor-vanilla.jpg": vanilla,
  "/src/assets/flavor-chocolate.jpg": chocolate,
  "/src/assets/flavor-pistachio.jpg": pistachio,
  "/src/assets/flavor-caramel.jpg": caramel,
  "/src/assets/flavor-strawberry.jpg": strawberry,
  "/src/assets/flavor-mango.jpg": mango,
};

export function resolveProductImage(url: string | null | undefined): string {
  if (!url) return vanilla;
  if (url.startsWith("http")) return url;
  return map[url] ?? vanilla;
}
