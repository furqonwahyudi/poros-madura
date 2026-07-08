import fs from "fs";
import path from "path";

export interface CacheItem<T = any> {
  value: T;
  expireAt: number; // timestamp in milliseconds
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem> = new Map();
  private dbPath: string;

  private constructor() {
    this.dbPath = path.join(process.cwd(), "data", "db.json");
    this.loadFromDatabase();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private loadFromDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, "utf8");
        if (fileContent.trim()) {
          const db = JSON.parse(fileContent);
          if (db.marketCache) {
            const now = Date.now();
            Object.keys(db.marketCache).forEach(key => {
              const item = db.marketCache[key] as CacheItem;
              if (item.expireAt > now) {
                this.memoryCache.set(key, item);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("[CacheService] Failed to load cache from database:", error);
    }
  }

  /**
   * Persist cache keys into the Database file
   */
  private saveToDatabase() {
    try {
      let db: any = {};
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, "utf8");
        if (fileContent.trim()) {
          db = JSON.parse(fileContent);
        }
      }
      
      // Build marketCache object
      const cacheObj: Record<string, CacheItem> = {};
      this.memoryCache.forEach((item, key) => {
        cacheObj[key] = item;
      });

      db.marketCache = cacheObj;
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (error) {
      console.error("[CacheService] Failed to save cache to database:", error);
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expireAt) {
      this.memoryCache.delete(key);
      this.saveToDatabase();
      return null;
    }

    return item.value as T;
  }

  public async set<T = any>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expireAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expireAt });
    this.saveToDatabase();
  }

  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    this.saveToDatabase();
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
    this.saveToDatabase();
  }
}
