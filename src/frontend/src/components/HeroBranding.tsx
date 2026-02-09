export default function HeroBranding() {
  return (
    <div className="relative overflow-hidden py-20 md:py-32">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/assets/generated/cash-pattern.dim_2048x2048.png)',
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img src="/assets/generated/cash-logo.dim_512x512.png" alt="CashPicks Logo" className="h-24 w-24" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cash-green via-cash-gold to-cash-green bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Sports Betting Predictions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Get the edge with predictions that analyze depth charts, injuries, coaching styles, and player news.
          </p>
        </div>
      </div>
    </div>
  );
}
