import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award, BedDouble, BookOpen, Calendar, ChevronRight, ClipboardCheck,
  GraduationCap, HandHeart, Heart, IdCard, MessageSquare, Phone, Mail,
  MapPin, ShieldCheck, ShoppingBag, Sparkles, Users, Wallet, Eye, Target,
  Star, Quote, ArrowRight, PlayCircle,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  heroUshers as heroImg,
  gallery1 as gal1,
  gallery2 as gal2,
  gallery3 as gal3,
} from "@/assets/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RNUMS — RCCG National Ushering Management System" },
      {
        name: "description",
        content:
          "The official digital platform of the RCCG National Ushering Department — attendance, training, hostel, ID cards, finance and welfare in one place.",
      },
      { property: "og:title", content: "RNUMS — RCCG National Ushering Management System" },
      {
        property: "og:description",
        content:
          "Serving God Through Excellence. Manage ushering operations across every region, province, zone, area and parish worldwide.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const stats = [
  { value: "120K+", label: "Registered Ushers" },
  { value: "20", label: "Global Regions" },
  { value: "850+", label: "Provinces" },
  { value: "12K+", label: "Parishes" },
  { value: "5K+", label: "Events Managed" },
  { value: "98%", label: "Attendance Rate" },
];

const services = [
  { icon: ClipboardCheck, title: "Attendance", desc: "Geo-fenced check-ins, QR badges and live attendance dashboards for every event." },
  { icon: GraduationCap, title: "Training", desc: "Online, hybrid and physical training with quizzes, exams and digital certificates." },
  { icon: BedDouble, title: "Hostel Booking", desc: "Real-time hostel and bed availability for Lotto, UBA, Jerusalem and more." },
  { icon: IdCard, title: "ID Cards", desc: "Apply, renew and verify digital ID cards with QR validation in seconds." },
  { icon: ShoppingBag, title: "E-Commerce", desc: "Uniforms, badges, books and convention materials with full inventory & shipping." },
  { icon: Wallet, title: "Dues & Finance", desc: "Pay dues, fees and levies with Paystack, Flutterwave, Monnify or transfer." },
  { icon: HandHeart, title: "Welfare", desc: "Medical, bereavement, emergency and family support with full workflow tracking." },
  { icon: MessageSquare, title: "Communication", desc: "Bulk SMS, email, WhatsApp, push and targeted announcements at every level." },
];

const leadership = [
  { role: "National Head Usher", name: "Pastor (Engr.) Daniel Okafor" },
  { role: "Assistant National Head Usher", name: "Pastor (Mrs.) Grace Adebayo" },
  { role: "National Secretary", name: "Deacon Samuel Eze" },
  { role: "National Finance Officer", name: "Sister Funmi Olatunji" },
];

const events = [
  { date: "Aug 1–7", title: "Holy Ghost Congress", place: "Redemption Camp", tag: "National" },
  { date: "Sep 5", title: "Annual Ushers Conference", place: "Lagos Province", tag: "Province" },
  { date: "Oct 12", title: "Leadership Retreat", place: "Region 4 HQ", tag: "Region" },
];

