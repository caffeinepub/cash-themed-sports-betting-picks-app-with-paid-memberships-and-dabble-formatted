import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SportsCategory = {
    __kind__: "mlb";
    mlb: null;
} | {
    __kind__: "nba";
    nba: null;
} | {
    __kind__: "nfl";
    nfl: null;
} | {
    __kind__: "nhl";
    nhl: null;
} | {
    __kind__: "soccer";
    soccer: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "ncaabb";
    ncaabb: null;
} | {
    __kind__: "ncaaf";
    ncaaf: null;
};
export interface ReferralStatus {
    expiresAt: Time;
    code: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Prediction {
    id: string;
    winningProbability: number;
    marketValue: string;
    createdAt: Time;
    juice: string;
    sport: SportsCategory;
    market: BettingMarket;
    matchDate: Time;
}
export type BettingMarket = {
    __kind__: "sameGameParlays";
    sameGameParlays: null;
} | {
    __kind__: "overUnder";
    overUnder: null;
} | {
    __kind__: "alternativeSpreads";
    alternativeSpreads: null;
} | {
    __kind__: "pointSpreads";
    pointSpreads: null;
} | {
    __kind__: "moneyLine";
    moneyLine: null;
} | {
    __kind__: "otherMarkets";
    otherMarkets: string;
} | {
    __kind__: "alternativeOvers";
    alternativeOvers: null;
};
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LiveScore {
    status: string;
    currentPeriod: string;
    homeTeam: string;
    lastUpdated: Time;
    homeScore: bigint;
    awayTeam: string;
    awayScore: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type GameId = string;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface AdminPremiumDiagnosis {
    premiumSource: PremiumSource;
    user?: UserProfile;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface SubscriptionStatus {
    expiresAt: Time;
    plan: SubscriptionPlan;
    stripeSessionId: string;
}
export interface UserProfile {
    hasManualPremium: boolean;
    referral?: ReferralStatus;
    subscription?: SubscriptionStatus;
    name: string;
    email?: string;
}
export interface ReferralCodeStatus {
    code: string;
    validUntil: Time;
}
export enum PremiumSource {
    stripe = "stripe",
    creator = "creator",
    referral = "referral",
    admin = "admin",
    none = "none",
    manual = "manual"
}
export enum SubscriptionPlan {
    monthly = "monthly",
    yearly = "yearly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateSubscription(sessionId: string, plan: SubscriptionPlan): Promise<void>;
    addUpcomingMatch(matchId: string): Promise<void>;
    adminPremiumDiagnosis(target: Principal): Promise<AdminPremiumDiagnosis>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    batchUpdateLiveScores(scores: Array<[GameId, LiveScore]>): Promise<void>;
    checkPremiumStatus(): Promise<PremiumSource>;
    checkSubscriptionStatus(): Promise<SubscriptionStatus | null>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPrediction(prediction: Prediction): Promise<void>;
    createReferralCode(code: string, validForNs: Time): Promise<void>;
    deletePrediction(predictionId: string): Promise<void>;
    getActiveReferralCodes(): Promise<Array<ReferralCodeStatus>>;
    getAllLiveScores(): Promise<Array<LiveScore>>;
    getAllPredictions(): Promise<Array<Prediction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoachingStyle(teamSportKey: string): Promise<string | null>;
    getDepthChart(teamSportKey: string): Promise<string | null>;
    getFinalScores(): Promise<Array<LiveScore>>;
    getGamesInProgress(): Promise<Array<LiveScore>>;
    getInjuryReport(playerTeamKey: string): Promise<string | null>;
    getLiveMatchesSummary(): Promise<{
        total: bigint;
        finals: bigint;
        inProgress: bigint;
    }>;
    getLiveScore(gameId: GameId): Promise<LiveScore | null>;
    getLiveScoresByLeague(_league: string): Promise<Array<LiveScore>>;
    getLiveScoresBySport(_sport: SportsCategory): Promise<Array<LiveScore>>;
    getLiveScoresByTeam(teamName: string): Promise<Array<LiveScore>>;
    getNewsFlag(key: string): Promise<string | null>;
    getPrediction(predictionId: string): Promise<Prediction | null>;
    getPredictionsByDateRange(startTime: Time, endTime: Time): Promise<Array<Prediction>>;
    getPredictionsByMarket(market: BettingMarket): Promise<Array<Prediction>>;
    getPredictionsBySport(sport: SportsCategory): Promise<Array<Prediction>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpcomingMatches(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantManualPremiumAccess(user: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    redeemReferralCode(code: string): Promise<void>;
    removeFinishedGames(): Promise<void>;
    removeLiveScore(gameId: GameId): Promise<void>;
    removeUpcomingMatch(matchId: string): Promise<void>;
    revokeManualPremiumAccess(user: Principal): Promise<void>;
    revokeReferralCode(code: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCoachingStyle(teamSportKey: string, data: string): Promise<void>;
    setDepthChart(teamSportKey: string, data: string): Promise<void>;
    setInjuryReport(playerTeamKey: string, data: string): Promise<void>;
    setNewsFlag(key: string, data: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateLiveScore(gameId: GameId, score: LiveScore): Promise<void>;
    updatePrediction(prediction: Prediction): Promise<void>;
    updateUserProfileData(name: string, email: string | null): Promise<void>;
}
