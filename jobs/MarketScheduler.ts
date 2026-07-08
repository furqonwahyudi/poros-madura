import { MarketDataService } from "../services/MarketDataService";

export class MarketScheduler {
  private service: MarketDataService;
  private timerIhsg: NodeJS.Timeout | null = null;
  private timerUsd: NodeJS.Timeout | null = null;
  private timerGold: NodeJS.Timeout | null = null;
  
  private currentIhsgInterval = 30;
  private currentUsdInterval = 60;
  private currentGoldInterval = 60;

  constructor(service: MarketDataService) {
    this.service = service;
  }

  public start(): void {
    console.log("[MarketScheduler] Starting background market synchronization jobs...");
    this.syncAll();
    this.scheduleIhsg();
    this.scheduleUsd();
    this.scheduleGold();

    // Periodically check if settings intervals have changed in the CMS, and re-apply if necessary
    setInterval(() => {
      this.checkAndReapplyIntervals();
    }, 10000); // Check settings changes every 10 seconds
  }

  private async syncAll() {
    await Promise.all([
      this.service.getLatestRate("ihsg").catch(() => {}),
      this.service.getLatestRate("usd").catch(() => {}),
      this.service.getLatestRate("gold").catch(() => {})
    ]);
  }

  private scheduleIhsg(): void {
    if (this.timerIhsg) clearInterval(this.timerIhsg);
    const settings = this.service.getSettings();
    this.currentIhsgInterval = settings.ihsgInterval || 30;

    this.timerIhsg = setInterval(async () => {
      // console.log(`[MarketScheduler] Job: Syncing IHSG (Interval ${this.currentIhsgInterval}s)`);
      await this.service.getLatestRate("ihsg");
    }, this.currentIhsgInterval * 1000);
  }

  private scheduleUsd(): void {
    if (this.timerUsd) clearInterval(this.timerUsd);
    const settings = this.service.getSettings();
    this.currentUsdInterval = settings.usdInterval || 60;

    this.timerUsd = setInterval(async () => {
      // console.log(`[MarketScheduler] Job: Syncing USD/IDR (Interval ${this.currentUsdInterval}s)`);
      await this.service.getLatestRate("usd");
    }, this.currentUsdInterval * 1000);
  }

  private scheduleGold(): void {
    if (this.timerGold) clearInterval(this.timerGold);
    const settings = this.service.getSettings();
    this.currentGoldInterval = settings.goldInterval || 60;

    this.timerGold = setInterval(async () => {
      // console.log(`[MarketScheduler] Job: Syncing Gold (Interval ${this.currentGoldInterval}s)`);
      await this.service.getLatestRate("gold");
    }, this.currentGoldInterval * 1000);
  }

  private checkAndReapplyIntervals(): void {
    const settings = this.service.getSettings();
    
    if (settings.ihsgInterval !== this.currentIhsgInterval) {
      console.log(`[MarketScheduler] Re-scheduling IHSG to new interval: ${settings.ihsgInterval}s`);
      this.scheduleIhsg();
    }
    if (settings.usdInterval !== this.currentUsdInterval) {
      console.log(`[MarketScheduler] Re-scheduling USD to new interval: ${settings.usdInterval}s`);
      this.scheduleUsd();
    }
    if (settings.goldInterval !== this.currentGoldInterval) {
      console.log(`[MarketScheduler] Re-scheduling Gold to new interval: ${settings.goldInterval}s`);
      this.scheduleGold();
    }
  }

  public stop(): void {
    if (this.timerIhsg) clearInterval(this.timerIhsg);
    if (this.timerUsd) clearInterval(this.timerUsd);
    if (this.timerGold) clearInterval(this.timerGold);
    console.log("[MarketScheduler] Background scheduler stopped.");
  }
}
