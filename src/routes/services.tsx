import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck, CalendarCheck, GraduationCap, BedDouble, IdCard,
  ShoppingBag, Wallet, HandHeart, MessageSquare, FileText, LifeBuoy, BarChart3,
  ArrowRight, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — RNUMS" },
      { name: "description", content: "Platform services: attendance, training, hostel booking, ID cards, finance, store, welfare and more." },
      { property: "og:title", content: "Services — RNUMS" },
      { property: "og:description", content: "Everything an ushering family needs in one secure, modern platform." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: ClipboardCheck, title: "Attendance", desc: "Geo-fenced check-ins, QR badges and live attendance dashboards." },
  { icon: CalendarCheck, title: "Events", desc: "National to parish events with registration, seating and QR check-in." },
  { icon: GraduationCap, title: "Training", desc: "Online, hybrid and physical courses with certification." },
  { icon: BedDouble, title: "Hostel Booking", desc: "Lotto, UBA, Jerusalem hostels with real-time availability." },
  { icon: IdCard, title: "ID Cards", desc: "Apply, renew, replace and verify digital ID cards with QR." },
  { icon: ShoppingBag, title: "E-Commerce", desc: "Uniforms, badges, books and convention materials." },
  { icon: Wallet, title: "Finance & Dues", desc: "Paystack, Flutterwave, Monnify and bank transfer." },
  { icon: HandHeart, title: "Welfare", desc: "Medical, bereavement, emergency and family support." },
  { icon: MessageSquare, title: "Community", desc: "Directory, forums, prayer requests, opportunities." },
  { icon: FileText, title: "Reporting", desc: "Geo-validated reports with photo/video and exports." },
  { icon: LifeBuoy, title: "Support", desc: "Tickets, knowledge base, live chat and WhatsApp." },
  { icon: BarChart3, title: "Analytics", desc: "National to parish KPIs, heat maps and trends." },
];

function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <Badge className="bg-white/15 text-white border-white/20"><Sparkles className="h-3 w-3 mr-1" /> Platform Services</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Everything an ushering family needs.</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">Twelve enterprise-grade modules — built for the entire RCCG ushering structure, worldwide.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Card key={s.title} className="border-border/60 shadow-card-elegant hover:shadow-elegant hover:-translate-y-1 transition-smooth group">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft mb-4 group-hover:scale-110 transition-smooth">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild variant="brand" size="lg">
              <Link to="/register">Get started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
