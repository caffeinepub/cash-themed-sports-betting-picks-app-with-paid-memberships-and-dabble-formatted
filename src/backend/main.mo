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
import Migration "migration";

(with migration = Migration.run)
actor {
  // Module Types and Helpers
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

  func sportsCategoryToText(category : SportsCategory) : Text {
    switch (category) {
      case (#nba) { "nba" };
      case (#soccer) { "soccer" };
      case (#mlb) { "mlb" };
      case (#nhl) { "nhl" };
      case (#ncaaf) { "ncaaf" };
      case (#nfl) { "nfl" };
      case (#ncaabb) { "ncaabb" };
      case (#other(text)) { text };
    };
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

  func bettingMarketToText(market : BettingMarket) : Text {
    switch (market) {
      case (#pointSpreads) { "point_spreads" };
      case (#moneyLine) { "money_line" };
      case (#overUnder) { "over_under" };
      case (#alternativeSpreads) { "alternative_spreads" };
      case (#alternativeOvers) { "alternative_overs" };
      case (#sameGameParlays) { "same_game_parlays" };
      case (#otherMarkets(text)) { text };
    };
  };

  public type SubscriptionPlan = {
    #monthly; // $25/month
    #yearly;  // $250/year
  };

  public type PremiumSource = {
    #none;
    #stripe;
    #referral;
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

  type ReferralCodeStatus = {
    code : Text;
    validUntil : Time.Time;
  };

  // Persistent State
  let predictionsById = Map.empty<Text, Prediction.Prediction>();
  let depthChartData = Map.empty<Text, Text>(); // team/sport to depth chart info
  let coachingStyles = Map.empty<Text, Text>(); // team/sport to coaching style
  let injuryReports = Map.empty<Text, Text>(); // player/team to injury status
  let newsFlags = Map.empty<Text, Text>(); // news/drama flags (text)
  let upcomingMatches = Set.empty<Text>(); // Set of upcoming matches/lines by ID
  let userProfiles = Map.empty<Principal, UserProfile>();

  // New persistent state for referral codes system
  let referralCodes = Map.empty<Text, ReferralCodeStatus>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if user has active subscription
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

  // Helper function to check if user has any form of premium access
  func hasPremiumAccess(caller : Principal) : Bool {
    hasActiveSubscription(caller) or hasActiveReferral(caller) or AccessControl.isAdmin(accessControlState, caller);
  };

  // Core Functions

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  // User Profile Management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateUserProfileData(name : Text, email : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          name;
          email;
          subscription = null;
          referral = null;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          name;
          email;
          subscription = existingProfile.subscription; // Preserve existing subscription
          referral = existingProfile.referral;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Subscription Management

  public shared ({ caller }) func activateSubscription(sessionId : Text, plan : SubscriptionPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can activate subscriptions");
    };

    let expiresAt = switch (plan) {
      case (#monthly) { Time.now() + 30 * 24 * 60 * 60 * 1_000_000_000 }; // 30 days in nanoseconds
      case (#yearly) { Time.now() + 365 * 24 * 60 * 60 * 1_000_000_000 }; // 365 days in nanoseconds
    };

    let subscription : SubscriptionStatus = {
      plan = plan;
      expiresAt = expiresAt;
      stripeSessionId = sessionId;
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        let newProfile : UserProfile = {
          name = "";
          email = null;
          subscription = ?subscription;
          referral = null;
        };
        userProfiles.add(caller, newProfile);
      };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          name = existingProfile.name;
          email = existingProfile.email;
          subscription = ?subscription;
          referral = existingProfile.referral;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func checkSubscriptionStatus() : async ?SubscriptionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check subscription status");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.subscription };
    };
  };

  public query ({ caller }) func checkPremiumStatus() : async PremiumSource {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check for premium access");
    };
    if (hasActiveSubscription(caller)) { return #stripe };
    if (hasActiveReferral(caller)) { return #referral };
    #none;
  };

  // Referral System Functionality

  // Admin creates new referral code with premium duration in nanoseconds
  public shared ({ caller }) func createReferralCode(code : Text, validForNs : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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

  // Admin lists all active referral codes
  public query ({ caller }) func getActiveReferralCodes() : async [ReferralCodeStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all codes");
    };
    let activeCodes = referralCodes.values().toArray();
    activeCodes.filter(func(c) { c.validUntil > Time.now() });
  };

  // Admin revokes a referral code
  public shared ({ caller }) func revokeReferralCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke codes");
    };
    switch (referralCodes.get(code)) {
      case (null) { Runtime.trap("Referral code does not exist") };
      case (?_) { referralCodes.remove(code) };
    };
  };

  // User redeems a referral code for premium access
  public shared ({ caller }) func redeemReferralCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can redeem codes");
    };

    switch (referralCodes.get(code)) {
      case (null) { Runtime.trap("Invalid referral code") };
      case (?status) {
        if (status.validUntil < Time.now()) {
          Runtime.trap("Referral code has expired");
        };

        // Update user profile with referral
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
            };
            userProfiles.add(caller, updatedProfile);
          };
        };

        // Remove code so it can't be reused
        referralCodes.remove(code);
      };
    };
  };

  // Admin-only Data Management Functions

  public shared ({ caller }) func setDepthChart(teamSportKey : Text, data : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    depthChartData.add(teamSportKey, data);
  };

  public shared ({ caller }) func setCoachingStyle(teamSportKey : Text, data : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coachingStyles.add(teamSportKey, data);
  };

  public shared ({ caller }) func setInjuryReport(playerTeamKey : Text, data : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    injuryReports.add(playerTeamKey, data);
  };

  public shared ({ caller }) func setNewsFlag(key : Text, data : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    newsFlags.add(key, data);
  };

  public shared ({ caller }) func addUpcomingMatch(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.add(matchId);
  };

  public shared ({ caller }) func removeUpcomingMatch(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.remove(matchId);
  };

  // Admin-only Prediction Management

  public shared ({ caller }) func createPrediction(prediction : Prediction.Prediction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.add(prediction.id, prediction);
  };

  public shared ({ caller }) func updatePrediction(prediction : Prediction.Prediction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.add(prediction.id, prediction);
  };

  public shared ({ caller }) func deletePrediction(predictionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    predictionsById.remove(predictionId);
  };

  // Subscriber-only Prediction Retrieval Functions

  public query ({ caller }) func getAllPredictions() : async [Prediction.Prediction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
    predictionsById.values().toArray().sort();
  };

  public query ({ caller }) func getPredictionsBySport(sport : SportsCategory) : async [Prediction.Prediction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
    let filtered = predictionsById.values().toArray().filter(
      func(p : Prediction.Prediction) : Bool {
        p.matchDate >= startTime and p.matchDate <= endTime;
      },
    );
    filtered.sort();
  };

  public query ({ caller }) func getPrediction(predictionId : Text) : async ?Prediction.Prediction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view predictions");
    };
    if (not hasPremiumAccess(caller)) {
      Runtime.trap("Unauthorized: Active subscription or referral required to view predictions");
    };
    predictionsById.get(predictionId);
  };

  // Admin-only Data Retrieval (for management purposes)

  public query ({ caller }) func getDepthChart(teamSportKey : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    depthChartData.get(teamSportKey);
  };

  public query ({ caller }) func getCoachingStyle(teamSportKey : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coachingStyles.get(teamSportKey);
  };

  public query ({ caller }) func getInjuryReport(playerTeamKey : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    injuryReports.get(playerTeamKey);
  };

  public query ({ caller }) func getNewsFlag(key : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    newsFlags.get(key);
  };

  public query ({ caller }) func getUpcomingMatches() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    upcomingMatches.values().toArray();
  };
};
