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

export const getCart = createServerFn({ method: "GET" })
  .handler(async () => {
    const { userId } = await getAuthUser();
    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity, product:products(id, name, slug, price_cents, image_url, stock)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addToCart = createServerFn({ method: "POST" })
  .inputValidator((d: { productId: string; quantity?: number }) =>
    z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(20).default(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { userId } = await getAuthUser();
    const { data: existing } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", data.productId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: existing.quantity + data.quantity })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .insert({ user_id: userId, product_id: data.productId, quantity: data.quantity });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; quantity: number }) =>
    z.object({ id: z.string().uuid(), quantity: z.number().int().min(0).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { userId } = await getAuthUser();
    if (data.quantity === 0) {
      const { error } = await supabaseAdmin.from("cart_items").delete().eq("id", data.id).eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: data.quantity })
        .eq("id", data.id)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const clearCart = createServerFn({ method: "POST" })
  .handler(async () => {
    const { userId } = await getAuthUser();
    const { error } = await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