const testimonials = [
  { quote: "RNUMS has revolutionised how we coordinate ushers across our entire province. Attendance and reports that used to take days now take minutes.", name: "Pastor M. Olubunmi", role: "Provincial Head Usher, Lagos" },
  { quote: "The hostel and ID card workflow is seamless. Brethren in the diaspora can now serve and connect without barriers.", name: "Deaconess R. Iweanya", role: "Regional Head Usher, North America" },
  { quote: "A truly enterprise platform built with the spirit of excellence the RCCG ushering family is known for.", name: "Bro. T. Akinyele", role: "Zonal Head Usher, Region 3" },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 25% 30%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white animate-fade-in">
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur mb-5">
                <Sparkles className="h-3 w-3 mr-1" /> The Redeemed Christian Church of God
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Serving God Through <span className="text-gradient-gold bg-gradient-gold bg-clip-text text-transparent">Excellence</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/85 max-w-xl leading-relaxed">
                The official National Ushering Management Portal — one secure platform for every usher, parish, zone, province and region worldwide.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/register">Join the Ushering Department <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outlineLight" size="lg">
                  <Link to="/login">Member Login</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: "120K+", l: "Ushers" },
                  { v: "20", l: "Regions" },
                  { v: "12K+", l: "Parishes" },
                ].map((s) => (
                  <div key={s.l} className="border-l-2 border-white/30 pl-3">
                    <p className="text-2xl font-bold">{s.v}</p>
                    <p className="text-xs uppercase tracking-wider text-white/70">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-gold rounded-3xl blur-2xl opacity-30" />
              <div className="relative rounded-3xl overflow-hidden shadow-elegant ring-1 ring-white/20">
                <img src={heroImg} alt="RCCG National Ushers" width={1920} height={1080} className="w-full h-auto object-cover" />
                <div className="absolute bottom-4 left-4 right-4 glass-dark rounded-xl p-4 flex items-center gap-3 text-white">
                  <div className="h-10 w-10 rounded-lg bg-destructive flex items-center justify-center"><Heart className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Holy Ghost Service • Live</p>
                    <p className="text-xs text-white/70">42,180 ushers checked in across 12K parishes</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Live</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="-mt-12 relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Users, label: "Join Ushering", to: "/register" },
              { icon: IdCard, label: "Apply for ID Card", to: "/app/id-cards" },
              { icon: BedDouble, label: "Book Hostel", to: "/app/hostel" },
              { icon: GraduationCap, label: "Member Dashboard", to: "/app" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="group">
                <Card className="bg-card shadow-card-elegant hover:shadow-elegant hover:-translate-y-1 transition-smooth border-border/60">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{a.label}</p>
                      <p className="text-xs text-muted-foreground">Get started</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24">
        <div className="container mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-accent text-accent-foreground mb-3">About National Ushers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A heritage of service, holiness and excellence.</h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              The RCCG National Ushering Department coordinates tens of thousands of ushers serving at Holy Ghost Services, Conventions, Congresses and parish gatherings across every continent — embodying the love, holiness, fruitfulness and joy of our Saviour Jesus Christ.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: "History", desc: "Decades of faithful service since the founding of the department." },
                { icon: Eye, label: "Vision", desc: "An usher in every nation, serving with excellence and holiness." },
                { icon: Target, label: "Mission", desc: "Equip, organise and deploy ushers globally for the Kingdom." },
                { icon: Award, label: "Core Values", desc: "Holiness • Love • Excellence • Fruitfulness • Service." },
              ].map((b) => (
                <Card key={b.label} className="border-border/60 hover:border-primary/40 transition-smooth">
                  <CardContent className="p-5">
                    <b.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold">{b.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="border-0 shadow-elegant overflow-hidden bg-gradient-card">
            <CardContent className="p-8 md:p-10">
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 mb-4">National Head Usher's Welcome</Badge>
              <Quote className="h-8 w-8 text-primary mb-3" />
              <p className="text-lg leading-relaxed text-foreground/90">
                "Beloved brethren, welcome to RNUMS — a tool born out of years of prayer and labour. May this platform empower us to serve our Father's house with even greater diligence, order and joy."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold">DO</div>
                <div>
                  <p className="font-semibold">Pastor (Engr.) Daniel Okafor</p>
                  <p className="text-sm text-muted-foreground">National Head Usher</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">National Leadership</p>
                <div className="space-y-2">
                  {leadership.map((l) => (
                    <div key={l.name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{l.role}</span>
                      <span className="font-medium">{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-white/15 text-white border-white/20">By the Numbers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">A global family, serving in unity.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
                <p className="text-xs md:text-sm uppercase tracking-wider text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-accent text-accent-foreground">Platform Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">Everything an ushering family needs.</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              From check-in to certification, from welfare to e-commerce — built for the entire RCCG ushering structure.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <Card key={s.title} className="group border-border/60 shadow-card-elegant hover:shadow-elegant hover:-translate-y-1 transition-smooth">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft mb-4 group-hover:scale-110 transition-smooth">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground">Upcoming Events</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">Be part of what God is doing.</h2>
            </div>
            <Button asChild variant="outline"><Link to="/events-public">View all events</Link></Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {events.map((e, i) => (
              <Card key={e.title} className="overflow-hidden border-border/60 shadow-card-elegant hover:shadow-elegant transition-smooth">
                <div className="h-44 relative overflow-hidden">
                  <img src={[gal1, gal2, gal3][i]} alt="" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">{e.tag}</Badge>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs uppercase tracking-wider opacity-80">{e.date}</p>
                    <p className="text-lg font-bold">{e.title}</p>
                  </div>
                </div>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {e.place}</div>
                  <Button asChild size="sm" variant="ghost"><Link to="/events-public">Register <ChevronRight className="h-4 w-4" /></Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge className="bg-accent text-accent-foreground">Gallery</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Moments of service and worship.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[gal1, gal2, gal3, heroImg, gal2, gal3].map((src, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden shadow-card-elegant group ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                <img src={src} loading="lazy" width={1024} height={1024} alt="" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end p-4">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-accent text-accent-foreground">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Loved by leaders and members alike.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/60 shadow-card-elegant">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>
                  <p className="text-foreground/90 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="py-24">
        <div className="container mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-10 items-stretch">
          <Card className="border-0 bg-gradient-hero text-white shadow-elegant overflow-hidden">
            <CardContent className="p-10 relative h-full flex flex-col">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="relative">
                <Badge className="bg-white/15 text-white border-white/20">Get Started</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">Ready to serve with the National Ushering family?</h2>
                <p className="mt-3 text-white/80 text-lg">Register today and complete your onboarding in minutes.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="hero" size="lg"><Link to="/register">Create account</Link></Button>
                  <Button asChild variant="outlineLight" size="lg"><Link to="/login">Sign in</Link></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-8">
              <Badge className="bg-accent text-accent-foreground">Contact Us</Badge>
              <h3 className="text-2xl font-bold mt-3">We're here to help.</h3>
              <div className="mt-6 space-y-4">
                {[
                  { icon: MapPin, label: "Address", value: "Redemption Camp, KM 46 Lagos–Ibadan Expressway, Nigeria" },
                  { icon: Phone, label: "Phone", value: "+234 800 RNUMS HQ" },
                  { icon: Mail, label: "Email", value: "info@rnums.org" },
                  { icon: ShieldCheck, label: "Office Hours", value: "Mon – Fri, 9:00 AM – 5:00 PM WAT" },
                ].map((c) => (
                  <div key={c.label} className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                      <p className="font-medium">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-40 rounded-xl bg-gradient-subtle border border-border flex items-center justify-center text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mr-2" /> Google Map preview
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
