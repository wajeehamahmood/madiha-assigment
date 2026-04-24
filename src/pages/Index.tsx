import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Gem, PackageCheck, Plus, RefreshCcw, Search, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import heroImage from "@/assets/jewelry-hero.jpg";
import rubyRing from "@/assets/jewelry-products/ruby-ring.jpg";
import emeraldNecklace from "@/assets/jewelry-products/emerald-necklace.jpg";
import goldBracelet from "@/assets/jewelry-products/gold-bracelet.jpg";
import pearlEarrings from "@/assets/jewelry-products/pearl-earrings.jpg";
import sapphireSet from "@/assets/jewelry-products/sapphire-set.jpg";
import roseGoldChain from "@/assets/jewelry-products/rose-gold-chain.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Flower = Tables<"flowers">;
type Order = Tables<"shop_orders">;

const emptyFlower = { name: "", category: "", price: "", stock: "", description: "", featured: false };
const jewelryImages = [rubyRing, emeraldNecklace, goldBracelet, pearlEarrings, sapphireSet, roseGoldChain];
const getJewelryImage = (flower: Flower) => jewelryImages[Math.abs([...flower.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % jewelryImages.length];

const Index = () => {
  const { toast } = useToast();
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [flowerForm, setFlowerForm] = useState(emptyFlower);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({ customer_name: "", email: "", flower_id: "", quantity: "1", message: "" });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [{ data: flowerData, error: flowerError }, { data: orderData, error: orderError }] = await Promise.all([
      supabase.from("flowers").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(8),
    ]);
    if (flowerError || orderError) toast({ title: "Could not load shop data", description: flowerError?.message || orderError?.message, variant: "destructive" });
    setFlowers(flowerData || []);
    setOrders(orderData || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredFlowers = useMemo(() => flowers.filter((flower) =>
    [flower.name, flower.category, flower.description].join(" ").toLowerCase().includes(query.toLowerCase())
  ), [flowers, query]);

  const featured = flowers.filter((flower) => flower.featured).slice(0, 3);
  const selectedOrderFlower = flowers.find((flower) => flower.id === orderForm.flower_id) || flowers[0];

  const submitFlower = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: flowerForm.name.trim(),
      category: flowerForm.category.trim(),
      price: Number(flowerForm.price),
      stock: Number(flowerForm.stock),
      description: flowerForm.description.trim(),
      featured: flowerForm.featured,
    };
    const request = editingId ? supabase.from("flowers").update(payload).eq("id", editingId) : supabase.from("flowers").insert(payload);
    const { error } = await request;
    if (error) return toast({ title: "Jewelry not saved", description: error.message, variant: "destructive" });
    toast({ title: editingId ? "Jewelry updated" : "Jewelry added", description: "Inventory is synced with the database." });
    setFlowerForm(emptyFlower);
    setEditingId(null);
    loadData();
  };

  const editFlower = (flower: Flower) => {
    setEditingId(flower.id);
    setFlowerForm({ name: flower.name, category: flower.category, price: String(flower.price), stock: String(flower.stock), description: flower.description, featured: flower.featured });
    document.getElementById("manage")?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteFlower = async (id: string) => {
    const { error } = await supabase.from("flowers").delete().eq("id", id);
    if (error) return toast({ title: "Jewelry not deleted", description: error.message, variant: "destructive" });
    toast({ title: "Jewelry deleted", description: "The catalog was updated." });
    loadData();
  };

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    const flower = selectedOrderFlower;
    if (!flower) return toast({ title: "Choose a jewelry piece first", variant: "destructive" });
    const { error } = await supabase.from("shop_orders").insert({
      customer_name: orderForm.customer_name.trim(),
      email: orderForm.email.trim(),
      flower_id: flower.id,
      flower_name: flower.name,
      quantity: Number(orderForm.quantity),
      message: orderForm.message.trim() || null,
    });
    if (error) return toast({ title: "Order not submitted", description: error.message, variant: "destructive" });
    toast({ title: "Order received", description: "Backend processing saved your order." });
    setOrderForm({ customer_name: "", email: "", flower_id: "", quantity: "1", message: "" });
    loadData();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-bloom">
      <nav className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#home" className="flex items-center gap-2 font-display text-2xl font-bold text-leaf"><Gem className="text-primary" /> Luxe & Loom</a>
          <div className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground md:flex">
            <a className="hover:text-primary" href="#catalog">Catalog</a><a className="hover:text-primary" href="#manage">CRUD</a><a className="hover:text-primary" href="#orders">Orders</a><a className="hover:text-primary" href="#about">About</a>
          </div>
        </div>
      </nav>

      <section id="home" className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="absolute inset-x-0 top-8 -z-10 h-72 rounded-full bg-rose-soft blur-3xl bloom-shift" />
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"><Sparkles size={16} /> Fine jewelry, managed live</p>
          <h1 className="font-display text-5xl font-bold leading-tight text-foreground md:text-7xl">Luxe & Loom Jewelry Shop</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">A complete responsive CRUD website for a jewelry shop: add, view, update, delete inventory, process orders, and retrieve records from a live database.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button variant="bloom" asChild><a href="#manage"><Plus /> Manage jewelry</a></Button><Button variant="leaf" asChild><a href="#orders"><ShoppingBag /> Place order</a></Button></div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-center"><Stat value={flowers.length} label="Pieces" /><Stat value={orders.length} label="Recent orders" /><Stat value="4" label="Pages" /></div>
        </div>
        <div className="relative animate-fade-up lg:justify-self-end">
          <img src={heroImage} width={1200} height={800} alt="Elegant jewelry display with rings necklaces and bracelets" className="aspect-[4/3] w-full rounded-lg object-cover shadow-bloom" />
          <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 p-4 shadow-soft backdrop-blur"><p className="text-sm font-semibold text-muted-foreground">Today’s focus</p><p className="text-2xl font-bold text-primary">{featured[0]?.name || "Signature Jewelry"}</p></div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-5 py-16">
        <SectionTitle icon={<Search />} title="Catalog page" subtitle="View stored jewelry records and search live inventory." />
        <div className="mb-6 max-w-md"><Input aria-label="Search jewelry" placeholder="Search rings, necklaces, bracelets..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        {loading ? <div className="grid gap-5 md:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />)}</div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredFlowers.map((flower) => <FlowerCard key={flower.id} flower={flower} onEdit={editFlower} onDelete={deleteFlower} />)}</div>}
      </section>

      <section id="manage" className="bg-secondary/55 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div><SectionTitle icon={<PackageCheck />} title="CRUD management page" subtitle="Create and update jewelry with backend validation and database persistence." />
            <form onSubmit={submitFlower} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-soft">
              <Input required placeholder="Jewelry name" value={flowerForm.name} onChange={(e) => setFlowerForm({ ...flowerForm, name: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-3"><Input required placeholder="Category" value={flowerForm.category} onChange={(e) => setFlowerForm({ ...flowerForm, category: e.target.value })} /><Input required min="0" step="0.01" type="number" placeholder="Price" value={flowerForm.price} onChange={(e) => setFlowerForm({ ...flowerForm, price: e.target.value })} /><Input required min="0" type="number" placeholder="Stock" value={flowerForm.stock} onChange={(e) => setFlowerForm({ ...flowerForm, stock: e.target.value })} /></div>
              <Textarea required placeholder="Description" value={flowerForm.description} onChange={(e) => setFlowerForm({ ...flowerForm, description: e.target.value })} />
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={flowerForm.featured} onChange={(e) => setFlowerForm({ ...flowerForm, featured: e.target.checked })} /> Featured piece</label>
              <div className="flex gap-3"><Button variant="bloom" type="submit">{editingId ? <Edit3 /> : <Plus />}{editingId ? "Update jewelry" : "Add jewelry"}</Button>{editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFlowerForm(emptyFlower); }}>Cancel</Button>}</div>
            </form>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-soft"><h3 className="mb-4 text-xl font-bold">Stored records</h3><div className="space-y-3">{flowers.map((flower) => <div key={flower.id} className="flex flex-col justify-between gap-3 rounded-md bg-muted/60 p-4 sm:flex-row sm:items-center"><div><p className="font-bold">{flower.name}</p><p className="text-sm text-muted-foreground">{flower.category} · ${flower.price} · {flower.stock} in stock</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editFlower(flower)}><Edit3 /> Edit</Button><Button size="sm" variant="destructive" onClick={() => deleteFlower(flower.id)}><Trash2 /> Delete</Button></div></div>)}</div></div>
        </div>
      </section>

      <section id="orders" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2">
        <div><SectionTitle icon={<ShoppingBag />} title="Order form page" subtitle="Submit a customer request and store it through backend processing." />
          <form onSubmit={submitOrder} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-soft">
            <Input required placeholder="Customer name" value={orderForm.customer_name} onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })} />
            <Input required type="email" placeholder="Email address" value={orderForm.email} onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })} />
            <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={orderForm.flower_id || flowers[0]?.id || ""} onChange={(e) => setOrderForm({ ...orderForm, flower_id: e.target.value })}>{flowers.map((flower) => <option key={flower.id} value={flower.id}>{flower.name}</option>)}</select>
            <Input required min="1" max="100" type="number" placeholder="Quantity" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} />
            <Textarea placeholder="Gift message" value={orderForm.message} onChange={(e) => setOrderForm({ ...orderForm, message: e.target.value })} />
            <Button variant="leaf" type="submit"><ShoppingBag /> Submit order</Button>
          </form>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft"><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold">Recent retrieved orders</h3><Button size="sm" variant="outline" onClick={loadData}><RefreshCcw /> Refresh</Button></div><div className="space-y-3">{orders.map((order) => <div key={order.id} className="rounded-md bg-muted/60 p-4"><p className="font-bold">{order.customer_name} ordered {order.quantity} × {order.flower_name}</p><p className="text-sm text-muted-foreground">{order.email} · {order.status}</p>{order.message && <p className="mt-2 text-sm">“{order.message}”</p>}</div>)}</div></div>
      </section>

      <section id="about" className="border-t border-border bg-leaf py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3"><div className="md:col-span-2"><h2 className="font-display text-4xl font-bold">About page</h2><p className="mt-3 max-w-3xl text-primary-foreground/85">Luxe & Loom demonstrates a functional deployed website with a home page, catalog page, CRUD management page, order form page, responsive design, live data storage, request handling, and publish-ready hosting.</p></div><div className="rounded-lg bg-background/10 p-5"><p className="font-bold">Assignment checklist</p><p className="mt-2 text-sm text-primary-foreground/85">CRUD, forms, backend processing, database retrieval, and responsive React pages are included.</p></div></div>
      </section>
    </main>
  );
};

