import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import {
  gallery1 as gal1,
  gallery2 as gal2,
  gallery3 as gal3,
  heroUshers as hero,
} from "@/assets/images";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — RNUMS" },
      { name: "description", content: "Photos and videos from RCCG National Ushering events, conventions and trainings." },
      { property: "og:title", content: "Gallery — RNUMS" },
      { property: "og:description", content: "Moments of service and worship from across the global RCCG ushering family." },
    ],
  }),
  component: GalleryPage,
});

const images = [hero, gal1, gal2, gal3, hero, gal2, gal3, gal1, hero];

function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-32 pb-12 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 60% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <Badge className="bg-white/15 text-white border-white/20">Gallery</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Moments of service, worship and excellence.</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">Conventions, congresses, trainings and parish gatherings — through the lens of our family.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl shadow-card-elegant group ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={src} alt="" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-smooth" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
