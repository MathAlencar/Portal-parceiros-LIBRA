import React, { useState, useEffect, Fragment } from 'react';
import { usePloomesOptions, PloomesOption } from '@/hooks/usePloomesOptions';
import { SelectInput } from '@/components/FormMVP/SelectInput';
import { InputText } from '@/components/FormInputs/InputText';

const LOCAL_STORAGE_KEY = 'ploomes_selected_tomadores';
const TOMADORES_STORAGE_KEY = 'ploomes_tomadores_dados';
const etapas = ['Tomadores', 'Empréstimo', 'Garantia'];

const initialTomador = {
  nome: '',
  cpf: '',
  cnpj: '',
  telefone: '',
  endereco: '',
  juros: '',
  money: '',
  cep: '',
  data: '',
};

const Formulario: React.FC = () => {
  const [etapa, setEtapa] = useState(0);
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [quantidadeId, setQuantidadeId] = useState<number | null>(null);
  const [tomadores, setTomadores] = useState(
    Array(4).fill(null).map(() => ({ ...initialTomador }))
  );

  const { options, loading, error } = usePloomesOptions(31829);

  useEffect(() => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedQtd) {
      try {
        const { Id, Name } = JSON.parse(savedQtd);
        setQuantidade(Name ? Number(Name) : null);
        setQuantidadeId(Id ?? null);
      } catch {}
    }
    const savedTomadores = localStorage.getItem(TOMADORES_STORAGE_KEY);
    if (savedTomadores) {
      try {
        const parsed = JSON.parse(savedTomadores);
        if (Array.isArray(parsed) && parsed.length === 4) setTomadores(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TOMADORES_STORAGE_KEY, JSON.stringify(tomadores));
  }, [tomadores]);

  const handleSelect = (opt: PloomesOption) => {
    setQuantidade(Number(opt.Name));
    setQuantidadeId(opt.Id);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ Id: opt.Id, Name: opt.Name })
    );
  };

  const handleContinuar = () => {
    if (etapa === 0 && quantidade) setEtapa(1);
    else if (etapa > 0 && etapa < (quantidade || 0)) setEtapa(etapa + 1);
  };

  const handleVoltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
    else if (etapa === 1) setEtapa(0);
  };

  const updateTomador = (
    idx: number,
    campo: keyof typeof initialTomador,
    valor: string
  ) => {
    setTomadores(prev => {
      const novo = [...prev];
      novo[idx] = { ...novo[idx], [campo]: valor };
      localStorage.setItem(TOMADORES_STORAGE_KEY, JSON.stringify(novo));
      return novo;
    });
  };

  // Função para exibir informações do localStorage
  const handleDebug = () => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedTomadores = localStorage.getItem(TOMADORES_STORAGE_KEY);
    let qtd = 0;
    if (savedQtd) {
      try {
        const parsed = JSON.parse(savedQtd);
        qtd = parsed.Name ? Number(parsed.Name) : 0;
      } catch {}
    }
    if (savedTomadores) {
      try {
        const parsed = JSON.parse(savedTomadores);
        console.log('Quantidade:', qtd);
        console.log('Tomadores:', parsed);
      } catch (err) {
        console.log('Erro ao ler dados dos tomadores:', err);
      }
    } else {
      console.log('Nenhum dado de tomadores salvo.');
    }
  };

  const renderBanner = () => (
    <div className="w-full flex justify-center py-8 bg-gradient-to-r from-purple-100 to-indigo-100">
      <div className="flex items-center max-w-7xl w-full bg-white rounded-3xl shadow-xl p-6 space-x-6">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl">
          <img src="https://www.libracredito.com.br/images/site/logo-libra-credito.png"></img>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Cadastro de Proposta
          </h1>
          <p className="mt-1 text-gray-600">
            Preencha os dados em cada etapa para prosseguir com a proposta.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <aside className="w-64 bg-white rounded-2xl shadow-lg p-6 space-y-8">
      <nav className="space-y-6">
        {etapas.map((label, idx) => {
          // Lógica para destacar a etapa correta
          let isActive = false;
          if (idx === 0) {
            isActive = etapa > 0 && etapa <= (quantidade || 0);
          } else if (idx === 1) {
            isActive = etapa === (quantidade || 0) + 1;
          } else if (idx === 2) {
            isActive = etapa > (quantidade || 0) + 1;
          }
          // Lógica para habilitar/desabilitar clique
          let isEnabled = false;
          if (idx === 0) {
            isEnabled = etapa > 0 && etapa <= (quantidade || 0);
          } else if (idx === 1) {
            isEnabled = etapa === (quantidade || 0) + 1;
          } else if (idx === 2) {
            isEnabled = etapa > (quantidade || 0) + 1;
          }
          return (
            <Fragment key={idx}>
              <button
                className={`flex items-center space-x-4 w-full text-left focus:outline-none ${!isEnabled ? 'pointer-events-none opacity-60' : ''}`}
                onClick={() => {
                  if (!isEnabled) return;
                  if (idx === 0) setEtapa(1);
                  else if (idx === 1) setEtapa((quantidade || 0) + 1);
                  else if (idx === 2) setEtapa((quantidade || 0) + 2);
                }}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition transform
                    ${isActive
                      ? 'bg-indigo-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  {idx === 0 ? '👤' : idx === 1 ? '💰' : '🏠'}
                </div>
                <span
                  className={`font-medium transition-colors
                    ${isActive ? 'text-gray-800' : 'text-gray-500'}`}
                >
                  {label}
                </span>
              </button>
              {idx < etapas.length - 1 && <hr className="border-gray-200" />}
            </Fragment>
          );
        })}
      </nav>
      <div className="text-sm text-gray-600">
        <h2 className="font-semibold text-gray-800 mb-2">O que é um Tomador?</h2>
        <p>
          Pessoa física ou jurídica que solicita o crédito, com dados pessoais,
          endereço e informações financeiras para análise.
        </p>
      </div>
    </aside>
  );

  // Estado de loading para seleção de quantidade de tomadores
  const [showQtdLoading, setShowQtdLoading] = useState(true);
  useEffect(() => {
    if (etapa === 0) {
      setShowQtdLoading(true);
      const timer = setTimeout(() => setShowQtdLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  // Renderização da etapa de seleção de quantidade
  const renderSelecaoQuantidade = () => {
    if (showQtdLoading) {
      return <LoadingStep msg="Carregando opções de quantidade de tomadores..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-9xl space-y-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Quantidade de Tomadores
        </h2>
        <div>
          {loading && <p className="text-gray-500">Carregando opções...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <SelectInput
              options={options.filter(o => o.Name !== '0')}
              value={quantidadeId ?? undefined}
              onChange={handleSelect}
            />
          )}
        </div>
        <button
          className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50"
          onClick={handleContinuar}
          disabled={!quantidade}
        >
          Continuar
        </button>
      </section>
    );
  };

  // Estado de loading para transição entre etapas
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    if (etapa > 0) {
      setShowLoading(true);
      const timer = setTimeout(() => setShowLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [etapa]);

  // Componente de loading
  const LoadingStep = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center justify-center h-96">
      <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-indigo-700 text-sm font-medium">{msg}</span>
    </div>
  );

  // Renderização do formulário de cada tomador
  const renderCadastroTomador = () => {
    const idx = etapa - 1;
    const tomador = tomadores[idx];
    if (showLoading) {
      return <LoadingStep msg={`Agora iremos cadastrar o Tomador ${etapa}...`} />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-9xl space-y-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Cadastro do Tomador {etapa} de {quantidade}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {(
            [
              ['nome', 'Nome'],
              ['cpf', 'CPF'],
              ['cnpj', 'CNPJ'],
              ['telefone', 'Telefone'],
              ['endereco', 'Endereço'],
              ['juros', 'Juros'],
              ['money', 'Valor'],
              ['cep', 'CEP'],
              ['data', 'Data'],
            ] as const
          ).map(([campo, label]) => (
            <InputText
              key={campo}
              inputName={label}
              termo={tomador[campo]}
              onSetName={v => updateTomador(idx, campo, v)}
              placeholder={`Digite ${label.toLowerCase()}`}
              typeInput={campo === 'cpf' ? 'Cpf' : campo === 'cnpj' ? 'Cnpj' : 
                campo === 'cep' ? 'Cep' : campo === 'data' ? 'Data' : 'Text'}
            />
          ))}
        </div>
        <div className="flex justify-between space-x-4 w-full">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 \
              hover:bg-gray-300 transition transform hover:scale-105"
            onClick={handleVoltar}
          >
            Voltar
          </button>
          <button
            className={`flex-1 py-2 font-medium rounded-full transition transform hover:scale-105 \
              ${etapa < (quantidade || 0)
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-green-600 text-white hover:bg-green-700'}`}
            onClick={() => {
              if (etapa < (quantidade || 0)) handleContinuar();
              else setEtapa((quantidade || 0) + 1); // Avança para empréstimo
            }}
          >
            {etapa < (quantidade || 0) ? 'Próximo' : 'Avançar para Empréstimo'}
          </button>
        </div>
      </section>
    );
  };

  // Renderização da etapa de empréstimo (formulário vazio)
  const renderEmprestimo = () => {
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar o Empréstimo..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Empréstimo</h2>
        <div className="w-full h-40 flex items-center justify-center border-2 border-dashed border-indigo-200 rounded-lg">
          <span className="text-gray-400">Formulário de Empréstimo (vazio)</span>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => setEtapa(quantidade || 1)}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 ml-4"
            onClick={() => setEtapa((quantidade || 0) + 2)}
          >
            Próximo
          </button>
        </div>
      </section>
    );
  };

  // Renderização da etapa de garantia (formulário vazio)
  const renderGarantia = () => {
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar a Garantia..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Garantia</h2>
        <div className="w-full h-40 flex items-center justify-center border-2 border-dashed border-green-200 rounded-lg">
          <span className="text-gray-400">Formulário de Garantia (vazio)</span>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => setEtapa((quantidade || 0) + 1)}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-green-600 text-white hover:bg-green-700 transition transform hover:scale-105 ml-4"
            onClick={() => alert('Fluxo finalizado!')}
          >
            Finalizar
          </button>
        </div>
      </section>
    );
  };

  // Ajustar renderização principal para incluir etapa de garantia
  return (
    <>
      {renderBanner()}
      <main className="min-h-screen bg-gradient-to-r from-purple-100 to-indigo-100 flex items-start justify-center py-16">
        <div className="flex space-x-12 max-w-7xl w-full px-4">
          {renderSidebar()}
          <div className="flex-1 flex flex-col items-center">
            {etapa === 0
              ? renderSelecaoQuantidade()
              : etapa > 0 && etapa <= (quantidade || 0)
                ? renderCadastroTomador()
                : etapa === (quantidade || 0) + 1
                  ? renderEmprestimo()
                  : etapa === (quantidade || 0) + 2
                    ? renderGarantia()
                    : null}
          </div>
        </div>
        {/* Botão de debug fixo no canto inferior direito */}
        <button
          onClick={handleDebug}
          className="fixed bottom-6 right-6 bg-blue-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition z-50 font-bold text-lg tracking-wide"
        >
          Debug
        </button>
      </main>
    </>
  );
};

export default Formulario;
