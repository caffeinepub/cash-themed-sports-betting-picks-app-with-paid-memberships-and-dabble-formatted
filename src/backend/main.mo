import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // --- Types ---
  public type SportsCategory = {
    #nba;
    #soccer;
    #mlb;
    #nhl;
    #ncaaf;
    #nfl;
    #ncaabb;
    #other : Text;
  };

  public type BettingMarket = {
    #pointSpreads;
    #moneyLine;
    #overUnder;
    #alternativeSpreads;
    #alternativeOvers;
    #sameGameParlays;
    #otherMarkets : Text;
  };

  public type SubscriptionPlan = {
    #monthly;
    #yearly;
  };

  public type PremiumSource = {
    #none;
    #stripe;
    #referral;
    #manual;
    #admin;
    #creator;
  };

  public type SubscriptionStatus = {
    plan : SubscriptionPlan;
    expiresAt : Time.Time;
    stripeSessionId : Text;
  };

  public type ReferralStatus = {
    code : Text;
    expiresAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    subscription : ?SubscriptionStatus;
    referral : ?ReferralStatus;
    hasManualPremium : Bool;
  };

  public type AdminPremiumDiagnosis = {
    user : ?UserProfile;
    premiumSource : PremiumSource;
  };

  module Prediction {
    public type Prediction = {
      id : Text;
      sport : SportsCategory;
      market : BettingMarket;
      marketValue : Text;
      juice : Text;
      winningProbability : Float;
      createdAt : Time.Time;
      matchDate : Time.Time;
    };

    public func compare(p1 : Prediction, p2 : Prediction) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  public type ReferralCodeStatus = {
    code : Text;
    validUntil : Time.Time;
  };

  public type LiveScore = {
    homeTeam : Text;
    awayTeam : Text;
    homeScore : Nat;
    awayScore : Nat;
    currentPeriod : Text;
    status : Text;
    lastUpdated : Time.Time;
  };

  public type GameId = Text;

  // Persistent State
  let predictionsById = Map.empty<Text, Prediction.Prediction>();
  let depthChartData = Map.empty<Text, Text>();
  let coachingStyles = Map.empty<Text, Text>();
  let injuryReports = Map.empty<Text, Text>();
  let newsFlags = Map.empty<Text, Text>();
  let upcomingMatches = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let referralCodes = Map.empty<Text, ReferralCodeStatus>();
  let liveScores = Map.empty<GameId, LiveScore>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let creatorPrincipal = "fjgwj-bolqk-glt6l-xwnqv-fqp2h-s3apm-4mrnu-ldzti-mctrg-uquqj-sqe";
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // --- Helper Functions ---
  func hasActiveSubscription(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.subscription) {
          case (null) { false };
          case (?sub) { sub.expiresAt > Time.now() };
        };
      };
    };
  };

  func hasActiveReferral(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.referral) {
          case (null) { false };
          case (?ref) { ref.expiresAt > Time.now() };
        };
      };
    };
  };

  func hasManualPremium(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.hasManualPremium };
    };
  };

  func hasPremiumAccess(caller : Principal) : Bool {
    if (caller.toText() == creatorPrincipal or AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    hasActiveSubscription(caller) or hasActiveReferral(caller) or hasManualPremium(caller);
  };

  func ensurePremiumAccess(caller : Principal) {
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
  };

  func ensureUserOrPrivilegedAccess(caller : Principal) {
    if (AccessControl.isAdmin(accessControlState, caller) or caller.toText() == creatorPrincipal) {
      return;
    };
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access this feature");
    };
  };

  func ensureUserAccess(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can manage subscriptions and referrals");
    };
  };

  // --- Core Functions ---

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func grantManualPremiumAccess(user : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can grant manual premium access");
    };

    switch (userProfiles.get(user)) {
      case (null) {
        let newProfile : UserProfile = {
          name = "Manually Granted";
          email = null;
          subscription = null;
          referral = null;
          hasManualPremium = true;
        };
        userProfiles.add(user, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          existingProfile with
          hasManualPremium = true;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func revokeManualPremiumAccess(user : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can revoke manual premium access");
    };

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("No user found with manual premium access");
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          existingProfile with
          hasManualPremium = false;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func adminPremiumDiagnosis(target : Principal) : async AdminPremiumDiagnosis {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform premium diagnosis");
    };

    let premiumSource = if (target.toText() == creatorPrincipal) {
      #creator;
    } else if (AccessControl.isAdmin(accessControlState, target)) {
      #admin;
    } else if (hasManualPremium(target)) {
      #manual;
    } else if (hasActiveSubscription(target)) {
      #stripe;
    } else if (hasActiveReferral(target)) {
      #referral;
    } else {
      #none;
    };

    {
      user = userProfiles.get(target);
      premiumSource;
    };
  };

  // User Profile Management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    ensureUserOrPrivilegedAccess(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUserProfileData(name : Text, email : ?Text) : async () {
    ensureUserAccess(caller);

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          name;
          email;
          subscription = null;
          referral = null;
          hasManualPremium = false;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          name;
          email;
          subscription = existingProfile.subscription;
          referral = existingProfile.referral;
          hasManualPremium = existingProfile.hasManualPremium;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Subscription Management

  public shared ({ caller }) func activateSubscription(sessionId : Text, plan : SubscriptionPlan) : async () {
    ensureUserAccess(caller);

    let sessionStatus = await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);

    switch (sessionStatus) {
      case (#completed { response; userPrincipal }) {};
      case (#failed { error }) {
        Runtime.trap("Payment not completed. Cannot activate subscription. " # error);
      };
    };

    let expiresAt = switch (plan) {
      case (#monthly) { Time.now() + 30 * 24 * 60 * 60 * 1_000_000_000 };
      case (#yearly) { Time.now() + 365 * 24 * 60 * 60 * 1_000_000_000 };
    };

    let subscription : SubscriptionStatus = {
      plan;
      expiresAt;
      stripeSessionId = sessionId;
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          name = "";
          email = null;
          subscription = ?subscription;
          referral = null;
          hasManualPremium = false;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          name = existingProfile.name;
          email = existingProfile.email;
          subscription = ?subscription;
          referral = existingProfile.referral;
          hasManualPremium = existingProfile.hasManualPremium;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func checkSubscriptionStatus() : async ?SubscriptionStatus {
    ensureUserOrPrivilegedAccess(caller);
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.subscription };
    };
  };

  public query ({ caller }) func checkPremiumStatus() : async PremiumSource {
    ensureUserOrPrivilegedAccess(caller);

    if (caller.toText() == creatorPrincipal) { return #creator };
    if (AccessControl.isAdmin(accessControlState, caller)) { return #admin };
    if (hasManualPremium(caller)) { return #manual };
    if (hasActiveSubscription(caller)) { return #stripe };
    if (hasActiveReferral(caller)) { return #referral };
    #none;
  };

  // Referral System

  public shared ({ caller }) func createReferralCode(code : Text, validForNs : Time.Time) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create referral codes");
    };
    if (referralCodes.containsKey(code)) {
      Runtime.trap("Referral code already exists");
    };
    let status = {
      code;
      validUntil = Time.now() + validForNs;
    };
    referralCodes.add(code, status);
  };

  public query ({ caller }) func getActiveReferralCodes() : async [ReferralCodeStatus] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all codes");
    };
    let activeCodes = referralCodes.values().toArray();
    activeCodes.filter(func(c) { c.validUntil > Time.now() });
  };

  public shared ({ caller }) func revokeReferralCode(code : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can revoke codes");
    };
    switch (referralCodes.get(code)) {
      case (null) { Runtime.trap("Referral code does not exist") };
      case (?_) { referralCodes.remove(code) };
    };
  };

  public shared ({ caller }) func redeemReferralCode(code : Text) : async () {
    ensureUserAccess(caller);

    switch (referralCodes.get(code)) {
      case (null) { Runtime.trap("Invalid referral code") };
      case (?status) {
        if (status.validUntil < Time.now()) {
          Runtime.trap("Referral code has expired");
        };

        switch (userProfiles.get(caller)) {
          case (null) {
            let newProfile : UserProfile = {
              name = "";
              email = null;
              subscription = null;
              referral = ?{
                code = status.code;
                expiresAt = status.validUntil;
              };
              hasManualPremium = false;
            };
            userProfiles.add(caller, newProfile);
          };
          case (?existingProfile) {
            let updatedProfile : UserProfile = {
              name = existingProfile.name;
              email = existingProfile.email;
              subscription = existingProfile.subscription;
              referral = ?{
                code = status.code;
                expiresAt = status.validUntil;
              };
              hasManualPremium = existingProfile.hasManualPremium;
            };
            userProfiles.add(caller, updatedProfile);
          };
        };

        referralCodes.remove(code);
      };
    };
  };

  // Admin Data Management

  public shared ({ caller }) func setDepthChart(teamSportKey : Text, data : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    depthChartData.add(teamSportKey, data);
  };

  public shared ({ caller }) func setCoachingStyle(teamSportKey : Text, data : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coachingStyles.add(teamSportKey, data);
  };

  public shared ({ caller }) func setInjuryReport(playerTeamKey : Text, data : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    injuryReports.add(playerTeamKey, data);
  };

  public shared ({ caller }) func setNewsFlag(key : Text, data : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    newsFlags.add(key, data);
  };

  public shared ({ caller }) func addUpcomingMatch(matchId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.add(matchId);
  };

  public shared ({ caller }) func removeUpcomingMatch(matchId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.remove(matchId);
  };

  // Prediction Management

  public shared ({ caller }) func createPrediction(prediction : Prediction.Prediction) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.add(prediction.id, prediction);
  };

  public shared ({ caller }) func updatePrediction(prediction : Prediction.Prediction) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.add(prediction.id, prediction);
  };

  public shared ({ caller }) func deletePrediction(predictionId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.remove(predictionId);
  };

  // Prediction Retrieval

  public query ({ caller }) func getAllPredictions() : async [Prediction.Prediction] {
    ensurePremiumAccess(caller);
    predictionsById.values().toArray().sort();
  };

  public query ({ caller }) func getPredictionsBySport(sport : SportsCategory) : async [Prediction.Prediction] {
    ensurePremiumAccess(caller);
    let filtered = predictionsById.values().toArray().filter(
      func(p : Prediction.Prediction) : Bool {
        switch (sport, p.sport) {
          case (#nba, #nba) { true };
          case (#soccer, #soccer) { true };
          case (#mlb, #mlb) { true };
          case (#nhl, #nhl) { true };
          case (#ncaaf, #ncaaf) { true };
          case (#nfl, #nfl) { true };
          case (#ncaabb, #ncaabb) { true };
          case (#other(s1), #other(s2)) { s1 == s2 };
          case _ { false };
        };
      },
    );
    filtered.sort();
  };

  public query ({ caller }) func getPredictionsByMarket(market : BettingMarket) : async [Prediction.Prediction] {
    ensurePremiumAccess(caller);
    let filtered = predictionsById.values().toArray().filter(
      func(p : Prediction.Prediction) : Bool {
        switch (market, p.market) {
          case (#pointSpreads, #pointSpreads) { true };
          case (#moneyLine, #moneyLine) { true };
          case (#overUnder, #overUnder) { true };
          case (#alternativeSpreads, #alternativeSpreads) { true };
          case (#alternativeOvers, #alternativeOvers) { true };
          case (#sameGameParlays, #sameGameParlays) { true };
          case (#otherMarkets(m1), #otherMarkets(m2)) { m1 == m2 };
          case _ { false };
        };
      },
    );
    filtered.sort();
  };

  public query ({ caller }) func getPredictionsByDateRange(startTime : Time.Time, endTime : Time.Time) : async [Prediction.Prediction] {
    ensurePremiumAccess(caller);
    let filtered = predictionsById.values().toArray().filter(
      func(p : Prediction.Prediction) : Bool {
        p.matchDate >= startTime and p.matchDate <= endTime;
      },
    );
    filtered.sort();
  };

  public query ({ caller }) func getPrediction(predictionId : Text) : async ?Prediction.Prediction {
    ensurePremiumAccess(caller);
    predictionsById.get(predictionId);
  };

  // Admin Data Retrieval

  public query ({ caller }) func getDepthChart(teamSportKey : Text) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    depthChartData.get(teamSportKey);
  };

  public query ({ caller }) func getCoachingStyle(teamSportKey : Text) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coachingStyles.get(teamSportKey);
  };

  public query ({ caller }) func getInjuryReport(playerTeamKey : Text) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    injuryReports.get(playerTeamKey);
  };

  public query ({ caller }) func getNewsFlag(key : Text) : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    newsFlags.get(key);
  };

  public query ({ caller }) func getUpcomingMatches() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.values().toArray();
  };

  // ------------ Live Scores Functionality ------------

  public shared ({ caller }) func updateLiveScore(gameId : GameId, score : LiveScore) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update live scores");
    };
    liveScores.add(gameId, score);
  };

  public query ({ caller }) func getLiveScore(gameId : GameId) : async ?LiveScore {
    liveScores.get(gameId);
  };

  public query ({ caller }) func getAllLiveScores() : async [LiveScore] {
    liveScores.values().toArray();
  };

  public query ({ caller }) func getLiveScoresBySport(_sport : SportsCategory) : async [LiveScore] {
    liveScores.values().toArray();
  };

  public query ({ caller }) func getLiveScoresByLeague(_league : Text) : async [LiveScore] {
    liveScores.values().toArray();
  };

  public query ({ caller }) func getGamesInProgress() : async [LiveScore] {
    let allScores = liveScores.values().toArray();
    allScores.filter(func(score) { score.status == "in_progress" });
  };

  public query ({ caller }) func getFinalScores() : async [LiveScore] {
    let allScores = liveScores.values().toArray();
    allScores.filter(func(score) { score.status == "final" });
  };

  public query ({ caller }) func getLiveScoresByTeam(teamName : Text) : async [LiveScore] {
    let allScores = liveScores.values().toArray();
    allScores.filter(
      func(score) {
        score.homeTeam.toLower().contains(#text (teamName.toLower())) or
        score.awayTeam.toLower().contains(#text (teamName.toLower()))
      }
    );
  };

  public query ({ caller }) func getLiveMatchesSummary() : async {
    inProgress : Nat;
    finals : Nat;
    total : Nat;
  } {
    let allScores = liveScores.values().toArray();
    let inProgress = allScores.filter(func(score) { score.status == "in_progress" }).size();
    let finals = allScores.filter(func(score) { score.status == "final" }).size();
    {
      inProgress;
      finals;
      total = allScores.size();
    };
  };

  public shared ({ caller }) func batchUpdateLiveScores(scores : [(GameId, LiveScore)]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform batch updates");
    };

    for ((gameId, score) in scores.values()) {
      liveScores.add(gameId, score);
    };
  };

  public shared ({ caller }) func removeLiveScore(gameId : GameId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can remove live scores");
    };
    liveScores.remove(gameId);
  };

  public shared ({ caller }) func removeFinishedGames() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can clean up scores");
    };

    let filteredScores = liveScores.filter(
      func(gameId, score) { score.status != "final" }
    );

    liveScores.clear();
    for ((gameId, score) in filteredScores.entries()) {
      liveScores.add(gameId, score);
    };
  };
};
