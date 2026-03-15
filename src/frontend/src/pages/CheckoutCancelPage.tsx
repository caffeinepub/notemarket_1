import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="font-display text-3xl text-foreground">
          Purchase Cancelled
        </h1>
        <p className="text-muted-foreground">
          Your payment was cancelled. You have not been charged.
        </p>
        <Link to="/">
          <Button
            className="mt-4 gap-2 bg-primary text-primary-foreground"
            data-ocid="checkout-cancel.back.button"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
