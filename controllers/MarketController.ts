import { Request, Response } from "express";
import { MarketDataService } from "../services/MarketDataService";

export class MarketController {
  private service: MarketDataService;

  constructor(service: MarketDataService) {
    this.service = service;
  }

  public getLiveRates = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = this.service.getSettings();
      if (!settings.enabled) {
        res.status(403).json({ success: false, error: "Market Widget is disabled" });
        return;
      }

      // Fetch rates from service
      const [ihsgRate, usdRate, goldRate] = await Promise.all([
        settings.displayMarkets.includes("ihsg") ? this.service.getLatestRate("ihsg") : Promise.resolve(null),
        settings.displayMarkets.includes("usd") ? this.service.getLatestRate("usd") : Promise.resolve(null),
        settings.displayMarkets.includes("gold") ? this.service.getLatestRate("gold") : Promise.resolve(null)
      ]);

      const response: Record<string, any> = {};

      if (settings.displayMarkets.includes("ihsg")) {
        response.ihsg = ihsgRate ? {
          price: ihsgRate.price,
          change: ihsgRate.change,
          status: ihsgRate.status,
          updated_at: ihsgRate.updated_at
        } : {
          price: null,
          change: null,
          status: "stable",
          updated_at: null,
          error: "Data sementara tidak tersedia"
        };
      }

      if (settings.displayMarkets.includes("usd")) {
        response.usd = usdRate ? {
          price: usdRate.price,
          change: usdRate.change,
          status: usdRate.status,
          updated_at: usdRate.updated_at
        } : {
          price: null,
          change: null,
          status: "stable",
          updated_at: null,
          error: "Data sementara tidak tersedia"
        };
      }

      if (settings.displayMarkets.includes("gold")) {
        response.gold = goldRate ? {
          price: goldRate.price,
          buybackPrice: goldRate.buybackPrice,
          change: goldRate.change,
          status: goldRate.status,
          updated_at: goldRate.updated_at
        } : {
          price: null,
          buybackPrice: null,
          change: null,
          status: "stable",
          updated_at: null,
          error: "Data sementara tidak tersedia"
        };
      }

      res.json(response);
    } catch (error) {
      console.error("[MarketController] Error in getLiveRates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = this.service.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  };

  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const newSettings = req.body;
      this.service.saveSettings(newSettings);
      res.json({ success: true, settings: this.service.getSettings() });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  };

  public getErrorLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = this.service.getErrorLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to load error logs" });
    }
  };

  public getUpdates = async (req: Request, res: Response): Promise<void> => {
    try {
      const updates = this.service.getLastUpdateTimestamps();
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: "Failed to load updates" });
    }
  };
}
