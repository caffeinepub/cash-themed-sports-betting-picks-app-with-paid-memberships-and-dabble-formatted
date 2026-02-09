import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function SendSupportPage() {
  const [copied, setCopied] = useState(false);
  const cashtag = '$cashcahh1234';
  const cashAppUrl = 'https://cash.app/$cashcahh1234';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cashtag);
      setCopied(true);
      toast.success('$Cashtag copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/assets/generated/cash-icons.dim_512x512.png"
                alt="Cash App Support"
                className="h-32 w-32 object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cash-green/20 to-cash-gold/20 rounded-full blur-2xl"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Send Support</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Love CashPicks? Support the creator directly via Cash App
          </p>
        </div>

        <Card className="border-cash-gold/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cash-gold/5 rounded-full blur-3xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-cash-gold" />
              Cash App Details
            </CardTitle>
            <CardDescription>Send tips or donations manually through Cash App</CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Cash App $Cashtag</p>
                <p className="text-3xl font-bold text-cash-gold font-mono">{cashtag}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Cash App Link</p>
                <a
                  href={cashAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cash-green hover:underline break-all flex items-center gap-2"
                >
                  {cashAppUrl}
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-cash-gold/30 hover:bg-cash-gold/10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy $Cashtag
                  </>
                )}
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                <a href={cashAppUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Cash App
                </a>
              </Button>
            </div>

            <div className="bg-card/50 border border-border/40 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-cash-gold">Important Notice</p>
              <p className="text-sm text-muted-foreground">
                All support and tips are sent manually by you through Cash App. CashPicks does not process, route, or
                handle any Cash App payments. This is a manual, voluntary donation system only.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Your support helps keep CashPicks running and improving. Thank you! 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
