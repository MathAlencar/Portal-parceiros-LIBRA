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
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3063/ploomes/${tableId}`);
        const data = await response.json();
        let opts = data.value || [];
        if (tableId) {
          opts = opts.filter((opt: any) => opt.TableId === tableId);
        }
        setOptions(opts);
      } catch (err) {
        setError('Erro ao buscar opções do CRM');
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [tableId]);

  return { options, loading, error };
} 