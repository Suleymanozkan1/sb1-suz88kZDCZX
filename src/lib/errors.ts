/**
 * Yapılandırma hataları.
 *
 * Eksik bir ortam değişkeni kendini her zaman ilgisiz bir hata olarak
 * gösterir: parola doğruyken "parola hatalı", dosya geçerliyken "yüklenemedi".
 * Bu sınıf o durumu normal çalışma hatalarından ayırır; API uçları bunu
 * yakalayıp 503 ve okunabilir bir açıklama döndürür.
 */
export class ConfigError extends Error {
  readonly isConfigError = true;

  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function isConfigError(error: unknown): error is ConfigError {
  return error instanceof Error && (error as ConfigError).isConfigError === true;
}
