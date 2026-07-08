import { IMarketProvider, MarketRate } from "../providers/IMarketProvider";
import { CacheService } from "../cache/CacheService";
import fs from "fs";
import path from "path";

export interface MarketWidgetSettings {
  enabled: boolean;
  ihsgProvider: string;
  usdProvider: string;
  goldProvider: string;
  ihsgInterval: number; // in seconds
  usdInterval: number; // in seconds
  goldInterval: number; // in seconds
  displayMarkets: string[]; // ["ihsg", "usd", "gold"]
}

export interface ProviderErrorLog {
  timestamp: string;
  provider: string;
  error: string;
}

export class MarketDataService {
  private cache: CacheService;
  private providers: Map<string, IMarketProvider> = new Map();
  private dbPath: string;

  constructor(
    cache: CacheService,
    providersList: IMarketProvider[]
  ) {
    this.cache = cache;
    providersList.forEach(p => this.providers.set(p.name, p));
    this.dbPath = path.join(process.cwd(), "data", "db.json");
    this.ensureDefaultConfig();
  }

  private ensureDefaultConfig() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, "utf8");
        const db = JSON.parse(fileContent);
        let changed = false;

        if (!db.marketSettings) {
          db.marketSettings = {
            enabled: true,
            ihsgProvider: "Yahoo Finance (IHSG)",
            usdProvider: "Yahoo Finance (USD/IDR)",
            goldProvider: "Logam Mulia (Calculated Spot)",
            ihsgInterval: 30,
            usdInterval: 60,
            goldInterval: 60,
            displayMarkets: ["ihsg", "usd", "gold"]
          };
          changed = true;
        }

        if (!db.marketErrorLogs) {
          db.marketErrorLogs = [];
          changed = true;
        }

        if (!db.marketLastUpdate) {
          db.marketLastUpdate = {
            ihsg: "",
            usd: "",
            gold: ""
          };
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf8");
        }
      }
    } catch (error) {
      console.error("[MarketDataService] Failed to initialize default config in db.json:", error);
    }
  }

  public getSettings(): MarketWidgetSettings {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        if (db.marketSettings) {
          return db.marketSettings;
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      enabled: true,
      ihsgProvider: "Yahoo Finance (IHSG)",
      usdProvider: "Yahoo Finance (USD/IDR)",
      goldProvider: "Logam Mulia (Calculated Spot)",
      ihsgInterval: 30,
      usdInterval: 60,
      goldInterval: 60,
      displayMarkets: ["ihsg", "usd", "gold"]
    };
  }

  public saveSettings(settings: Partial<MarketWidgetSettings>): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        db.marketSettings = { ...db.marketSettings, ...settings };
        fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (e) {
      console.error("[MarketDataService] Failed to save settings:", e);
    }
  }

  public getErrorLogs(): ProviderErrorLog[] {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        return db.marketErrorLogs || [];
      }
    } catch (e) {
      // ignore
    }
    return [];
  }

  public logProviderError(provider: string, errorMsg: string): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        if (!db.marketErrorLogs) db.marketErrorLogs = [];
        db.marketErrorLogs.unshift({
          timestamp: new Date().toISOString(),
          provider,
          error: errorMsg
        });
        // Limit error logs to last 50 entries
        db.marketErrorLogs = db.marketErrorLogs.slice(0, 50);
        fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (e) {
      console.error("[MarketDataService] Failed to log provider error:", e);
    }
  }

  public getLastUpdateTimestamps(): Record<string, string> {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        return db.marketLastUpdate || { ihsg: "", usd: "", gold: "" };
      }
    } catch (e) {
      // ignore
    }
    return { ihsg: "", usd: "", gold: "" };
  }

  private setLastUpdateTimestamp(market: string, timestamp: string): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        if (!db.marketLastUpdate) db.marketLastUpdate = {};
        db.marketLastUpdate[market] = timestamp;
        fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Main service call to retrieve the latest rate for a specific index/market type
   */
  public async getLatestRate(marketType: "ihsg" | "usd" | "gold"): Promise<MarketRate | null> {
    const settings = this.getSettings();
    if (!settings.enabled) {
      return null;
    }

    // Determine configured provider
    let providerName = "";
    if (marketType === "ihsg") providerName = settings.ihsgProvider;
    else if (marketType === "usd") providerName = settings.usdProvider;
    else if (marketType === "gold") providerName = settings.goldProvider;

    // Check cache first
    const cacheKey = `market_rate_${marketType}`;
    const cached = await this.cache.get<MarketRate>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try fetching from configured provider
    let provider = this.providers.get(providerName);
    if (!provider) {
      // Fallback if not found
      const fallbackName = this.getFallbackProviderName(marketType);
      provider = this.providers.get(fallbackName);
    }

    if (provider) {
      try {
        const rate = await provider.fetchRate();
        if (rate) {
          // Cache the fetched rate. Set TTL according to CMS settings
          let ttl = 30;
          if (marketType === "ihsg") ttl = settings.ihsgInterval;
          else if (marketType === "usd") ttl = settings.usdInterval;
          else if (marketType === "gold") ttl = settings.goldInterval;

          await this.cache.set(cacheKey, rate, ttl);
          this.setLastUpdateTimestamp(marketType, rate.updated_at);
          return rate;
        } else {
          throw new Error("Provider returned null rate");
        }
      } catch (error: any) {
        this.logProviderError(provider.name, error?.message || String(error));
        
        // Error handling requirement: If provider fails, use the last cached value (even if expired)
        console.warn(`[MarketDataService] ${providerName} failed. Checking database fallback...`);
        const expiredDbCache = await this.getExpiredCacheFallback(marketType);
        if (expiredDbCache) {
          return expiredDbCache;
        }
      }
    }

    // If still failing, try reserve provider directly
    const reserveName = this.getReserveProviderName(marketType);
    const reserveProvider = this.providers.get(reserveName);
    if (reserveProvider) {
      try {
        const rate = await reserveProvider.fetchRate();
        if (rate) {
          await this.cache.set(cacheKey, rate, 30);
          this.setLastUpdateTimestamp(marketType, rate.updated_at);
          return rate;
        }
      } catch (e: any) {
        this.logProviderError(reserveProvider.name, `Reserve failed: ${e?.message}`);
      }
    }

    return null;
  }

  private getFallbackProviderName(marketType: "ihsg" | "usd" | "gold"): string {
    if (marketType === "ihsg") return "Yahoo Finance (IHSG)";
    if (marketType === "usd") return "Yahoo Finance (USD/IDR)";
    return "Logam Mulia (Calculated Spot)";
  }

  private getReserveProviderName(marketType: "ihsg" | "usd" | "gold"): string {
    if (marketType === "ihsg") return "Reserve IDX Provider";
    if (marketType === "usd") return "Reserve Currency Provider";
    return "Reserve Gold Provider";
  }

  /**
   * Fetch even an expired cache from the database/memory as a reliable safety net
   */
  private async getExpiredCacheFallback(marketType: "ihsg" | "usd" | "gold"): Promise<MarketRate | null> {
    try {
      if (fs.existsSync(this.dbPath)) {
        const db = JSON.parse(fs.readFileSync(this.dbPath, "utf8"));
        const cacheKey = `market_rate_${marketType}`;
        const cachedItem = db.marketCache?.[cacheKey];
        if (cachedItem && cachedItem.value) {
          return cachedItem.value as MarketRate;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }
}
