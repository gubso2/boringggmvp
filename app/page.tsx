import { Hero } from "@/components/landing/Hero";
import { ProductGrid } from "@/components/landing/ProductGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { About } from "@/components/landing/About";
import { Footer } from "@/components/landing/Footer";
import { StickyNav } from "@/components/nav/StickyNav";
import { ModalManager } from "@/components/ModalManager";
import { AppProvider } from "@/components/AppProvider";
import { CartBar } from "@/components/cart/CartBar";
import { SideCart } from "@/components/cart/SideCart";
import {
  getProductsWithBatches,
  getInviteCount,
} from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, supabase] = await Promise.all([
    getProductsWithBatches(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const inviteCount = user ? await getInviteCount() : 0;

  return (
    <AppProvider initialUser={user} initialInviteCount={inviteCount}>
      <StickyNav />
      <main>
        <Hero />
        <ProductGrid products={products} />
        <HowItWorks />
        <About />
      </main>
      <Footer />
      <CartBar />
      <SideCart />
      <ModalManager />
    </AppProvider>
  );
}
