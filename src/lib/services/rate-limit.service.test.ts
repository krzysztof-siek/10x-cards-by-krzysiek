import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let rateLimitService: RateLimitService;

  beforeEach(() => {
    vi.useFakeTimers();
    // Tworzymy nową instancję serwisu przed każdym testem
    rateLimitService = new RateLimitService({
      windowMs: 10 * 60 * 1000, // 10 minut
      maxRequests: 3 // Mała liczba dla ułatwienia testowania
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should allow requests within the limit', async () => {
    const userId = 'test-user-1';
    
    // Pierwszy request
    const result1 = await rateLimitService.checkRateLimit(userId);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);
    
    // Drugi request
    const result2 = await rateLimitService.checkRateLimit(userId);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
    
    // Trzeci request (ostatni dozwolony)
    const result3 = await rateLimitService.checkRateLimit(userId);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests over the limit', async () => {
    const userId = 'test-user-2';
    
    // Wykorzystanie całego limitu
    await rateLimitService.checkRateLimit(userId);
    await rateLimitService.checkRateLimit(userId);
    await rateLimitService.checkRateLimit(userId);
    
    // Czwarty request (ponad limit)
    const result = await rateLimitService.checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset the limit after the time window', async () => {
    const userId = 'test-user-3';
    
    // Wykorzystanie całego limitu
    await rateLimitService.checkRateLimit(userId);
    await rateLimitService.checkRateLimit(userId);
    await rateLimitService.checkRateLimit(userId);
    
    // Czwarty request (ponad limit)
    let result = await rateLimitService.checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    
    // Przesunięcie czasu o okno czasowe
    vi.advanceTimersByTime(10 * 60 * 1000 + 1000); // 10 minut + 1 sekunda
    
    // Po upływie okna czasowego, limit powinien zostać zresetowany
    result = await rateLimitService.checkRateLimit(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('should track different users separately', async () => {
    const userId1 = 'test-user-4';
    const userId2 = 'test-user-5';
    
    // Pierwszy użytkownik wykorzystuje cały limit
    await rateLimitService.checkRateLimit(userId1);
    await rateLimitService.checkRateLimit(userId1);
    await rateLimitService.checkRateLimit(userId1);
    
    // Pierwszy użytkownik przekracza limit
    const result1 = await rateLimitService.checkRateLimit(userId1);
    expect(result1.allowed).toBe(false);
    
    // Drugi użytkownik powinien mieć własny limit
    const result2 = await rateLimitService.checkRateLimit(userId2);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(2);
  });

  it('should automatically clean up old entries', async () => {
    // Dodajemy kilka starych wpisów
    const userId1 = 'old-user-1';
    const userId2 = 'old-user-2';
    
    // Korzystamy z wewnętrznego stanu serwisu
    const store = (rateLimitService as any).store;
    
    // Dodajemy wpisy z czasem resetowania w przeszłości
    const pastTime = Date.now() - 1000; // 1 sekunda temu
    store.set(userId1, { count: 3, resetAt: pastTime });
    store.set(userId2, { count: 2, resetAt: pastTime });
    
    // Sprawdzamy, że wpisy zostały dodane
    expect(store.size).toBe(2);
    
    // Wywołujemy cleanup
    (rateLimitService as any).cleanup();
    
    // Sprawdzamy, że stare wpisy zostały usunięte
    expect(store.size).toBe(0);
  });

  it('should handle concurrent requests correctly', async () => {
    const userId = 'concurrent-user';
    
    // Symulacja wielu jednoczesnych żądań
    const results = await Promise.all([
      rateLimitService.checkRateLimit(userId),
      rateLimitService.checkRateLimit(userId),
      rateLimitService.checkRateLimit(userId),
      rateLimitService.checkRateLimit(userId),
      rateLimitService.checkRateLimit(userId)
    ]);
    
    // Sprawdzenie wyników
    // Pierwsze 3 powinny być dozwolone, reszta nie
    expect(results[0].allowed).toBe(true);
    expect(results[1].allowed).toBe(true);
    expect(results[2].allowed).toBe(true);
    expect(results[3].allowed).toBe(false);
    expect(results[4].allowed).toBe(false);
    
    // Sprawdzenie remaining
    expect(results[0].remaining).toBe(2);
    expect(results[1].remaining).toBe(1);
    expect(results[2].remaining).toBe(0);
    expect(results[3].remaining).toBe(0);
    expect(results[4].remaining).toBe(0);
  });
}); 