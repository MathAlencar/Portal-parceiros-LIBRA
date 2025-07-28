import React from 'react';
import Select from 'react-select';

interface SelectInputProps {
  options: { Id: number | string; Name: string }[];
  value?: string | number;
  onChange?: (option: any) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  tooltip?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  tooltip,
}) => {
  // Transforma as opções para o formato do react-select
  const selectOptions = options.map(opt => ({ value: String(opt.Id), label: opt.Name }));
  const selectedOption = selectOptions.find(opt => String(opt.value) === String(value));

  return (
    <div className="flex flex-col w-full">
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-blue-900">{label}</label>
          {tooltip && (
            <div className="relative group">
              <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
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