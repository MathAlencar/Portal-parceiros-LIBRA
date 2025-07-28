import React from 'react';
import Select from 'react-select';

interface SelectInputProps {
  options: { Id: number | string; Name: string }[];
  value?: string | number;
  onChange?: (option: any) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
}) => {
  // Transforma as opções para o formato do react-select
  const selectOptions = options.map(opt => ({ value: String(opt.Id), label: opt.Name }));
  const selectedOption = selectOptions.find(opt => String(opt.value) === String(value));

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-1 text-sm font-medium text-blue-900">{label}</label>
      )}
      <Select
        options={selectOptions}
        value={selectedOption || null}
        onChange={selected => {
          if (selected && onChange) {
            onChange({ Id: selected.value, Name: selected.label });
          } else if (onChange) {
            onChange({ Id: '', Name: '' });
          }
        }}
        placeholder={placeholder || 'Selecione uma opção'}
        styles={{
          menu: (provided) => ({
            ...provided,
            maxHeight: 1050,
            minWidth: '100%', // Garante que o menu tenha pelo menos a largura do select
          }),
          option: (provided) => ({
            ...provided,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            maxWidth: 400, // Aumenta a largura máxima para melhor leitura
          }),
        }}
        isClearable
      />
      {error && (
        <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
}; 