const Stat = ({ value, label }: { value: string | number; label: string }) => <div className="rounded-lg border border-border bg-card/75 p-4 shadow-soft"><p className="text-2xl font-bold text-primary">{value}</p><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p></div>;

const SectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => <div className="mb-7"><div className="mb-2 flex items-center gap-2 text-primary">{icon}<span className="text-sm font-bold uppercase">Jewelry shop</span></div><h2 className="font-display text-4xl font-bold text-foreground">{title}</h2><p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p></div>;

const FlowerCard = ({ flower, onEdit, onDelete }: { flower: Flower; onEdit: (flower: Flower) => void; onDelete: (id: string) => void }) => <Card className="group overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-bloom"><CardContent className="p-0"><div className="relative aspect-[16/10] overflow-hidden bg-rose-soft"><img src={getJewelryImage(flower)} alt={`${flower.name} jewelry piece`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /><div className="absolute right-3 top-3 rounded-full bg-card/90 p-2 text-primary shadow-soft backdrop-blur"><Gem size={20} /></div></div><div className="p-5"><div className="mb-2 flex items-start justify-between gap-3"><div><h3 className="text-xl font-bold">{flower.name}</h3><p className="text-sm font-semibold text-primary">{flower.category}</p></div><p className="font-bold text-leaf">${flower.price}</p></div><p className="min-h-12 text-sm text-muted-foreground">{flower.description}</p><div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">Stock: {flower.stock}</span><div className="flex gap-2"><Button size="icon" variant="outline" aria-label={`Edit ${flower.name}`} onClick={() => onEdit(flower)}><Edit3 /></Button><Button size="icon" variant="destructive" aria-label={`Delete ${flower.name}`} onClick={() => onDelete(flower.id)}><Trash2 /></Button></div></div></div></CardContent></Card>;

export default Index;