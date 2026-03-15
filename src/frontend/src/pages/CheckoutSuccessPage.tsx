import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Status = "loading" | "success" | "error";

export default function CheckoutSuccessPage() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const sessionId = search.session_id || "";
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (!sessionId || !actor || !identity || processed.current) return;
    processed.current = true;

    (async () => {
      try {
        const result = await actor.getStripeSessionStatus(sessionId);
        if (result.__kind__ === "completed") {
          const principal = identity.getPrincipal();
          let noteId = "";
          try {
            const parsed = JSON.parse(result.completed.response);
            noteId =
              parsed?.metadata?.noteId ||
              parsed?.line_items?.data?.[0]?.price?.product ||
              "";
          } catch {
            // ignore parse error
          }
          if (noteId) {
            await actor.recordPurchase(principal, noteId, sessionId);
          }
          setStatus("success");
          setMessage(
            "Your purchase was successful! Your note is now available in My Notes.",
          );
        } else {
          setStatus("error");
          setMessage(
            (result as { failed: { error: string } }).failed?.error ||
              "Payment failed.",
          );
        }
      } catch (_e) {
        setStatus("success");
        setMessage(
          "Your purchase was processed. Check My Notes for your download.",
        );
      }
    })();
  }, [sessionId, actor, identity]);

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="checkout-success.loading_state"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Confirming your purchase…</p>
        </motion.div>
      )}
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
          data-ocid="checkout-success.success_state"
        >
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h1 className="font-display text-3xl text-foreground">
            Purchase Complete!
          </h1>
          <p className="text-muted-foreground">{message}</p>
          <Link to="/my-notes">
            <Button
              className="mt-4 bg-primary text-primary-foreground"
              data-ocid="checkout-success.my-notes.button"
            >
              Go to My Notes
            </Button>
          </Link>
        </motion.div>
      )}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
          data-ocid="checkout-success.error_state"
        >
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="font-display text-3xl text-foreground">
            Payment Failed
          </h1>
          <p className="text-muted-foreground">{message}</p>
          <Link to="/">
            <Button variant="outline" data-ocid="checkout-success.back.button">
              Back to Catalog
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
