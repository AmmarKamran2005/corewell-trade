import { Suspense } from "react";
import CheckoutForm from "@/components/store/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-500 dark:text-slate-400">
          Loading checkout…
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
