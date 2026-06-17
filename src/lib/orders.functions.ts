import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequest } from "@tanstack/react-start/server";

async function getAuthUser() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("Unauthorized: not signed in");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized: invalid session");
  return { userId: data.user.id };
}

const ShippingSchema = z.object({
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(240),
  city: z.string().min(1).max(120),
  postal: z.string().min(1).max(20),
  country: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => ShippingSchema.parse(d))
  .handler(async ({ data }) => {
    const { userId } = await getAuthUser();

    const { data: cart, error: cartErr } = await supabaseAdmin
      .from("cart_items")
      .select("quantity, product:products(id, name, price_cents, stock)")
      .eq("user_id", userId);
    if (cartErr) throw new Error(cartErr.message);
    if (!cart || cart.length === 0) throw new Error("Your cart is empty.");

    const items = cart.map((row) => {
      const p = row.product as { id: string; name: string; price_cents: number; stock: number } | null;
      if (!p) throw new Error("A product in your cart is no longer available.");
      return { product_id: p.id, product_name: p.name, unit_price_cents: p.price_cents, quantity: row.quantity };
    });
    const total = items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        total_cents: total,
        shipping_name: data.name,
        shipping_address: data.address,
        shipping_city: data.city,
        shipping_postal: data.postal,
        shipping_country: data.country,
        notes: data.notes ?? null,
        status: "paid",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) throw new Error(itemsErr.message);

    await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);

    return { orderId: order.id };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const { userId } = await getAuthUser();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
