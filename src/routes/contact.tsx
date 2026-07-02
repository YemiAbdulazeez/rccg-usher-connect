import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, ShieldCheck, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RNUMS" },
      { name: "description", content: "Reach the RCCG National Ushering Department secretariat." },
      { property: "og:title", content: "Contact — RNUMS" },
      { property: "og:description", content: "Phone, email and address of the National Ushering Department." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-32 pb-16 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <Badge className="bg-white/15 text-white border-white/20">Contact Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">We'd love to hear from you.</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">Questions, partnerships, support — the National Secretariat is ready to help.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {[
              { icon: MapPin, label: "Address", value: "Redemption Camp, KM 46 Lagos–Ibadan Expressway, Nigeria" },
              { icon: Phone, label: "Phone", value: "+234 800 RNUMS HQ" },
              { icon: Mail, label: "Email", value: "info@rnums.org" },
              { icon: ShieldCheck, label: "Office Hours", value: "Mon – Fri, 9:00 AM – 5:00 PM WAT" },
            ].map((c) => (
              <Card key={c.label} className="border-border/60 shadow-card-elegant">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2 border-border/60 shadow-card-elegant">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLFormElement).reset();
                  toast.success("Message sent", { description: "The secretariat will respond within 24 hours." });
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input required placeholder="Your name" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input required type="email" placeholder="you@email.com" /></div>
                </div>
                <div className="space-y-2"><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
                <div className="space-y-2"><Label>Message</Label><Textarea required rows={6} placeholder="Write your message…" /></div>
                <Button type="submit" variant="brand" size="lg" className="w-full sm:w-auto"><Send className="h-4 w-4" /> Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
