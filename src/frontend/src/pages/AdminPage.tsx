import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Pencil,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Note } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddNote,
  useAllNotes,
  useClaimFirstAdmin,
  useDeleteNote,
  useIsAdmin,
  useIsAdminAssigned,
  useIsStripeConfigured,
  useSetStripeConfig,
  useUpdateNote,
} from "../hooks/useQueries";

function generateId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function NoteForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
}: {
  initial?: Note;
  onSubmit: (note: Note, file?: File) => void;
  isPending: boolean;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(
    initial ? (Number(initial.priceCents) / 100).toFixed(2) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!initial && !file) {
      toast.error("Please select a file");
      return;
    }
    const note: Note = {
      id: initial?.id || generateId(),
      title,
      description,
      priceCents: BigInt(Math.round(Number.parseFloat(price) * 100)),
      file: initial?.file || ExternalBlob.fromBytes(new Uint8Array()),
    };
    onSubmit(note, file || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Advanced Calculus — Integration Techniques"
          data-ocid="admin.note.title.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Comprehensive coverage of integration by parts, substitution, and partial fractions…"
          data-ocid="admin.note.description.textarea"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="9.99"
          data-ocid="admin.note.price.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="file">
          {initial ? "Replace File (optional)" : "Note File (PDF/doc)"}
        </Label>
        <input
          id="file"
          type="file"
          ref={fileRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          data-ocid="admin.note.upload_button"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-primary text-primary-foreground"
          data-ocid="admin.note.submit_button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />{" "}
              {initial ? "Save Changes" : "Add Note"}
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="gap-2"
            data-ocid="admin.note.cancel_button"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default function AdminPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: isAdminAssigned, isLoading: assignedLoading } =
    useIsAdminAssigned();
  const { data: notes, isLoading: notesLoading } = useAllNotes();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const addNote = useAddNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const setStripeConfig = useSetStripeConfig();
  const claimAdmin = useClaimFirstAdmin();

  const [editNote, setEditNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [stripeKey, setStripeKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState(
    "US,GB,CA,AU,IN,PK,NG,DE,FR,BR",
  );

  const isLoading = adminLoading || assignedLoading;

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10 max-w-4xl"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not logged in
  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">
          Sign In Required
        </h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the admin dashboard.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="gap-2"
          data-ocid="admin.signin.button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    // No admin assigned yet — allow claiming
    if (isAdminAssigned === false) {
      const handleClaim = async () => {
        try {
          const success = await claimAdmin.mutateAsync();
          if (success) {
            toast.success("You are now the admin! Welcome to the dashboard.");
          } else {
            toast.error(
              "Could not claim admin. Someone else may have just claimed it.",
            );
          }
        } catch (_e) {
          toast.error("Failed to claim admin access.");
        }
      };

      return (
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <ShieldCheck className="w-14 h-14 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl text-foreground mb-3">
              Claim Admin Access
            </h2>
            <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
              This website doesn&apos;t have an admin yet. Since you&apos;re the
              first one here, you can claim full admin access right now — no
              code or password needed.
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              Click below to become the admin and start managing your notes
              marketplace.
            </p>
            <Button
              onClick={handleClaim}
              disabled={claimAdmin.isPending}
              size="lg"
              className="w-full gap-2"
              data-ocid="admin.claim.button"
            >
              {claimAdmin.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Claiming…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Become Admin
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    // Admin already assigned — access denied
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          This site already has an admin. Only the assigned admin can access
          this area.
        </p>
      </div>
    );
  }

  const handleAdd = async (note: Note, file?: File) => {
    try {
      let finalNote = note;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        finalNote = { ...note, file: ExternalBlob.fromBytes(bytes) };
      }
      await addNote.mutateAsync(finalNote);
      toast.success("Note added successfully");
    } catch (_e) {
      toast.error("Failed to add note");
    }
  };

  const handleUpdate = async (note: Note, file?: File) => {
    try {
      let finalNote = note;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        finalNote = { ...note, file: ExternalBlob.fromBytes(bytes) };
      }
      await updateNote.mutateAsync(finalNote);
      toast.success("Note updated");
      setEditNote(null);
    } catch (_e) {
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success("Note deleted");
      setDeleteTarget(null);
    } catch (_e) {
      toast.error("Failed to delete note");
    }
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeKey) {
      toast.error("Stripe secret key is required");
      return;
    }
    try {
      const countries = allowedCountries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey,
        allowedCountries: countries,
      });
      toast.success("Stripe configuration saved");
      setStripeKey("");
    } catch (_e) {
      toast.error("Failed to save Stripe config");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your notes marketplace
        </p>
      </div>

      <Tabs defaultValue="notes" data-ocid="admin.tabs">
        <TabsList className="mb-6">
          <TabsTrigger value="notes" data-ocid="admin.notes.tab">
            Manage Notes
          </TabsTrigger>
          <TabsTrigger value="add" data-ocid="admin.add.tab">
            Add Note
          </TabsTrigger>
          <TabsTrigger value="settings" data-ocid="admin.settings.tab">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Manage Notes Tab */}
        <TabsContent value="notes">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {notesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : notes?.length === 0 ? (
              <div
                className="p-12 text-center"
                data-ocid="admin.notes.empty_state"
              >
                <p className="text-muted-foreground">
                  No notes yet. Add your first note.
                </p>
              </div>
            ) : (
              <Table data-ocid="admin.notes.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notes?.map((note, i) => (
                    <TableRow
                      key={note.id}
                      data-ocid={`admin.notes.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {note.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                        {note.description}
                      </TableCell>
                      <TableCell>
                        ${(Number(note.priceCents) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditNote(note)}
                            className="gap-1"
                            data-ocid={`admin.notes.edit_button.${i + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(note.id)}
                            className="gap-1"
                            data-ocid={`admin.notes.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Add Note Tab */}
        <TabsContent value="add">
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-6">
              Add New Note
            </h2>
            <NoteForm onSubmit={handleAdd} isPending={addNote.isPending} />
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 max-w-lg">
            <h2 className="font-display text-2xl text-foreground mb-2">
              Stripe Configuration
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {stripeConfigured
                ? "✓ Stripe is configured."
                : "⚠ Stripe is not yet configured. Add your keys to enable payments."}
            </p>
            <form onSubmit={handleStripeSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  placeholder="sk_live_…"
                  data-ocid="admin.stripe.key.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="countries">
                  Allowed Countries (comma-separated ISO codes)
                </Label>
                <Input
                  id="countries"
                  value={allowedCountries}
                  onChange={(e) => setAllowedCountries(e.target.value)}
                  placeholder="US,GB,CA,AU,IN"
                  data-ocid="admin.stripe.countries.input"
                />
                <p className="text-xs text-muted-foreground">
                  e.g. US, GB, CA, AU, IN, PK, NG, DE, FR, BR
                </p>
              </div>
              <Button
                type="submit"
                disabled={setStripeConfig.isPending}
                className="gap-2 bg-primary text-primary-foreground"
                data-ocid="admin.stripe.submit_button"
              >
                {setStripeConfig.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Configuration
                  </>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editNote}
        onOpenChange={(open) => !open && setEditNote(null)}
        data-ocid="admin.edit.dialog"
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Edit Note
            </DialogTitle>
          </DialogHeader>
          {editNote && (
            <NoteForm
              initial={editNote}
              onSubmit={handleUpdate}
              isPending={updateNote.isPending}
              onCancel={() => setEditNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        data-ocid="admin.delete.dialog"
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Delete Note
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure? This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteNote.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="admin.delete.confirm_button"
            >
              {deleteNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
