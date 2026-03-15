import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent list declarations
  let persistentPurchases = List.empty<Purchase>();
  let persistentOwnedNotes = List.empty<Note>();
  let persistentUserNoteIds = List.empty<Text>();

  // Types
  public type Note = {
    id : Text;
    title : Text;
    description : Text;
    priceCents : Nat;
    file : Storage.ExternalBlob;
  };

  public type Purchase = {
    noteId : Text;
    buyer : Principal;
    timestamp : Int;
    stripeSessionId : Text;
  };

  // Storage
  let notes = Map.empty<Text, Note>();
  let purchases = List.empty<Purchase>();
  let sessionOwners = Map.empty<Text, Principal>(); // Track who created each session

  // Notes Management (Admin-only)
  public shared ({ caller }) func addNote(note : Note) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add notes");
    };
    validateNoteId(note.id);
    notes.add(note.id, note);
  };

  public shared ({ caller }) func updateNote(note : Note) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update notes");
    };
    validateNoteId(note.id);
    notes.add(note.id, note);
  };

  public shared ({ caller }) func deleteNote(noteId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete notes");
    };
    notes.remove(noteId);
  };

  func validateNoteId(noteId : Text) {
    if (Text.equal(noteId, "")) {
      Runtime.trap("Note ID cannot be empty");
    };
    if (noteId.size() > 50) {
      Runtime.trap("Note ID cannot exceed 50 characters");
    };
  };

  // Browsing Notes (Anyone)
  public query ({ caller }) func getAllNotesByPriceAscending() : async [Note] {
    notes.values().toArray().sort(compareNotesByPrice);
  };

  func compareNotesByPrice(note1 : Note, note2 : Note) : { #less; #equal; #greater } {
    if (note1.priceCents < note2.priceCents) { #less } else if (note1.priceCents > note2.priceCents) {
      #greater;
    } else { #equal };
  };

  // Purchasing (Stripe Integration)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe not configured") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
    // Track session ownership for authorization
    sessionOwners.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Only allow the session creator or admins to check status
    let isOwner = switch (sessionOwners.get(sessionId)) {
      case (null) { false };
      case (?owner) { owner == caller };
    };
    if (not (isOwner or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only check status of your own sessions");
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // Purchase Recording (Admin triggers after Stripe confirmation)
  public shared ({ caller }) func recordPurchase(buyer : Principal, noteId : Text, stripeSessionId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record purchases");
    };
    purchases.add({
      noteId;
      buyer;
      timestamp = Time.now();
      stripeSessionId;
    });
  };

  // Downloaded Notes (Users only)
  public query ({ caller }) func getOwnedNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let ownedNoteIds = getPurchasedNoteIdsByUser(caller);
    let ownedNotes = List.empty<Note>();
    for (noteId in ownedNoteIds.values()) {
      switch (notes.get(noteId)) {
        case (null) {};
        case (?note) { ownedNotes.add(note) };
      };
    };
    ownedNotes.toArray();
  };

  func getPurchasedNoteIdsByUser(user : Principal) : List.List<Text> {
    let noteIds = List.empty<Text>();
    for (purchase in purchases.values()) {
      if (purchase.buyer == user and not noteIds.contains(purchase.noteId)) {
        noteIds.add(purchase.noteId);
      };
    };
    noteIds;
  };

  // Blob Storage Support (MixinStorage provides necessary functions)

  // HTTP Transform for Stripe (required by Stripe component)
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
