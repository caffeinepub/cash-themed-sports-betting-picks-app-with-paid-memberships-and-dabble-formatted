import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AdminGate from '../components/AdminGate';
import StripePaymentSetup from '../components/StripePaymentSetup';
import ReferralCodesAdminPanel from '../components/ReferralCodesAdminPanel';
import { useIsStripeConfigured } from '../hooks/useStripeCheckout';
import {
  useSetDepthChart,
  useSetInjuryReport,
  useSetCoachingStyle,
  useSetNewsFlag,
  useCreatePrediction,
} from '../hooks/useAdmin';
import { toast } from 'sonner';
import { Shield, Database, TrendingUp, FileText, CreditCard, Ticket } from 'lucide-react';

function AdminContent() {
  const { data: isStripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const [showStripeSetup, setShowStripeSetup] = useState(false);

  const setDepthChart = useSetDepthChart();
  const setInjuryReport = useSetInjuryReport();
  const setCoachingStyle = useSetCoachingStyle();
  const setNewsFlag = useSetNewsFlag();
  const createPrediction = useCreatePrediction();

  const [depthChartKey, setDepthChartKey] = useState('');
  const [depthChartData, setDepthChartData] = useState('');

  const [injuryKey, setInjuryKey] = useState('');
  const [injuryData, setInjuryData] = useState('');

  const [coachingKey, setCoachingKey] = useState('');
  const [coachingData, setCoachingData] = useState('');

  const [newsKey, setNewsKey] = useState('');
  const [newsData, setNewsData] = useState('');

  const [predictionId, setPredictionId] = useState('');
  const [predictionSport, setPredictionSport] = useState('nba');
  const [predictionMarket, setPredictionMarket] = useState('moneyLine');
  const [predictionValue, setPredictionValue] = useState('');
  const [predictionJuice, setPredictionJuice] = useState('');
  const [predictionProb, setPredictionProb] = useState('0.5');

  const handleDepthChartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDepthChart.mutateAsync({ key: depthChartKey, data: depthChartData });
      toast.success('Depth chart saved');
      setDepthChartKey('');
      setDepthChartData('');
    } catch (error) {
      toast.error('Failed to save depth chart');
    }
  };

  const handleInjurySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setInjuryReport.mutateAsync({ key: injuryKey, data: injuryData });
      toast.success('Injury report saved');
      setInjuryKey('');
      setInjuryData('');
    } catch (error) {
      toast.error('Failed to save injury report');
    }
  };

  const handleCoachingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setCoachingStyle.mutateAsync({ key: coachingKey, data: coachingData });
      toast.success('Coaching style saved');
      setCoachingKey('');
      setCoachingData('');
    } catch (error) {
      toast.error('Failed to save coaching style');
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setNewsFlag.mutateAsync({ key: newsKey, data: newsData });
      toast.success('News flag saved');
      setNewsKey('');
      setNewsData('');
    } catch (error) {
      toast.error('Failed to save news flag');
    }
  };

  const handlePredictionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sportVariant = { [predictionSport]: null } as any;
      const marketVariant = { [predictionMarket]: null } as any;

      await createPrediction.mutateAsync({
        id: predictionId,
        sport: sportVariant,
        market: marketVariant,
        marketValue: predictionValue,
        juice: predictionJuice,
        winningProbability: parseFloat(predictionProb),
        createdAt: BigInt(Date.now() * 1000000),
        matchDate: BigInt(Date.now() * 1000000),
      });
      toast.success('Prediction created');
      setPredictionId('');
      setPredictionValue('');
      setPredictionJuice('');
      setPredictionProb('0.5');
    } catch (error) {
      toast.error('Failed to create prediction');
    }
  };

  if (stripeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  if (!isStripeConfigured && !showStripeSetup) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mb-4">
            <CreditCard className="h-8 w-8 text-cash-gold" />
          </div>
          <h2 className="text-3xl font-bold">Stripe Setup Required</h2>
          <p className="text-muted-foreground">
            Please configure Stripe to enable subscription payments before accessing admin features.
          </p>
          <Button
            onClick={() => setShowStripeSetup(true)}
            className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
          >
            Configure Stripe
          </Button>
        </div>
      </div>
    );
  }

  if (showStripeSetup) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <StripePaymentSetup />
          {isStripeConfigured && (
            <Button onClick={() => setShowStripeSetup(false)} variant="outline" className="w-full mt-4">
              Continue to Admin Panel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="h-10 w-10 text-cash-gold" />
            Admin Panel
          </h1>
          <p className="text-lg text-muted-foreground">Manage predictions and data inputs</p>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="depth">Depth Charts</TabsTrigger>
            <TabsTrigger value="injuries">Injuries</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="referrals">Referral Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cash-gold" />
                  Create Prediction
                </CardTitle>
                <CardDescription>Add a new prediction to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredictionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pred-id">Prediction ID *</Label>
                      <Input
                        id="pred-id"
                        value={predictionId}
                        onChange={(e) => setPredictionId(e.target.value)}
                        placeholder="unique-id"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pred-sport">Sport *</Label>
                      <select
                        id="pred-sport"
                        value={predictionSport}
                        onChange={(e) => setPredictionSport(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="nba">NBA</option>
                        <option value="nfl">NFL</option>
                        <option value="mlb">MLB</option>
                        <option value="nhl">NHL</option>
                        <option value="ncaaf">NCAAF</option>
                        <option value="ncaabb">NCAABB</option>
                        <option value="soccer">Soccer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pred-market">Market *</Label>
                      <select
                        id="pred-market"
                        value={predictionMarket}
                        onChange={(e) => setPredictionMarket(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="moneyLine">Money Line</option>
                        <option value="pointSpreads">Point Spread</option>
                        <option value="overUnder">Over/Under</option>
                        <option value="alternativeSpreads">Alternative Spread</option>
                        <option value="alternativeOvers">Alternative Over</option>
                        <option value="sameGameParlays">Same Game Parlay</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pred-prob">Win Probability (0-1) *</Label>
                      <Input
                        id="pred-prob"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={predictionProb}
                        onChange={(e) => setPredictionProb(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pred-value">Market Value *</Label>
                      <Input
                        id="pred-value"
                        value={predictionValue}
                        onChange={(e) => setPredictionValue(e.target.value)}
                        placeholder="Team A -3.5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pred-juice">Odds/Juice *</Label>
                      <Input
                        id="pred-juice"
                        value={predictionJuice}
                        onChange={(e) => setPredictionJuice(e.target.value)}
                        placeholder="-110"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                    disabled={createPrediction.isPending}
                  >
                    {createPrediction.isPending ? 'Creating...' : 'Create Prediction'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-cash-gold" />
                  Depth Chart Management
                </CardTitle>
                <CardDescription>Add or update depth chart data</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDepthChartSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="depth-key">Team/Sport Key *</Label>
                    <Input
                      id="depth-key"
                      value={depthChartKey}
                      onChange={(e) => setDepthChartKey(e.target.value)}
                      placeholder="lakers-nba"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth-data">Depth Chart Data *</Label>
                    <Textarea
                      id="depth-data"
                      value={depthChartData}
                      onChange={(e) => setDepthChartData(e.target.value)}
                      placeholder="Enter depth chart information..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                    disabled={setDepthChart.isPending}
                  >
                    {setDepthChart.isPending ? 'Saving...' : 'Save Depth Chart'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="injuries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cash-gold" />
                  Injury Report Management
                </CardTitle>
                <CardDescription>Add or update injury reports</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInjurySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="injury-key">Player/Team Key *</Label>
                    <Input
                      id="injury-key"
                      value={injuryKey}
                      onChange={(e) => setInjuryKey(e.target.value)}
                      placeholder="lebron-lakers"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injury-data">Injury Report *</Label>
                    <Textarea
                      id="injury-data"
                      value={injuryData}
                      onChange={(e) => setInjuryData(e.target.value)}
                      placeholder="Enter injury status..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                    disabled={setInjuryReport.isPending}
                  >
                    {setInjuryReport.isPending ? 'Saving...' : 'Save Injury Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coaching">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cash-gold" />
                  Coaching Style Management
                </CardTitle>
                <CardDescription>Add or update coaching style notes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCoachingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coaching-key">Team/Sport Key *</Label>
                    <Input
                      id="coaching-key"
                      value={coachingKey}
                      onChange={(e) => setCoachingKey(e.target.value)}
                      placeholder="lakers-nba"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coaching-data">Coaching Style *</Label>
                    <Textarea
                      id="coaching-data"
                      value={coachingData}
                      onChange={(e) => setCoachingData(e.target.value)}
                      placeholder="Enter coaching style information..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                    disabled={setCoachingStyle.isPending}
                  >
                    {setCoachingStyle.isPending ? 'Saving...' : 'Save Coaching Style'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cash-gold" />
                  News & Drama Management
                </CardTitle>
                <CardDescription>Add or update player news and drama flags</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="news-key">News Key *</Label>
                    <Input
                      id="news-key"
                      value={newsKey}
                      onChange={(e) => setNewsKey(e.target.value)}
                      placeholder="player-team-date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="news-data">News/Drama Details *</Label>
                    <Textarea
                      id="news-data"
                      value={newsData}
                      onChange={(e) => setNewsData(e.target.value)}
                      placeholder="Enter news or drama information..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                    disabled={setNewsFlag.isPending}
                  >
                    {setNewsFlag.isPending ? 'Saving...' : 'Save News Flag'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralCodesAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminContent />
    </AdminGate>
  );
}
