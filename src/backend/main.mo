import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  include MixinStorage();

  type User = {
    name : Text;
    phone : Text;
    registeredAt : Time.Time;
    sessionToken : Text;
  };

  type AppSettings = {
    reciterUrl : Text;
    surahEnabled : Map.Map<Nat, Bool>;
  };

  type Dua = {
    id : Nat;
    title : Text;
    text : Text;
    arabicText : Text;
  };

  let users = Map.empty<Text, User>();
  let duas = Map.empty<Nat, Dua>();
  var visitorCount : Nat = 0;
  var appSettings : AppSettings = {
    reciterUrl = "";
    surahEnabled = Map.empty<Nat, Bool>();
  };
  var nextDuaId : Nat = 1;

  // User Registration
  public shared ({ caller }) func registerUser(name : Text, phone : Text) : async Text {
    // Check if phone already exists
    for ((_, user) in users.entries()) {
      if (user.phone == phone) {
        Runtime.trap("Phone number already registered");
      };
    };

    let sessionToken = phone; // For simplicity, use phone as session token

    let newUser : User = {
      name;
      phone;
      registeredAt = Time.now();
      sessionToken;
    };
    users.add(sessionToken, newUser);
    sessionToken;
  };

  // User Login
  public query ({ caller }) func loginUser(phone : Text) : async Text {
    for ((token, user) in users.entries()) {
      if (user.phone == phone) {
        return token;
      };
    };
    Runtime.trap("User not found");
  };

  // Get Current User
  public query ({ caller }) func getCurrentUser(sessionToken : Text) : async User {
    switch (users.get(sessionToken)) {
      case (null) { Runtime.trap("Invalid session token") };
      case (?user) { user };
    };
  };

  // Increment Visitor Count
  public shared ({ caller }) func incrementVisitorCount() : async () {
    visitorCount += 1;
  };

  // Get Visitor Count
  public query ({ caller }) func getVisitorCount() : async Nat {
    visitorCount;
  };

  // Admin Login (hardcoded)
  public query ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username == "admin" and password == "admin123") {
      return "adminSessionToken";
    };
    Runtime.trap("Invalid credentials");
  };

  // Get All Users (admin only)
  public query ({ caller }) func getAllUsers(adminToken : Text) : async [User] {
    if (adminToken != "adminSessionToken") {
      Runtime.trap("Unauthorized");
    };
    users.values().toArray();
  };

  // Set Reciter URL (admin only)
  public shared ({ caller }) func setReciterUrl(adminToken : Text, url : Text) : async () {
    if (adminToken != "adminSessionToken") {
      Runtime.trap("Unauthorized");
    };
    appSettings := {
      reciterUrl = url;
      surahEnabled = appSettings.surahEnabled;
    };
  };

  // Enable/Disable Surah (admin only)
  public shared ({ caller }) func setSurahEnabled(adminToken : Text, surahNumber : Nat, enabled : Bool) : async () {
    if (adminToken != "adminSessionToken") {
      Runtime.trap("Unauthorized");
    };
    let updatedSurahEnabled = appSettings.surahEnabled.clone();
    updatedSurahEnabled.add(surahNumber, enabled);
    appSettings := {
      reciterUrl = appSettings.reciterUrl;
      surahEnabled = updatedSurahEnabled;
    };
  };

  // Get Reciter URL and Enabled Surahs
  public query ({ caller }) func getQuranSettings() : async (Text, [(Nat, Bool)]) {
    let surahArray = appSettings.surahEnabled.toArray();
    (appSettings.reciterUrl, surahArray);
  };

  // Add Dua (admin only)
  public shared ({ caller }) func addDua(adminToken : Text, title : Text, text : Text, arabicText : Text) : async Nat {
    if (adminToken != "adminSessionToken") {
      Runtime.trap("Unauthorized");
    };
    let dua : Dua = {
      id = nextDuaId;
      title;
      text;
      arabicText;
    };
    duas.add(nextDuaId, dua);
    nextDuaId += 1;
    dua.id;
  };

  // Get All Duas
  public query ({ caller }) func getAllDuas() : async [Dua] {
    duas.values().toArray();
  };

  // Delete Dua (admin only)
  public shared ({ caller }) func deleteDua(adminToken : Text, duaId : Nat) : async () {
    if (adminToken != "adminSessionToken") {
      Runtime.trap("Unauthorized");
    };
    if (not duas.containsKey(duaId)) {
      Runtime.trap("Dua not found");
    };
    duas.remove(duaId);
  };

  // Get Dua by ID
  public query ({ caller }) func getDuaById(duaId : Nat) : async Dua {
    switch (duas.get(duaId)) {
      case (null) { Runtime.trap("Dua not found") };
      case (?dua) { dua };
    };
  };
};
