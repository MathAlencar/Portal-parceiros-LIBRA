import { useEffect, useState } from 'react';

export interface PloomesOption {
  Id: number;
  Name: string;
  TableId?: number;
}

interface CachedOptions {
  options: PloomesOption[];
  timestamp: number;
  tableId: number;
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 semana em millisegundos
const CACHE_PREFIX = 'ploomes_options_';

const getCacheKey = (tableId: number): string => {
  return `${CACHE_PREFIX}${tableId}`;
};

const getCachedOptions = (tableId: number): PloomesOption[] | null => {
  try {
    const cacheKey = getCacheKey(tableId);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const parsed: CachedOptions = JSON.parse(cached);
    const now = Date.now();
    
    // Verifica se o cache ainda é válido (não expirou)
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Verifica se o tableId corresponde
    if (parsed.tableId !== tableId) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return parsed.options;
  } catch (error) {
    console.error('[usePloomesOptions] Erro ao ler cache:', error);
    return null;
  }
};

const setCachedOptions = (tableId: number, options: PloomesOption[]): void => {
  try {
    const cacheKey = getCacheKey(tableId);
    const cacheData: CachedOptions = {
      options,
      timestamp: Date.now(),
      tableId
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('[usePloomesOptions] Erro ao salvar cache:', error);
  }
};

// Função para limpar cache expirado
export const clearExpiredCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedOptions = JSON.parse(cached);
            if (now - parsed.timestamp > CACHE_DURATION) {
              localStorage.removeItem(key);
              console.log(`[usePloomesOptions] Cache expirado removido: ${key}`);
            }
          }
        } catch (error) {
          // Se não conseguir parsear, remove o item corrompido
          localStorage.removeItem(key);
          console.log(`[usePloomesOptions] Cache corrompido removido: ${key}`);
        }
      }
    });
  } catch (error) {
    console.error('[usePloomesOptions] Erro ao limpar cache expirado:', error);
  }
};

// Função para limpar todo o cache do Ploomes
export const clearAllPloomesCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
        console.log(`[usePloomesOptions] Cache removido: ${key}`);
      }
    });
    
    console.log('[usePloomesOptions] Todo o cache do Ploomes foi limpo');
  } catch (error) {
    console.error('[usePloomesOptions] Erro ao limpar todo o cache:', error);
  }
};

// Função para obter informações do cache
export const getCacheInfo = (): { total: number; expired: number; valid: number } => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let total = 0;
    let expired = 0;
    let valid = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        total++;
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedOptions = JSON.parse(cached);
            if (now - parsed.timestamp > CACHE_DURATION) {
              expired++;
            } else {
              valid++;
            }
          }
        } catch (error) {
          expired++;
        }
      }
    });
    
    return { total, expired, valid };
  } catch (error) {
    console.error('[usePloomesOptions] Erro ao obter informações do cache:', error);
    return { total: 0, expired: 0, valid: 0 };
  }
};

export function usePloomesOptions(tableId?: number) {
  const [options, setOptions] = useState<PloomesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      if (!tableId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // Primeiro, tenta buscar do cache
      const cachedOptions = getCachedOptions(tableId);
      
      if (cachedOptions) {
        console.log(`[usePloomesOptions] Usando cache para tableId ${tableId}`);
        setOptions(cachedOptions);
        setLoading(false);
        return;
      }
      
      // Se não há cache válido, faz a requisição
      try {
        console.log(`[usePloomesOptions] Fazendo requisição para tableId ${tableId}`);
        const response = await fetch(`http://localhost:3063/ploomes/${tableId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let opts = data.value || [];
        
        // Salva no cache
        setCachedOptions(tableId, opts);
        
        setOptions(opts);
        
      } catch (err) {
        console.error(`[usePloomesOptions] Erro ao buscar opções para tableId ${tableId}:`, err);
        setError(`Erro ao buscar opções do CRM: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOptions();
  }, [tableId]);

  return { options, loading, error };
} 