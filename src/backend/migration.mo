import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old types
  type SubscriptionPlan = {
    #monthly;
    #yearly;
  };

  type SubscriptionStatus = {
    plan : SubscriptionPlan;
    expiresAt : Int;
    stripeSessionId : Text;
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
    subscription : ?SubscriptionStatus;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // New referral types
  type PremiumSource = {
    #none;
    #stripe;
    #referral;
  };

  type ReferralStatus = {
    code : Text;
    expiresAt : Int;
  };

  type NewUserProfile = {
    name : Text;
    email : ?Text;
    subscription : ?SubscriptionStatus;
    referral : ?ReferralStatus;
  };

  // New actor state
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, UserProfile, NewUserProfile>(
      func(_p, profile) {
        { profile with referral = null };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
