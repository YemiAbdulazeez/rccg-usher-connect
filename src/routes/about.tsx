import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Target, Award, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RCCG National Ushering Department" },
      { name: "description", content: "History, vision, mission, core values and leadership of the RCCG National Ushering Department." },
      { property: "og:title", content: "About — RCCG National Ushering Department" },
      { property: "og:description", content: "Decades of faithful service across every region, province, zone, area and parish." },
    ],
  }),
  component: AboutPage,
});

const leaders = [
  { role: "National Head Usher", name: "Pastor (Engr.) Daniel Okafor" },
  { role: "Assistant National Head Usher", name: "Pastor (Mrs.) Grace Adebayo" },
  { role: "National Secretary", name: "Deacon Samuel Eze" },
  { role: "National Finance Officer", name: "Sister Funmi Olatunji" },
  { role: "National Training Coordinator", name: "Deaconess Ruth Iweanya" },
  { role: "National Welfare Officer", name: "Pastor Tunde Akinyele" },
];

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <Badge className="bg-white/15 text-white border-white/20"><Sparkles className="h-3 w-3 mr-1" /> About RNUMS</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 max-w-3xl">A heritage of service, holiness and excellence.</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">The RCCG National Ushering Department coordinates ushers worldwide — built on the foundation of love, holiness, fruitfulness and the joy of serving Jesus.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-12">
          {[
            { icon: BookOpen, title: "Our History", body: "Founded to bring order and excellence to ushering ministry, the department has grown over decades into a global structure serving millions of worshippers every week." },
            { icon: Eye, title: "Our Vision", body: "An usher in every nation, serving with excellence, holiness and the joy of Jesus Christ." },
            { icon: Target, title: "Our Mission", body: "To equip, organise and deploy ushers globally for the work of the Kingdom, in unity and order." },
            { icon: Award, title: "Core Values", body: "Holiness. Love. Excellence. Fruitfulness. Service. Order. Hospitality." },
          ].map((b) => (
            <Card key={b.title} className="border-border/60 shadow-card-elegant">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold mt-4">{b.title}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-accent text-accent-foreground">Leadership</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">National Leadership Structure</h2>
            <p className="text-muted-foreground mt-3">The faithful servants leading the National Ushering Department.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leaders.map((l) => (
              <Card key={l.name} className="border-border/60 shadow-card-elegant hover:shadow-elegant transition-smooth">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold text-lg shadow-soft">
                    {l.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Heart className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold mt-4">Brand Meaning</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {[
              { c: "bg-primary", label: "Blue", meaning: "Divine Love" },
              { c: "bg-card border border-border", label: "White", meaning: "Holiness" },
              { c: "bg-destructive", label: "Red", meaning: "Blood of Jesus" },
              { c: "bg-success", label: "Green", meaning: "Fruitfulness" },
            ].map((b) => (
              <div key={b.label}>
                <div className={`h-20 rounded-2xl ${b.c} shadow-soft mx-auto`} />
                <p className="font-bold mt-3">{b.label}</p>
                <p className="text-sm text-muted-foreground">{b.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
