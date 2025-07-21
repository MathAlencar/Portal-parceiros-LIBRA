import React from 'react';
import { PloomesOption } from '@/hooks/usePloomesOptions';

interface SelectInputProps {
  options: PloomesOption[];
  onChange?: (option: PloomesOption) => void;
  value?: number | null;
}

const LOCAL_STORAGE_KEY = 'ploomes_selected_option';

export const SelectInput: React.FC<SelectInputProps> = ({ options, onChange, value }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedOption = options.find(opt => opt.Id === selectedId);
    if (selectedOption) {
      // Salva no localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        Id: selectedOption.Id,
        Name: selectedOption.Name
      }));
      if (onChange) onChange(selectedOption);
    }
  };

  return (
    <select className="border rounded px-3 py-2" value={value ?? ''} onChange={handleChange}>
      <option value="">Selecione uma opção</option>
      {options.map(opt => (
        <option key={opt.Id} value={opt.Id}>{opt.Name}</option>
      ))}
    </select>
  );
}; 