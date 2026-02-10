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
import ManualPremiumGrantCard from '../components/ManualPremiumGrantCard';
import AdminSupportCard from '../components/AdminSupportCard';
import { useIsStripeConfigured } from '../hooks/useStripeCheckout';
import {
  useSetDepthChart,
  useSetInjuryReport,
  useSetCoachingStyle,
  useSetNewsFlag,
  useCreatePrediction,
} from '../hooks/useAdmin';
import { toast } from 'sonner';
import { Shield, Database, TrendingUp, FileText, CreditCard, Ticket, Crown, Headphones } from 'lucide-react';

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
      const prediction = {
        id: predictionId,
        sport: { __kind__: predictionSport, [predictionSport]: null } as any,
        market: { __kind__: predictionMarket, [predictionMarket]: null } as any,
        marketValue: predictionValue,
        juice: predictionJuice,
        winningProbability: parseFloat(predictionProb),
        createdAt: BigInt(Date.now() * 1000000),
        matchDate: BigInt(Date.now() * 1000000),
      };
      await createPrediction.mutateAsync(prediction);
      toast.success('Prediction created');
      setPredictionId('');
      setPredictionValue('');
      setPredictionJuice('');
      setPredictionProb('0.5');
    } catch (error) {
      toast.error('Failed to create prediction');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="h-10 w-10 text-cash-gold" />
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Manage predictions, data inputs, and system configuration</p>
        </div>

        {!stripeLoading && !isStripeConfigured && !showStripeSetup && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Stripe Not Configured</CardTitle>
              <CardDescription>Payment processing is not available until Stripe is configured</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowStripeSetup(true)} variant="destructive">
                Configure Stripe Now
              </Button>
            </CardContent>
          </Card>
        )}

        {showStripeSetup && (
          <div className="space-y-4">
            <StripePaymentSetup />
            <Button onClick={() => setShowStripeSetup(false)} variant="outline">
              Close Stripe Setup
            </Button>
          </div>
        )}

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data Inputs</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Premium</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="border-cash-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cash-gold" />
                  Create Prediction
                </CardTitle>
                <CardDescription>Add a new sports betting prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredictionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prediction-id">Prediction ID *</Label>
                      <Input
                        id="prediction-id"
                        value={predictionId}
                        onChange={(e) => setPredictionId(e.target.value)}
                        placeholder="unique-prediction-id"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prediction-sport">Sport *</Label>
                      <select
                        id="prediction-sport"
                        value={predictionSport}
                        onChange={(e) => setPredictionSport(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="nba">NBA</option>
                        <option value="nfl">NFL</option>
                        <option value="mlb">MLB</option>
                        <option value="nhl">NHL</option>
                        <option value="soccer">Soccer</option>
                        <option value="ncaaf">NCAAF</option>
                        <option value="ncaabb">NCAABB</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prediction-market">Market *</Label>
                      <select
                        id="prediction-market"
                        value={predictionMarket}
                        onChange={(e) => setPredictionMarket(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="moneyLine">Money Line</option>
                        <option value="pointSpreads">Point Spreads</option>
                        <option value="overUnder">Over/Under</option>
                        <option value="alternativeSpreads">Alternative Spreads</option>
                        <option value="alternativeOvers">Alternative Overs</option>
                        <option value="sameGameParlays">Same Game Parlays</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prediction-value">Market Value *</Label>
                      <Input
                        id="prediction-value"
                        value={predictionValue}
                        onChange={(e) => setPredictionValue(e.target.value)}
                        placeholder="e.g., Lakers -5.5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prediction-juice">Juice *</Label>
                      <Input
                        id="prediction-juice"
                        value={predictionJuice}
                        onChange={(e) => setPredictionJuice(e.target.value)}
                        placeholder="e.g., -110"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prediction-prob">Winning Probability (0-1) *</Label>
                      <Input
                        id="prediction-prob"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={predictionProb}
                        onChange={(e) => setPredictionProb(e.target.value)}
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

          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-cash-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-cash-gold" />
                    Depth Chart
                  </CardTitle>
                  <CardDescription>Update team depth chart information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDepthChartSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="depth-key">Team/Sport Key *</Label>
                      <Input
                        id="depth-key"
                        value={depthChartKey}
                        onChange={(e) => setDepthChartKey(e.target.value)}
                        placeholder="e.g., lakers-nba"
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
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={setDepthChart.isPending}>
                      {setDepthChart.isPending ? 'Saving...' : 'Save Depth Chart'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-cash-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cash-gold" />
                    Injury Report
                  </CardTitle>
                  <CardDescription>Update player injury information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInjurySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="injury-key">Player/Team Key *</Label>
                      <Input
                        id="injury-key"
                        value={injuryKey}
                        onChange={(e) => setInjuryKey(e.target.value)}
                        placeholder="e.g., lebron-lakers"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="injury-data">Injury Data *</Label>
                      <Textarea
                        id="injury-data"
                        value={injuryData}
                        onChange={(e) => setInjuryData(e.target.value)}
                        placeholder="Enter injury information..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={setInjuryReport.isPending}>
                      {setInjuryReport.isPending ? 'Saving...' : 'Save Injury Report'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-cash-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cash-gold" />
                    Coaching Style
                  </CardTitle>
                  <CardDescription>Update coaching style information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCoachingSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coaching-key">Team/Sport Key *</Label>
                      <Input
                        id="coaching-key"
                        value={coachingKey}
                        onChange={(e) => setCoachingKey(e.target.value)}
                        placeholder="e.g., lakers-nba"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coaching-data">Coaching Data *</Label>
                      <Textarea
                        id="coaching-data"
                        value={coachingData}
                        onChange={(e) => setCoachingData(e.target.value)}
                        placeholder="Enter coaching style information..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={setCoachingStyle.isPending}>
                      {setCoachingStyle.isPending ? 'Saving...' : 'Save Coaching Style'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-cash-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cash-gold" />
                    News Flag
                  </CardTitle>
                  <CardDescription>Add news or drama flags</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="news-key">News Key *</Label>
                      <Input
                        id="news-key"
                        value={newsKey}
                        onChange={(e) => setNewsKey(e.target.value)}
                        placeholder="e.g., lakers-trade-rumors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="news-data">News Data *</Label>
                      <Textarea
                        id="news-data"
                        value={newsData}
                        onChange={(e) => setNewsData(e.target.value)}
                        placeholder="Enter news information..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={setNewsFlag.isPending}>
                      {setNewsFlag.isPending ? 'Saving...' : 'Save News Flag'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <ReferralCodesAdminPanel />
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <ManualPremiumGrantCard />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <AdminSupportCard />
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
