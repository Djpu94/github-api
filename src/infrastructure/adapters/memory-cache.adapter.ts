import { Injectable, Logger } from '@nestjs/common';
import { CachePort } from '../../domain/ports/cache.port';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class MemoryCacheAdapter implements CachePort {
  private readonly logger = new Logger(MemoryCacheAdapter.name);
  private readonly cache = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | null> {
    return Promise.resolve(this.getSync<T>(key));
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    this.setSync<T>(key, value, ttl);
    return Promise.resolve();
  }

  async delete(key: string): Promise<void> {
    this.deleteSync(key);
    return Promise.resolve();
  }

  // Implementaciones síncronas para uso interno
  getSync<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`Entrada encontrada en caché para la clave: ${key}`);
    return item.value as T;
  }

  setSync<T>(key: string, value: T, ttl: number = 300): void {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiresAt });
    this.logger.debug(`Caché asignado a la clave: ${key} with TTL: ${ttl}s`);
  }

  deleteSync(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Caché borrado para la clave: ${key}`);
  }

  // Método para limpieza periódica
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Limpieza de ${cleaned} entradas de caché vencidas`);
    }
  }

  /**
   * Obtiene estadísticas del cache (útil para monitoring)
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  } {
    const now = Date.now();
    let expiredEntries = 0;
    let validEntries = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries,
      validEntries,
    };
  }
}
