import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { BookOpen, Download, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwnedNotes } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c"];

export default function MyNotesPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: notes, isLoading } = useOwnedNotes();

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">
          Sign in to view your notes
        </h2>
        <p className="text-muted-foreground mb-6">
          Your purchased notes will appear here after signing in.
        </p>
        <Button
          onClick={() => login()}
          className="gap-2"
          data-ocid="my-notes.login.button"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground">My Notes</h1>
        <p className="text-muted-foreground mt-1">
          Your purchased study materials
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4" data-ocid="my-notes.loading_state">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="bg-card rounded-xl border border-border p-5 flex items-center gap-4"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && notes?.length === 0 && (
        <div
          className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border"
          data-ocid="my-notes.empty_state"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No purchased notes yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Browse the catalog to find notes for your studies
          </p>
          <Link to="/">
            <Button variant="outline" data-ocid="my-notes.browse.button">
              Browse Notes
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && notes && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              data-ocid={`my-notes.item.${i + 1}`}
              className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 shadow-card"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-foreground">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {note.description}
                </p>
                <Badge className="mt-2 text-xs bg-secondary text-secondary-foreground">
                  Owned
                </Badge>
              </div>
              <Button
                size="sm"
                className="gap-1.5 shrink-0 bg-primary text-primary-foreground"
                onClick={() => window.open(note.file.getDirectURL(), "_blank")}
                data-ocid={`my-notes.download.button.${i + 1}`}
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
