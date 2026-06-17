import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Truck, MapPin, Leaf, Smile, IceCream, Heart, Sparkles, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import heroImg from "@/assets/hero-scoop.jpg";
import { listProducts } from "@/lib/shop.functions";
import { listMyOrders } from "@/lib/orders.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";

const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FrostBite — Take a Bite of Happiness" },
      { name: "description", content: "Premium handcrafted ice cream made with real ingredients and a whole lot of joy." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQO),
  component: Home,
  errorComponent: ({ error }) => <div className="p-8">Failed: {error.message}</div>,
});

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  paid:      { label: "Confirmed", icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50 border-green-200" },
  shipped:   { label: "Shipped",   icon: Truck,        color: "text-blue-600",  bg: "bg-blue-50 border-blue-200" },
  delivered: { label: "Delivered", icon: IceCream,     color: "text-primary",   bg: "bg-pink-50 border-pink-200" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-red-500",   bg: "bg-red-50 border-red-200" },
};

function Home() {
  const { data: products } = useSuspenseQuery(productsQO);
  const { user } = useAuth();
  const fetchOrders = useServerFn(listMyOrders);
  const flavors = products.slice(0, 5);
  const bestsellers = products.slice(0, 5);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
    enabled: !!user,
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-2 md:pb-24 md:pt-16 lg:px-10">
          <div className="relative z-10">
            <h1 className="font-script text-5xl leading-[0.9] text-primary md:text-6xl">Take a Bite of</h1>
            <h2 className="relative z-20 mt-2 whitespace-nowrap font-display leading-[0.9] text-accent" style={{ fontSize: "clamp(2.5rem, 5.6vw, 5.5rem)" }}>
              HAPPINESS
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-accent/75">
              At Frost Bite, every scoop is made with love, premium ingredients, and a whole lot of joy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.03]"
              >
                Explore Flavors <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border-2 border-accent bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Order Now <Truck className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "linear-gradient(135deg,#fbcfe8,#f472b6)",
                  "linear-gradient(135deg,#fde68a,#f59e0b)",
                  "linear-gradient(135deg,#bae6fd,#3b82f6)",
                ].map((bg, i) => (
                  <span key={i} className="h-10 w-10 rounded-full border-2 border-background" style={{ background: bg }} />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold text-accent">Loved by 50K+</div>
                <div className="flex items-center gap-1 text-accent/70">ice cream lovers! <Heart className="h-3.5 w-3.5 fill-primary text-primary" /></div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="A pink Frost Bite cup overflowing with chocolate, strawberry and caramel ice cream scoops"
              width={1024}
              height={1024}
              className="float-slow relative z-10 mx-auto w-full max-w-[560px] drop-shadow-[0_30px_50px_rgba(238,42,123,0.35)]"
            />
            {/* Floating 100% real ingredients badge */}
            <div className="absolute right-2 top-8 z-20 flex h-24 w-24 rotate-[12deg] flex-col items-center justify-center rounded-full bg-card text-center shadow-soft md:right-6 md:top-12 md:h-28 md:w-28">
              <span className="font-script text-[10px] leading-none text-primary">made with</span>
              <span className="font-display text-2xl leading-none text-primary">100%</span>
              <span className="font-script text-[10px] leading-none text-accent">real ingredients</span>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-6 right-4 hidden flex-col items-center gap-1 md:flex">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Scroll</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Down</span>
            <ChevronDown className="h-4 w-4 text-accent/60" />
          </div>

          {/* Dot navigation */}
          <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
            {[true, false, false, false].map((active, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${active ? "bg-primary" : "bg-accent/20"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* SCOOPS OF JOY */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="font-script text-2xl text-primary">✦ Our Flavors ✦</p>
              <h2 className="mt-1 font-display text-5xl text-accent md:text-6xl">SCOOPS OF JOY</h2>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:inline-flex"
            >
              View All Flavors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {flavors.map((p, i) => (
              <ProductCard key={p.id} product={p} eager={i === 0} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* MADE WITH PASSION */}
      <section className="bg-gradient-pink py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
          <div className="md:col-span-1">
            <img
              src={heroImg}
              alt="Bowl of scoops"
              width={600}
              height={600}
              loading="lazy"
              className="float-slow mx-auto w-full max-w-md drop-shadow-[0_25px_40px_rgba(238,42,123,0.3)]"
            />
          </div>
          <div className="md:col-span-1">
            <p className="font-script text-2xl text-primary">Our Story</p>
            <h2 className="mt-1 font-display text-5xl text-accent">MADE WITH PASSION</h2>
            <p className="mt-6 leading-relaxed text-accent/75">
              Frost Bite was born from a simple love for real ice cream. We use the finest ingredients,
              craft every flavor to perfection, and deliver happiness in every scoop.
            </p>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink"
            >
              DISCOVER OUR STORY <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="space-y-6">
            {[
              { icon: ShoppingBag, title: "Premium Ingredients" },
              { icon: Heart, title: "Crafted with Love" },
              { icon: Smile, title: "Happiness in Every Scoop" },
            ].map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                <span className="font-display text-lg leading-tight text-accent">{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="font-script text-2xl text-primary">✦ Fan Favorites ✦</p>
              <h2 className="mt-1 font-display text-5xl text-accent md:text-6xl">OUR BESTSELLERS ✦</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card transition-colors hover:border-primary hover:text-primary" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pink transition-transform hover:scale-105" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {bestsellers.map((p, i) => (
              <ProductCard key={`b-${p.id}`} product={p} index={i + 2} />
            ))}
          </div>
        </div>
      </section>

      {/* YOUR ORDERS */}
      {user && (
        <section id="your-orders" className="bg-gradient-navy py-20 text-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-script text-2xl text-primary">✦ Your Account ✦</p>
                <h2 className="mt-1 font-display text-5xl text-cream md:text-6xl">YOUR ORDERS</h2>
              </div>
              <Link
                to="/account"
                className="inline-flex items-center gap-2 rounded-full border-2 border-cream/30 px-6 py-3 text-xs font-bold uppercase tracking-widest text-cream transition-colors hover:border-primary hover:text-primary"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {ordersLoading && (
              <div className="flex items-center gap-3 text-cream/60">
                <IceCream className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading your orders…</span>
              </div>
            )}

            {!ordersLoading && orders.length === 0 && (
              <div className="flex flex-col items-center rounded-3xl border border-cream/10 bg-cream/5 py-16 text-center">
                <Package className="h-12 w-12 text-cream/30" />
                <p className="mt-4 font-display text-2xl text-cream/60">No orders yet</p>
                <p className="mt-2 text-sm text-cream/40">Your orders will appear here once placed</p>
                <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-4">
                {(orders as any[]).slice(0, 3).map((o) => {
                  const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={o.id} className="rounded-3xl border border-cream/10 bg-cream/5 p-6 backdrop-blur-sm transition-colors hover:border-primary/40">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-cream/50">
                            {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="mt-1 font-display text-3xl text-cream">{formatPrice(o.total_cents)}</p>
                          <p className="font-mono text-xs text-cream/40">#{o.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
                          <Icon className="h-3.5 w-3.5" />{cfg.label}
                        </span>
                      </div>
                      <ul className="mt-4 divide-y divide-cream/10">
                        {o.items?.map((it: any) => (
                          <li key={it.id} className="flex items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{it.quantity}×</span>
                              <span className="text-sm text-cream/80">{it.product_name}</span>
                            </div>
                            <span className="text-sm text-cream/50">{formatPrice(it.unit_price_cents * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {orders.length > 3 && (
                  <Link to="/account" className="block pt-2 text-center text-sm font-bold text-primary hover:underline">
                    + {orders.length - 3} more orders → View all
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FIND US */}
      <section id="find-us" className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="font-script text-2xl text-primary">✦ Locations ✦</p>
          <h2 className="mt-1 font-display text-5xl text-accent">FIND US</h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-accent/75">
            With 150+ stores across India, there's always a Frost Bite scoop near you. Visit your nearest store or order online for home delivery.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"].map((city) => (
              <div key={city} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="font-display text-lg text-accent">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="bg-gradient-pink py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="font-script text-2xl text-primary">✦ Latest ✦</p>
          <h2 className="mt-1 font-display text-5xl text-accent">FROM OUR BLOG</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[
              { title: "The Secret to the Perfect Scoop", date: "June 1, 2025", desc: "How we craft every flavor from scratch using only real ingredients." },
              { title: "New Flavor Drop: Mango Chill", date: "May 20, 2025", desc: "Our summer special is here — smooth, tangy, and absolutely refreshing." },
              { title: "Behind the Scenes at Frost Bite", date: "May 10, 2025", desc: "A look into our kitchen and the people who make every scoop special." },
            ].map(({ title, date, desc }) => (
              <div key={title} className="rounded-3xl bg-card p-6 shadow-soft">
                <p className="text-xs uppercase tracking-widest text-primary">{date}</p>
                <h3 className="mt-2 font-display text-xl text-accent">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <button className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:underline">Read More →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-cream py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 text-center">
          <p className="font-script text-2xl text-primary">✦ Get in Touch ✦</p>
          <h2 className="mt-1 font-display text-5xl text-accent">CONTACT US</h2>
          <p className="mt-6 text-base leading-relaxed text-accent/75">Have a question, feedback, or just want to talk ice cream? We'd love to hear from you.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <input placeholder="Your Name" className="rounded-2xl border border-input bg-background px-5 py-4 text-sm outline-none focus:border-primary" />
            <input placeholder="Your Email" className="rounded-2xl border border-input bg-background px-5 py-4 text-sm outline-none focus:border-primary" />
          </div>
          <textarea placeholder="Your Message" rows={4} className="mt-4 w-full rounded-2xl border border-input bg-background px-5 py-4 text-sm outline-none focus:border-primary" />
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink transition-transform hover:scale-[1.03]">
            Send Message <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section id="experience" className="relative overflow-hidden bg-gradient-navy py-20 text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-10">
          <div>
            <p className="font-script text-2xl text-primary">The Ultimate</p>
            <h2 className="mt-1 font-display text-5xl leading-none text-cream md:text-6xl">
              ICE CREAM<br/>EXPERIENCE
            </h2>
            <p className="mt-4 max-w-sm text-sm text-cream/70">
              Moments made sweeter with Frost Bite.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-pink"
            >
              EXPERIENCE MORE <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: IceCream, value: "50+", label: "Delicious Flavors" },
              { icon: Leaf, value: "100%", label: "Veg Ingredients" },
              { icon: Smile, value: "50K+", label: "Happy Customers" },
              { icon: MapPin, value: "150+", label: "Stores Across India" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream/10">
                  <Icon className="h-6 w-6 text-cream" />
                </span>
                <div className="mt-3 font-display text-3xl text-cream">{value}</div>
                <div className="text-xs uppercase tracking-widest text-cream/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <Sparkles className="pointer-events-none absolute right-10 top-10 h-6 w-6 text-primary/40" />
      </section>
    </>
  );
}
