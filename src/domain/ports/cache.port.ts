// src/domain/ports/cache.port.ts
export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;

  // Opcional: métodos síncronos para cache en memoria
  getSync?<T>(key: string): T | null;
  setSync?<T>(key: string, value: T, ttl?: number): void;
  deleteSync?(key: string): void;
}
