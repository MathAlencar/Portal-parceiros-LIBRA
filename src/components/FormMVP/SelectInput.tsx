import React from 'react';
import Select from 'react-select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
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
          option: (provided, state) => ({
            ...provided,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            maxWidth: 400, // Aumenta a largura máxima para melhor leitura
            backgroundColor: state.isFocused ? '#4B5563' : '#6B7280', // Cinza escuro quando focado, cinza médio quando normal
            color: 'white', // Letras brancas
            '&:hover': {
              backgroundColor: '#4B5563', // Cinza escuro no hover
              color: 'white',
            },
          }),
          menuList: (provided) => ({
            ...provided,
            backgroundColor: '#6B7280', // Fundo cinza para toda a lista
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