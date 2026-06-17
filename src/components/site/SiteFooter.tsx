import { Snowflake, Instagram, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-gradient-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-accent" />
            <span className="font-display text-3xl">FrostBite</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Small-batch ice cream churned slow in copper kettles. Made the day it ships.
            Never re-frozen, never compromised.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All flavors</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">Classic creams</Link></li>
            <li><Link to="/shop" className="hover:text-foreground">Sorbets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-medium">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">Our story</Link></li>
            <li><a href="mailto:hello@frostbite.shop" className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3 w-3" />hello@frostbite.shop</a></li>
            <li><a href="#" className="inline-flex items-center gap-1 hover:text-foreground"><Instagram className="h-3 w-3" />@frostbite</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FrostBite Creamery — Churned with obsession.
      </div>
    </footer>
  );
}
