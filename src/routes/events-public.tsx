import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar } from "lucide-react";
import {
  gallery1 as gal1,
  gallery2 as gal2,
  gallery3 as gal3,
  heroUshers as hero,
} from "@/assets/images";

export const Route = createFileRoute("/events-public")({
  head: () => ({
    meta: [
      { title: "Events — RNUMS" },
      { name: "description", content: "Upcoming RCCG National Ushering events, conventions and congresses." },
      { property: "og:title", content: "Events — RNUMS" },
      { property: "og:description", content: "Be part of what God is doing across our regions, provinces and parishes." },
    ],
  }),
  component: EventsPublic,
});

const events = [
  { img: hero, title: "Holy Ghost Congress 2026", date: "Aug 1 – 7", place: "Redemption Camp", scope: "National", reg: 84210 },
  { img: gal1, title: "Annual Ushers Conference", date: "Sep 5", place: "Lagos Province", scope: "Provincial", reg: 2310 },
  { img: gal2, title: "Leadership Retreat", date: "Oct 12", place: "Region 4 HQ", scope: "Regional", reg: 540 },
  { img: gal3, title: "Convention Rehearsal", date: "Jul 28", place: "Ikeja Zone", scope: "Zonal", reg: 180 },
  { img: hero, title: "Workers' Day", date: "Jul 21", place: "Strong Tower", scope: "Parish", reg: 96 },
  { img: gal1, title: "Special Convention", date: "Dec 27 – Jan 1", place: "Redemption Camp", scope: "National", reg: 124800 },
];

function EventsPublic() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-32 pb-12 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <Badge className="bg-white/15 text-white border-white/20"><Calendar className="h-3 w-3 mr-1" /> Upcoming Events</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Be part of what God is doing.</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Card key={e.title} className="overflow-hidden border-border/60 shadow-card-elegant hover:shadow-elegant hover:-translate-y-1 transition-smooth">
              <div className="relative h-48">
                <img src={e.img} alt="" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">{e.scope}</Badge>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs uppercase tracking-wider opacity-80">{e.date}</p>
                  <p className="text-lg font-bold">{e.title}</p>
                </div>
              </div>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.place}</p>
                  <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {e.reg.toLocaleString()} registered</p>
                </div>
                <Button variant="brand" size="sm">Register</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
