import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { adminListProducts, adminUpsertProduct, adminDeleteProduct } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type Editable = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price_cents: number;
  image_url: string;
  featured: boolean;
  active: boolean;
  stock: number;
};

const empty: Editable = {
  name: "", slug: "", short_description: "", description: "", price_cents: 850,
  image_url: "/src/assets/flavor-vanilla.jpg", featured: false, active: true, stock: 100,
};

function AdminProducts() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProducts);
  const upsertFn = useServerFn(adminUpsertProduct);
  const delFn = useServerFn(adminDeleteProduct);

  const { data: products = [] } = useQuery({ queryKey: ["adminProducts"], queryFn: () => listFn() });
  const [edit, setEdit] = useState<Editable | null>(null);

  const save = useMutation({
    mutationFn: (p: Editable) => upsertFn({ data: p }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setEdit(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["adminProducts"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl">Products</h2>
        <button onClick={() => setEdit({ ...empty })} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> New flavor
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4">Price</th>
              <th className="p-4">Stock</th><th className="p-4">Active</th><th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-muted-foreground">{p.slug}</td>
                <td className="p-4">{formatPrice(p.price_cents)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">{p.active ? "Yes" : "No"}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEdit({ ...p, short_description: p.short_description ?? "", description: p.description ?? "", image_url: p.image_url ?? "" })} className="mr-2 inline-flex items-center gap-1 text-accent hover:underline">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => confirm(`Delete ${p.name}?`) && remove.mutate(p.id)} className="inline-flex items-center gap-1 text-destructive hover:underline">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setEdit(null)}>
          <div className="w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-3xl">{edit.id ? "Edit flavor" : "New flavor"}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Name"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={input} /></Field>
              <Field label="Slug"><input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} className={input} /></Field>
              <Field label="Price (cents)"><input type="number" value={edit.price_cents} onChange={(e) => setEdit({ ...edit, price_cents: +e.target.value })} className={input} /></Field>
              <Field label="Stock"><input type="number" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: +e.target.value })} className={input} /></Field>
              <Field label="Image URL"><input value={edit.image_url} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} className={input} /></Field>
              <Field label="Featured">
                <select value={String(edit.featured)} onChange={(e) => setEdit({ ...edit, featured: e.target.value === "true" })} className={input}>
                  <option value="false">No</option><option value="true">Yes</option>
                </select>
              </Field>
              <Field label="Short description" className="sm:col-span-2">
                <input value={edit.short_description} onChange={(e) => setEdit({ ...edit, short_description: e.target.value })} className={input} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea rows={4} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className={input} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEdit(null)} className="rounded-full border border-border px-5 py-2 text-sm">Cancel</button>
              <button onClick={() => save.mutate(edit)} disabled={save.isPending} className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground disabled:opacity-50">
                {save.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const input = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent";
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
