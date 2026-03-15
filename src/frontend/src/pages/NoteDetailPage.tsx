import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Loader2, Lock, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllNotes,
  useCreateCheckout,
  useIsStripeConfigured,
  useOwnedNotes,
} from "../hooks/useQueries";

export default function NoteDetailPage() {
  const { id } = useParams({ from: "/notes/$id" });
  const { data: notes, isLoading } = useAllNotes();
  const { data: ownedNotes } = useOwnedNotes();
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: stripeConfigured } = useIsStripeConfigured();
  const createCheckout = useCreateCheckout();

  const note = notes?.find((n) => n.id === id);
  const isOwned = ownedNotes?.some((n) => n.id === id);
  const price = note ? (Number(note.priceCents) / 100).toFixed(2) : "0.00";

  const handlePurchase = async () => {
    if (!note) return;
    if (!isLoggedIn) {
      login();
      return;
    }
    if (!stripeConfigured) {
      toast.error("Payment not configured yet. Please contact the admin.");
      return;
    }
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout/cancel`;
      const url = await createCheckout.mutateAsync({
        items: [
          {
            productName: note.title,
            currency: "usd",
            quantity: BigInt(1),
            priceInCents: note.priceCents,
            productDescription: note.description,
          },
        ],
        successUrl,
        cancelUrl,
      });
      window.location.href = url;
    } catch (_e) {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!note) return;
    const url = note.file.getDirectURL();
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12 max-w-3xl"
        data-ocid="note-detail.loading_state"
      >
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-5 w-24 mb-8" />
        <Skeleton className="h-40 w-full mb-8" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!note) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="note-detail.error_state"
      >
        <p className="text-muted-foreground text-lg">Note not found.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        data-ocid="note-detail.back.link"
      >
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden">
          <div className="h-2 bg-primary" />
          <div className="p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
              <div className="flex-1 min-w-0">
                <Badge className="mb-3 text-xs bg-secondary text-secondary-foreground">
                  Study Notes
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl text-foreground">
                  {note.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="font-display text-4xl text-primary">${price}</p>
                <p className="text-xs text-muted-foreground">USD</p>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground mb-8 leading-relaxed">
              <p>{note.description}</p>
            </div>

            <div className="border-t border-border pt-6">
              {isOwned ? (
                <div className="space-y-3">
                  <p className="text-sm text-primary font-medium flex items-center gap-2">
                    ✓ You own this note
                  </p>
                  <Button
                    onClick={handleDownload}
                    className="gap-2 bg-primary text-primary-foreground"
                    data-ocid="note-detail.download.button"
                  >
                    <Download className="w-4 h-4" /> Download Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!isLoggedIn && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Sign in to purchase
                    </p>
                  )}
                  <Button
                    onClick={handlePurchase}
                    disabled={createCheckout.isPending}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="note-detail.buy.button"
                  >
                    {createCheckout.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />{" "}
                        {isLoggedIn
                          ? `Purchase for $${price}`
                          : "Sign In to Purchase"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
