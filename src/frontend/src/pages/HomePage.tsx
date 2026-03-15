import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Globe2,
  Search,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Note } from "../backend";
import { useAllNotes } from "../hooks/useQueries";

const SUBJECT_COLORS: Record<string, string> = {
  mathematics: "bg-blue-100 text-blue-800",
  physics: "bg-indigo-100 text-indigo-800",
  chemistry: "bg-purple-100 text-purple-800",
  biology: "bg-green-100 text-green-800",
  history: "bg-amber-100 text-amber-800",
  economics: "bg-emerald-100 text-emerald-800",
  literature: "bg-rose-100 text-rose-800",
  engineering: "bg-orange-100 text-orange-800",
  default: "bg-secondary text-secondary-foreground",
};

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function guessSubject(title: string): string {
  const lower = title.toLowerCase();
  const match = Object.keys(SUBJECT_COLORS).find((s) => lower.includes(s));
  return match || "default";
}

function NoteCard({ note, index }: { note: Note; index: number }) {
  const subject = guessSubject(note.title);
  const colorClass = SUBJECT_COLORS[subject];
  const price = (Number(note.priceCents) / 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      data-ocid={`notes.item.${index + 1}`}
    >
      <Link to="/notes/$id" params={{ id: note.id }} className="block">
        <div className="bg-card rounded-xl shadow-card hover:shadow-elevated transition-shadow duration-300 overflow-hidden border border-border group">
          <div className="h-2 bg-primary opacity-80" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <Badge
                className={`text-xs font-medium capitalize shrink-0 ${colorClass}`}
              >
                {subject === "default" ? "Study Notes" : subject}
              </Badge>
              <span className="font-display text-2xl font-medium text-primary whitespace-nowrap">
                ${price}
              </span>
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {note.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {note.description}
            </p>
          </div>
          <div className="px-5 pb-5">
            <Button
              size="sm"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid={`notes.buy.button.${index + 1}`}
            >
              View &amp; Purchase <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
      <div className="h-2 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: notes, isLoading, isError } = useAllNotes();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = search.toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q),
    );
  }, [notes, search]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 grain-overlay">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
                <Globe2 className="w-4 h-4" />
                Available Worldwide
              </div>
              <h1 className="font-display text-5xl md:text-6xl leading-tight text-foreground">
                Study Smarter with{" "}
                <span className="text-primary italic">Expert Notes</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Premium, handcrafted study notes for national and international
                students. Clear, concise, and exam-ready.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-accent" />
                  Expert-curated content
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Exam-focused
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden md:block"
            >
              <img
                src="/assets/generated/hero-notes-marketplace.dim_1200x600.jpg"
                alt="Study notes"
                className="rounded-2xl shadow-elevated w-full object-cover max-h-72"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl text-foreground">
              Browse Notes
            </h2>
            <p className="text-muted-foreground mt-1">
              {notes?.length ?? 0} notes available, sorted by price
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="catalog.search_input"
            />
          </div>
        </div>

        {isError && (
          <div className="text-center py-16" data-ocid="catalog.error_state">
            <p className="text-muted-foreground">
              Failed to load notes. Please try again.
            </p>
          </div>
        )}

        {isLoading && (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="catalog.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <NoteCardSkeleton key={key} />
            ))}
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div
            className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border"
            data-ocid="catalog.empty_state"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No notes found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try a different search term"
                : "Notes will appear here once added"}
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((note, i) => (
              <NoteCard key={note.id} note={note} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
