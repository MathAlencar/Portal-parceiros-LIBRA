import { useEffect, useState } from 'react';

export interface PloomesOption {
  Id: number;
  Name: string;
  TableId?: number;
}

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
      
      try {
        const response = await fetch(`http://localhost:3063/ploomes/${tableId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        let opts = data.value || [];
        
        // A API já retorna apenas as opções para o tableId específico
        // Não precisamos filtrar novamente
        
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