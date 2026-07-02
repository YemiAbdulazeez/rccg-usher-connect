import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              The official digital platform of the RCCG National Ushering Department —
              serving God through excellence across every region, province, zone, area and parish.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/75">
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/register" className="hover:text-white">Join Ushering</Link></li>
              <li><Link to="/app/id-cards" className="hover:text-white">Apply for ID Card</Link></li>
              <li><Link to="/app/hostel" className="hover:text-white">Book Hostel</Link></li>
              <li><Link to="/app/payments" className="hover:text-white">Payment History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Organisation</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/75">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/about" className="hover:text-white">Leadership</Link></li>
              <li><Link to="/events-public" className="hover:text-white">Events</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Reach Us</h4>
            <ul className="space-y-3 text-sm text-sidebar-foreground/75">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>Redemption Camp, KM 46 Lagos–Ibadan Expressway, Nigeria</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+234 800 RNUMS HQ</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>info@rnums.org</span></li>
            </ul>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-sidebar-accent hover:bg-primary-glow flex items-center justify-center transition-smooth">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-sidebar-border flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-sidebar-foreground/60">
          <p>© {new Date().getFullYear()} RCCG National Ushering Department. All rights reserved.</p>
          <p>Serving God Through Excellence • Holiness • Love • Fruitfulness</p>
        </div>
      </div>
    </footer>
  );
}
