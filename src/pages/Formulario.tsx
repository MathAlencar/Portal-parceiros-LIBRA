import React, { useState, useEffect, Fragment } from 'react';
import { usePloomesOptions, clearExpiredCache, clearAllPloomesCache, getCacheInfo } from '@/hooks/usePloomesOptions';
import { TOMADORES_OPTIONS_IDS, QUANTIDADE_GARANTIDORES_OPTIONS_ID, GARANTIDORES_OPTIONS_IDS } from '@/hooks/ploomesOptionsIds';
import { SelectInput } from '@/components/FormMVP/SelectInput';
import { InputText } from '@/components/FormInputs/InputText';
import { QUANTIDADE_TOMADORES_OPTIONS_ID } from '@/hooks/ploomesOptionsIds';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


// Funções de validação
const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  
  return cpfLimpo.charAt(9) === digito1.toString() && cpfLimpo.charAt(10) === digito2.toString();
};

const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  
  return cnpjLimpo.charAt(12) === digito1.toString() && cnpjLimpo.charAt(13) === digito2.toString();
};

const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validarTelefone = (telefone: string): boolean => {
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
};

const validarDataNascimento = (dataNascimento: string): boolean => {
  if (!dataNascimento) return false;
  
  const data = new Date(dataNascimento);
  const hoje = new Date();
  const idade = hoje.getFullYear() - data.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = data.getMonth();
  
  // Ajustar idade se ainda não fez aniversário este ano
  let idadeAjustada = idade;
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < data.getDate())) {
    idadeAjustada = idade - 1;
  }
  
  // Verificar se a idade está entre 18 e 80 anos
  return idadeAjustada >= 18 && idadeAjustada <= 80;
};

const validarCEP = (cep: string): boolean => {
  if (!cep) return false;
  // Remove caracteres não numéricos
  const cepNumeros = cep.replace(/\D/g, '');
  // Verifica se tem exatamente 8 dígitos
  return cepNumeros.length === 8;
};

const validarMinimoCaracteres = (valor: string, minimo: number = 3): boolean => {
  if (!valor) return false;
  return valor.trim().length >= minimo;
};

const validarCampoVazio = (valor: string): boolean => {
  return valor && valor.trim() !== '' && valor !== 'Selecione uma opção' && valor !== 'Digite o nome' && valor !== 'Digite o email' && valor !== 'Digite o telefone' && valor !== 'Digite o CEP' && valor !== 'Digite o endereço' && valor !== 'Digite a profissão' && valor !== 'Renda formal' && valor !== 'Renda informal' && valor !== 'Renda total';
};

const validarCampoObjeto = (valor: any): boolean => {
  return valor && valor.Id && valor.Id !== '' && valor.Name && valor.Name !== '';
};

const validarCampoMonetario = (valor: string): boolean => {
  return valor && valor.trim() !== '' && valor !== 'Selecione uma opção' && valor !== 'Digite o nome' && valor !== 'Digite o email' && valor !== 'Digite o telefone' && valor !== 'Digite o CEP' && valor !== 'Digite o endereço' && valor !== 'Digite a profissão' && valor !== 'Renda formal' && valor !== 'Renda informal' && valor !== 'Renda total';
};

const validarCampoMonetarioMaiorQueZero = (valor: string): boolean => {
  if (!validarCampoMonetario(valor)) return false;
  
  // Converter o valor monetário para número
  const numero = valor.replace(/[^\d,]/g, '').replace(',', '.');
  const valorNumerico = parseFloat(numero) || 0;
  
  return valorNumerico > 0;
};

const validarValorSolicitado = (valor: string): boolean => {
  if (!validarCampoMonetario(valor)) return false;
  
  // Converter o valor monetário para número
  const numero = valor.replace(/[^\d,]/g, '').replace(',', '.');
  const valorNumerico = parseFloat(numero) || 0;
  
  return valorNumerico >= 75000 && valorNumerico <= 5000000;
};

const validarPrazoSolicitado = (valor: string): boolean => {
  if (!valor) return false;
  const numero = parseInt(valor.replace(/\D/g, ''));
  return numero >= 35 && numero <= 180;
};

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
  dataNascimento: '',
  email: '',
  estadoCivil: { Id: '', Name: '' },
  tipoPessoa: { Id: '', Name: '' },
  qualificacaoProfissional: { Id: '', Name: '' },
  profissao: '',
  rendaFormal: '',
  comprovacaoRendaFormal: { Id: '', Name: '' },
  rendaInformal: '',
  comprovacaoRendaInformal: { Id: '', Name: '' },
  rendaTotalInformada: '',
  quantidadeSociosPJ: { Id: '', Name: '' },
  numeroAdmin: { Id: '', Name: '' },
  ramoPJ: '',
};

const EMPRESTIMO_STORAGE_KEY = 'ploomes_emprestimo_dados';
const initialEmprestimo = {
  amortizacao: { Id: '', Name: '' },
  carencia: { Id: '', Name: '' },
  motivoEmprestimo: { Id: '', Name: '' },
  valorSolicitado: '',
  rendaTotal: '',
  prazoSolicitado: '',
  jurosSolicitado: '',
  parcelaSolicitada: '',
  comentarios: '',
};

const GARANTIA_STORAGE_KEY = 'ploomes_garantia_dados';
const initialGarantia = {
  garantiaPertenceTomador: { Id: '', Name: '' },
  valorGarantia: '',
  cidadeGarantia: { Id: '', Name: '' },
  ruralUrbano: { Id: '', Name: '' },
  enderecoGarantia: '',
  unidadeFederativa: { Id: '', Name: '' },
  situacaoGarantia: undefined,
  comQuemEstaFinanciada: { Id: '', Name: '' },
  valorEmAberto: '',
  quantasParcelasFalta: '',
  escritura: undefined,
  nomeMatrícula: undefined,
  processoInventario: undefined,
  imovelAverbado: undefined,
  possuiUsufruto: undefined,
  dividaCondominio: undefined,
  dividaIPTU: undefined,
  dividaITR: { Id: '', Name: '' },
  utilizacaoGarantia: { Id: '', Name: '' },
  tipoGarantia: { Id: '', Name: '' },
};

// Definições iniciais
const GARANTIDORES_STORAGE_KEY = 'ploomes_garantidores_dados';
const QUANTIDADE_GARANTIDORES_STORAGE_KEY = 'ploomes_selected_garantidores';
const initialGarantidor = {
  estadoCivil: { Id: '', Name: '' },
  nome: '',
  cpf: '',
  cnpj: '',
  profissao: '',
  email: '',
};

const Formulario: React.FC = () => {
  // Limpar cache expirado ao montar o componente
  useEffect(() => {
    console.log('[Formulario] Limpando cache expirado...');
    clearExpiredCache();
    
    // Mostrar informações do cache
    const cacheInfo = getCacheInfo();
    console.log('[Formulario] Status do cache:', cacheInfo);
  }, []);

  // Debug: mostrar dados do localStorage ao montar o componente
  useEffect(() => {
    const savedQtd = localStorage.getItem('ploomes_selected_tomadores');
    const savedTomadores = localStorage.getItem('ploomes_tomadores_dados');
    const savedEmprestimo = localStorage.getItem('ploomes_emprestimo_dados');
    const savedGarantia = localStorage.getItem('ploomes_garantia_dados');
    const savedGarantidores = localStorage.getItem('ploomes_garantidores_dados');
    
    console.log('savedQtd:', savedQtd);
    console.log('savedTomadores:', savedTomadores);
    console.log('savedEmprestimo:', savedEmprestimo);
    console.log('savedGarantia:', savedGarantia);
    console.log('savedGarantidores:', savedGarantidores);

    if (savedQtd) {
      const { Id, Name } = JSON.parse(savedQtd);
      console.log('Quantidade selecionada:', { Id, Name });
    }
    if (savedTomadores) {
      const parsed = JSON.parse(savedTomadores);
      console.log('Tomadores:', parsed);
    }
    if (savedEmprestimo) {
      const parsedEmprestimo = JSON.parse(savedEmprestimo);
      console.log('Emprestimo:', parsedEmprestimo);
    }
    if (savedGarantia) {
      const parsedGarantia = JSON.parse(savedGarantia);
      console.log('Garantia:', parsedGarantia);
    }
    if (savedGarantidores) {
      const parsedGarantidores = JSON.parse(savedGarantidores);
      console.log('Garantidores:', parsedGarantidores);
    }
  }, []);

  const [etapa, setEtapa] = useState(0);
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [quantidadeId, setQuantidadeId] = useState<number | null>(null);
  const [tomadores, setTomadores] = useState(
    Array(4).fill(null).map(() => ({ ...initialTomador }))
  );
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [mostrarErro, setMostrarErro] = useState(false);

  // Estados para controlar o carregamento progressivo
  const [carregarOpcoesTomadores, setCarregarOpcoesTomadores] = useState(false);
  const [carregarOpcoesEmprestimo, setCarregarOpcoesEmprestimo] = useState(false);
  const [carregarOpcoesGarantia, setCarregarOpcoesGarantia] = useState(false);
  const [carregarOpcoesGarantidores, setCarregarOpcoesGarantidores] = useState(false);



  const limparErro = (campo: string) => {
    setErros(prev => {
      const novo = { ...prev };
      delete novo[campo];
      return novo;
    });
  };

  // Função para converter valor monetário para número
  const converterValorMonetario = (valor: string): number => {
    if (!valor || valor === 'R$ 0,00') return 0;
    const numero = valor.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numero) || 0;
  };

  // Função para formatar valor monetário
  const formatarValorMonetario = (valor: number): string => {
    return `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  // Função para calcular renda total
  const calcularRendaTotal = (rendaFormal: string, rendaInformal: string): string => {
    const valorFormal = converterValorMonetario(rendaFormal);
    const valorInformal = converterValorMonetario(rendaInformal);
    const total = valorFormal + valorInformal;
    return formatarValorMonetario(total);
  };

  // Função para atualizar renda total automaticamente
  const atualizarRendaTotal = (idx: number) => {
    const tomador = tomadores[idx];
    if (!tomador) return;

    const rendaFormalNaoSeAplica = tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica';
    const rendaInformalNaoSeAplica = tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica';

    const rendaFormal = rendaFormalNaoSeAplica ? 'R$ 0,00' : tomador.rendaFormal;
    const rendaInformal = rendaInformalNaoSeAplica ? 'R$ 0,00' : tomador.rendaInformal;

    const rendaTotal = calcularRendaTotal(rendaFormal, rendaInformal);

    setTomadores(prev => {
      const novo = [...prev];
      novo[idx] = { 
        ...novo[idx], 
        rendaFormal: rendaFormalNaoSeAplica ? 'R$ 0,00' : novo[idx].rendaFormal,
        rendaInformal: rendaInformalNaoSeAplica ? 'R$ 0,00' : novo[idx].rendaInformal,
        rendaTotalInformada: rendaTotal
      };
      return novo;
    });
  };

  // useEffect para atualizar renda total automaticamente quando os valores mudarem
  useEffect(() => {
    let hasChanges = false;
    const updatedTomadores = tomadores.map((tomador, idx) => {
      if (!tomador) return tomador;
      
      const rendaFormalNaoSeAplica = tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica';
      const rendaInformalNaoSeAplica = tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica';

      // Força o valor para R$ 0,00 quando "Não se aplica" for selecionado
      const rendaFormal = rendaFormalNaoSeAplica ? 'R$ 0,00' : tomador.rendaFormal;
      const rendaInformal = rendaInformalNaoSeAplica ? 'R$ 0,00' : tomador.rendaInformal;

      const rendaTotal = calcularRendaTotal(rendaFormal, rendaInformal);

      // Verifica se precisa atualizar
      const needsUpdate = 
        (rendaFormalNaoSeAplica && tomador.rendaFormal !== 'R$ 0,00') ||
        (rendaInformalNaoSeAplica && tomador.rendaInformal !== 'R$ 0,00') ||
        tomador.rendaTotalInformada !== rendaTotal;

      if (needsUpdate) {
        hasChanges = true;
        return {
          ...tomador,
          rendaFormal: rendaFormal,
          rendaInformal: rendaInformal,
          rendaTotalInformada: rendaTotal
        };
      }
      return tomador;
    });

    if (hasChanges) {
      setTomadores(updatedTomadores);
    }
  }, [tomadores]);

  // Estado dos dados do empréstimo
  const [emprestimo, setEmprestimo] = useState({ ...initialEmprestimo });
  const [errosEmprestimo, setErrosEmprestimo] = useState<{ [key: string]: string }>({});
  const [mostrarErroEmprestimo, setMostrarErroEmprestimo] = useState(false);

  // Estado dos dados da garantia
  const [garantia, setGarantia] = useState({ ...initialGarantia });
  const [errosGarantia, setErrosGarantia] = useState<{ [key: string]: string }>({});
  const [mostrarErroGarantia, setMostrarErroGarantia] = useState(false);

  // Estado dos dados dos garantidores
  const [garantidores, setGarantidores] = useState<typeof initialGarantidor[]>([]);
  const [showGarantidorModal, setShowGarantidorModal] = useState(false);
  const [showQtdGarantidores, setShowQtdGarantidores] = useState(false);
  const [showGarantidores, setShowGarantidores] = useState(false);
  const [qtdGarantidores, setQtdGarantidores] = useState(1);
  const [qtdGarantidoresId, setQtdGarantidoresId] = useState<number | null>(null);
  const [errosGarantidores, setErrosGarantidores] = useState<{ [key: string]: string }>({});
  const [mostrarErroGarantidores, setMostrarErroGarantidores] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [mostrarErroRendaMinima, setMostrarErroRendaMinima] = useState(false);
  const [isEnviando, setIsEnviando] = useState(false);
  const [showModalErroEnvio, setShowModalErroEnvio] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string>('');
  const [showModalLimparDados, setShowModalLimparDados] = useState(false);

  // Hooks com carregamento progressivo
  const { options, loading, error } = usePloomesOptions(QUANTIDADE_TOMADORES_OPTIONS_ID);
  const { options: quantidadeGarantidoresOptions, loading: loadingGarantidores, error: errorGarantidores } = usePloomesOptions(carregarOpcoesGarantidores ? QUANTIDADE_GARANTIDORES_OPTIONS_ID : undefined);
  
  // Hooks de empréstimo - carregam apenas quando necessário
  const amortizacaoOptions = usePloomesOptions(carregarOpcoesEmprestimo ? 44254 : undefined);
  const carenciaOptions = usePloomesOptions(carregarOpcoesEmprestimo ? 46299 : undefined);
  const motivoEmprestimoOptions = usePloomesOptions(carregarOpcoesEmprestimo ? 31247 : undefined);
  
  // Hooks de garantia - carregam apenas quando necessário
  const dividaITROptions = usePloomesOptions(carregarOpcoesGarantia ? 46865 : undefined);
  const pertenceTomadorOptions = usePloomesOptions(carregarOpcoesGarantia ? 31246 : undefined);
  const cidadeGarantiaOptions = usePloomesOptions(carregarOpcoesGarantia ? 31460 : undefined);
  const ruralUrbanoOptions = usePloomesOptions(carregarOpcoesGarantia ? 46826 : undefined);
  const unidadeFederativaOptions = usePloomesOptions(carregarOpcoesGarantia ? 38986 : undefined);
  const comQuemEstaFinanciadaOptions = usePloomesOptions(carregarOpcoesGarantia ? 32453 : undefined);
  const utilizacaoGarantiaOptions = usePloomesOptions(carregarOpcoesGarantia ? 31833 : undefined);
  const tipoGarantiaOptions = usePloomesOptions(carregarOpcoesGarantia ? 31459 : undefined);

  // Hooks de opções para todos os tomadores - sempre declarados, mas controlados pelo carregarOpcoesTomadores
  const estadoCivilOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.estadoCivil : undefined);
  const estadoCivilOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.estadoCivil : undefined);
  const estadoCivilOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.estadoCivil : undefined);
  const estadoCivilOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.estadoCivil : undefined);
  const estadoCivilOptionsArr = [estadoCivilOptions0, estadoCivilOptions1, estadoCivilOptions2, estadoCivilOptions3];

  const tipoPessoaOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.tipoPessoa : undefined);
  const tipoPessoaOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.tipoPessoa : undefined);
  const tipoPessoaOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.tipoPessoa : undefined);
  const tipoPessoaOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.tipoPessoa : undefined);
  const tipoPessoaOptionsArr = [tipoPessoaOptions0, tipoPessoaOptions1, tipoPessoaOptions2, tipoPessoaOptions3];

  const qualificacaoProfissaoOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.qualificacaoProfissao : undefined);
  const qualificacaoProfissaoOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.qualificacaoProfissao : undefined);
  const qualificacaoProfissaoOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.qualificacaoProfissao : undefined);
  const qualificacaoProfissaoOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.qualificacaoProfissao : undefined);
  const qualificacaoProfissaoOptionsArr = [qualificacaoProfissaoOptions0, qualificacaoProfissaoOptions1, qualificacaoProfissaoOptions2, qualificacaoProfissaoOptions3];

  const comprovacaoRendaFormalOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.comprovacaoRendaFormal : undefined);
  const comprovacaoRendaFormalOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.comprovacaoRendaFormal : undefined);
  const comprovacaoRendaFormalOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.comprovacaoRendaFormal : undefined);
  const comprovacaoRendaFormalOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.comprovacaoRendaFormal : undefined);
  const comprovacaoRendaFormalOptionsArr = [comprovacaoRendaFormalOptions0, comprovacaoRendaFormalOptions1, comprovacaoRendaFormalOptions2, comprovacaoRendaFormalOptions3];

  const comprovacaoRendaInformalOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.comprovacaoRendaInformal : undefined);
  const comprovacaoRendaInformalOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.comprovacaoRendaInformal : undefined);
  const comprovacaoRendaInformalOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.comprovacaoRendaInformal : undefined);
  const comprovacaoRendaInformalOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.comprovacaoRendaInformal : undefined);
  const comprovacaoRendaInformalOptionsArr = [comprovacaoRendaInformalOptions0, comprovacaoRendaInformalOptions1, comprovacaoRendaInformalOptions2, comprovacaoRendaInformalOptions3];

  const quantidadeSociosOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.quantidadeSocios : undefined);
  const quantidadeSociosOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.quantidadeSocios : undefined);
  const quantidadeSociosOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.quantidadeSocios : undefined);
  const quantidadeSociosOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.quantidadeSocios : undefined);
  const quantidadeSociosOptionsArr = [quantidadeSociosOptions0, quantidadeSociosOptions1, quantidadeSociosOptions2, quantidadeSociosOptions3];

  const numeroAdminOptions0 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[0]?.numeroAdmin : undefined);
  const numeroAdminOptions1 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[1]?.numeroAdmin : undefined);
  const numeroAdminOptions2 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[2]?.numeroAdmin : undefined);
  const numeroAdminOptions3 = usePloomesOptions(carregarOpcoesTomadores ? TOMADORES_OPTIONS_IDS[3]?.numeroAdmin : undefined);
  const numeroAdminOptionsArr = [numeroAdminOptions0, numeroAdminOptions1, numeroAdminOptions2, numeroAdminOptions3];

  // Hooks de opções para garantidores - sempre declarados, mas controlados pelo carregarOpcoesGarantidores
  const estadoCivilGarantidoresOptions0 = usePloomesOptions(carregarOpcoesGarantidores ? GARANTIDORES_OPTIONS_IDS[0]?.estadoCivil : undefined);
  const estadoCivilGarantidoresOptions1 = usePloomesOptions(carregarOpcoesGarantidores ? GARANTIDORES_OPTIONS_IDS[1]?.estadoCivil : undefined);
  const estadoCivilGarantidoresOptions2 = usePloomesOptions(carregarOpcoesGarantidores ? GARANTIDORES_OPTIONS_IDS[2]?.estadoCivil : undefined);
  const estadoCivilGarantidoresOptions3 = usePloomesOptions(carregarOpcoesGarantidores ? GARANTIDORES_OPTIONS_IDS[3]?.estadoCivil : undefined);
  const estadoCivilGarantidoresOptionsArr = [estadoCivilGarantidoresOptions0, estadoCivilGarantidoresOptions1, estadoCivilGarantidoresOptions2, estadoCivilGarantidoresOptions3];

  // Opções Sim/Não para campos booleanos
  const opcoesSimNao = [
    { Id: 'true', Name: 'Sim' },
    { Id: 'false', Name: 'Não' }
  ];

  // useEffect para controlar carregamento progressivo das opções
  useEffect(() => {
    // Carregar opções de tomadores quando entrar na etapa de tomadores
    if (etapa > 0 && etapa <= (quantidade || 0)) {
      if (!carregarOpcoesTomadores) {
        setCarregarOpcoesTomadores(true);
        console.log('[Formulario] 🚀 Iniciando carregamento das opções de tomadores...');
      }
    }
  }, [etapa, quantidade, carregarOpcoesTomadores]);

  useEffect(() => {
    // Carregar opções de empréstimo quando entrar na etapa de empréstimo
    if (etapa === (quantidade || 0) + 1) {
      if (!carregarOpcoesEmprestimo) {
        setCarregarOpcoesEmprestimo(true);
        console.log('[Formulario] 🚀 Iniciando carregamento das opções de empréstimo...');
      }
    }
  }, [etapa, quantidade, carregarOpcoesEmprestimo]);

  useEffect(() => {
    // Carregar opções de garantia quando entrar na etapa de garantia
    if (etapa === (quantidade || 0) + 2) {
      if (!carregarOpcoesGarantia) {
        setCarregarOpcoesGarantia(true);
        console.log('[Formulario] 🚀 Iniciando carregamento das opções de garantia...');
      }
    }
  }, [etapa, quantidade, carregarOpcoesGarantia]);

  useEffect(() => {
    // Carregar opções de garantidores quando entrar na etapa de garantidores
    if (showGarantidores && (etapa === (quantidade || 0) + 3 || etapa >= (quantidade || 0) + 4)) {
      if (!carregarOpcoesGarantidores) {
        setCarregarOpcoesGarantidores(true);
        console.log('[Formulario] 🚀 Iniciando carregamento das opções de garantidores...');
      }
    }
  }, [etapa, quantidade, showGarantidores, carregarOpcoesGarantidores]);

  useEffect(() => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedQtd) {
      try {
        const { Id, Name } = JSON.parse(savedQtd);
        setQuantidade(Name ? Number(Name) : null);
        setQuantidadeId(Id ?? null);
        console.log('Quantidade restaurada do localStorage:', { Id, Name });
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

  // Carregar dados do empréstimo do localStorage ao iniciar
  useEffect(() => {
    const savedEmprestimo = localStorage.getItem(EMPRESTIMO_STORAGE_KEY);
    if (savedEmprestimo) {
      try {
        const parsed = JSON.parse(savedEmprestimo);
        setEmprestimo({ ...initialEmprestimo, ...parsed });
      } catch {}
    }
  }, []);

  // Salvar dados do empréstimo no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify(emprestimo));
  }, [emprestimo]);

  // Carregar dados da garantia do localStorage ao iniciar
  useEffect(() => {
    const savedGarantia = localStorage.getItem(GARANTIA_STORAGE_KEY);
    console.log('Tentativa inicial de carregar garantia do localStorage:', savedGarantia);
    if (savedGarantia) {
      try {
        const parsed = JSON.parse(savedGarantia);
        console.log('Dados da garantia carregados inicialmente:', parsed);
        
        // Se dividaITR é boolean (formato antigo), remover do localStorage e usar o formato novo
        if (typeof parsed.dividaITR === 'boolean') {
          delete parsed.dividaITR;
          localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify(parsed));
        }
        
        setGarantia({ ...initialGarantia, ...parsed });
      } catch (error) {
        console.error('Erro ao carregar dados da garantia inicialmente:', error);
      }
    }
  }, []);

  // Novo useEffect para restaurar dados da garantia após as opções serem carregadas
  useEffect(() => {
    // Verificar se todas as opções da garantia foram carregadas
    const allOptionsLoaded = 
      pertenceTomadorOptions.loading === false &&
      utilizacaoGarantiaOptions.loading === false &&
      tipoGarantiaOptions.loading === false &&
      cidadeGarantiaOptions.loading === false &&
      ruralUrbanoOptions.loading === false &&
      unidadeFederativaOptions.loading === false &&
      comQuemEstaFinanciadaOptions.loading === false &&
      dividaITROptions.loading === false;

    if (allOptionsLoaded) {
      const savedGarantia = localStorage.getItem(GARANTIA_STORAGE_KEY);
      if (savedGarantia) {
        try {
          const parsed = JSON.parse(savedGarantia);
          console.log('Restaurando dados da garantia após carregamento das opções:', parsed);
          
          // Se dividaITR é boolean (formato antigo), remover do localStorage e usar o formato novo
          if (typeof parsed.dividaITR === 'boolean') {
            delete parsed.dividaITR;
            localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify(parsed));
          }
          
          setGarantia({ ...initialGarantia, ...parsed });
        } catch (error) {
          console.error('Erro ao restaurar dados da garantia:', error);
        }
      }
    }
  }, [
    pertenceTomadorOptions.loading,
    utilizacaoGarantiaOptions.loading,
    tipoGarantiaOptions.loading,
    cidadeGarantiaOptions.loading,
    ruralUrbanoOptions.loading,
    unidadeFederativaOptions.loading,
    comQuemEstaFinanciadaOptions.loading,
    dividaITROptions.loading
  ]);

  // Salvar dados da garantia no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify(garantia));
  }, [garantia]);

  // Carregar quantidade de garantidores do localStorage
  useEffect(() => {
    const savedQtdGarantidores = localStorage.getItem(QUANTIDADE_GARANTIDORES_STORAGE_KEY);
    if (savedQtdGarantidores) {
      try {
        const { Id, Name } = JSON.parse(savedQtdGarantidores);
        setQtdGarantidores(Number(Name));
        setQtdGarantidoresId(Id);
        console.log('Quantidade de garantidores restaurada:', { Id, Name });
      } catch {}
    }
  }, []);

  // Carregar garantidores do localStorage (após carregar a quantidade)
  useEffect(() => {
    if (qtdGarantidores > 0) {
      const saved = localStorage.getItem(GARANTIDORES_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === qtdGarantidores) {
            setGarantidores(parsed);
            console.log('Garantidores restaurados do localStorage:', parsed);
          } else {
            // Se os dados salvos não correspondem à quantidade, inicializar com dados vazios
            setGarantidores(Array(qtdGarantidores).fill(null).map(() => ({ ...initialGarantidor })));
            console.log('Garantidores inicializados com dados vazios (quantidade não corresponde)');
          }
        } catch (error) {
          // Se houver erro, inicializar com dados vazios
          setGarantidores(Array(qtdGarantidores).fill(null).map(() => ({ ...initialGarantidor })));
          console.log('Garantidores inicializados com dados vazios (erro no parse):', error);
        }
      } else {
        // Se não há dados salvos, inicializar com dados vazios
        setGarantidores(Array(qtdGarantidores).fill(null).map(() => ({ ...initialGarantidor })));
        console.log('Garantidores inicializados com dados vazios (sem dados salvos)');
      }
    }
  }, [qtdGarantidores]);

  // Salvar garantidores no localStorage
  useEffect(() => {
    if (garantidores.length > 0 && qtdGarantidores > 0) {
      localStorage.setItem(GARANTIDORES_STORAGE_KEY, JSON.stringify(garantidores));
    }
  }, [garantidores, qtdGarantidores]);

  // Lógica para mostrar etapa garantidores
  useEffect(() => {
    if (garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro') {
      setShowGarantidores(true);
    } else {
      setShowGarantidores(false);
      setShowQtdGarantidores(false);
      setShowGarantidorModal(false);
    }
  }, [garantia.garantiaPertenceTomador]);

  // Salvar quantidade de garantidores no localStorage
  useEffect(() => {
    if (qtdGarantidoresId !== null) {
      localStorage.setItem(QUANTIDADE_GARANTIDORES_STORAGE_KEY, JSON.stringify({ Id: qtdGarantidoresId, Name: qtdGarantidores }));
    }
  }, [qtdGarantidoresId, qtdGarantidores]);

  const limparErroEmprestimo = (campo: string) => {
    setErrosEmprestimo(prev => {
      const novo = { ...prev };
      delete novo[campo];
      return novo;
    });
  };

  const limparErroGarantia = (campo: string) => {
    setErrosGarantia(prev => {
      const novo = { ...prev };
      delete novo[campo];
      return novo;
    });
  };

  const limparErroGarantidores = (campo: string) => {
    setErrosGarantidores(prev => {
      const novosErros = { ...prev };
      delete novosErros[campo];
      return novosErros;
    });
  };

  const limparTodosOsDados = () => {
    // Limpar dados dos tomadores

    setQuantidade(null);
    setQuantidadeId(null);
    setTomadores([]);
    setErros({});
    setMostrarErro(false);
    
    // Limpar dados do empréstimo
    setEmprestimo({ ...initialEmprestimo });
    setErrosEmprestimo({});
    setMostrarErroEmprestimo(false);
    
    // Limpar dados da garantia
    setGarantia({ ...initialGarantia });
    setErrosGarantia({});
    setMostrarErroGarantia(false);
    
    // Limpar dados dos garantidores
    setGarantidores([]);
    setQtdGarantidores(1);
    setQtdGarantidoresId(null);
    setErrosGarantidores({});
    setMostrarErroGarantidores(false);
    
    // Limpar modais
    setShowGarantidorModal(false);
    setShowQtdGarantidores(false);
    setShowGarantidores(false);
    setShowSuccessModal(false);
    setSuccessData(null);
    setMostrarErroRendaMinima(false);
    setIsEnviando(false);
    setShowModalErroEnvio(false);
    setErroEnvio('');
    setShowModalLimparDados(false);
    
    // Limpar localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(TOMADORES_STORAGE_KEY);
    localStorage.removeItem(EMPRESTIMO_STORAGE_KEY);
    localStorage.removeItem(GARANTIA_STORAGE_KEY);
    localStorage.removeItem(GARANTIDORES_STORAGE_KEY);
    localStorage.removeItem(QUANTIDADE_GARANTIDORES_STORAGE_KEY);
    
    // Voltar para a etapa inicial
    setEtapa(0);
    
    console.log('✅ Todos os dados foram limpos com sucesso!');
  };

  // Funções para verificar se etapas estão completas
  const verificarEtapaTomadoresCompleta = () => {
    if (!quantidade || quantidade === 0) return false;
    
    for (let i = 0; i < quantidade; i++) {
      const tomador = tomadores[i];
      if (!tomador) return false;
      
      // Debug: log the tomador data to see what's missing
      console.log(`Tomador ${i + 1} data:`, {
        nome: tomador.nome,
        tipoPessoa: tomador.tipoPessoa?.Name,
        estadoCivil: tomador.estadoCivil?.Name,
        dataNascimento: tomador.dataNascimento,
        email: tomador.email,
        telefone: tomador.telefone,
        cep: tomador.cep,
        endereco: tomador.endereco,
        profissao: tomador.profissao,
        qualificacaoProfissional: tomador.qualificacaoProfissional?.Name,
        comprovacaoRendaFormal: tomador.comprovacaoRendaFormal?.Name,
        rendaFormal: tomador.rendaFormal,
        comprovacaoRendaInformal: tomador.comprovacaoRendaInformal?.Name,
        rendaInformal: tomador.rendaInformal,
        rendaTotalInformada: tomador.rendaTotalInformada,
        cpf: tomador.cpf,
        cnpj: tomador.cnpj,
        ramoPJ: tomador.ramoPJ,
        quantidadeSociosPJ: tomador.quantidadeSociosPJ?.Name,
        numeroAdmin: tomador.numeroAdmin?.Name
      });
      
      // Verificar se todos os campos obrigatórios estão preenchidos
      if (!validarCampoVazio(tomador.nome) || !validarCampoObjeto(tomador.tipoPessoa) || !validarCampoObjeto(tomador.estadoCivil) || 
          !validarCampoVazio(tomador.dataNascimento) || !validarDataNascimento(tomador.dataNascimento) || !validarCampoVazio(tomador.email) || !validarCampoVazio(tomador.telefone) || 
          !validarCampoVazio(tomador.cep) || !validarCampoVazio(tomador.endereco) || !validarCampoVazio(tomador.profissao) || 
          !validarCampoObjeto(tomador.qualificacaoProfissional) || !validarCampoObjeto(tomador.comprovacaoRendaFormal) || 
          !validarCampoObjeto(tomador.comprovacaoRendaInformal)) {
        console.log(`Tomador ${i + 1} failed basic validation`);
        return false;
      }
      
      // Verificar rendas baseadas na comprovação
      const rendaFormalNaoSeAplica = tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica';
      const rendaInformalNaoSeAplica = tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica';
      
      if (!rendaFormalNaoSeAplica && !validarCampoMonetarioMaiorQueZero(tomador.rendaFormal)) {
        console.log(`Tomador ${i + 1} failed renda formal validation - valor deve ser maior que zero`);
        return false;
      }
      
      if (!rendaInformalNaoSeAplica && !validarCampoMonetarioMaiorQueZero(tomador.rendaInformal)) {
        console.log(`Tomador ${i + 1} failed renda informal validation - valor deve ser maior que zero`);
        return false;
      }
      
      // Verificar se a renda total é maior que zero
      // Se ambos "renda formal" e "renda informal" são "não se aplica", permite renda total 0,00
      const ambosNaoSeAplicam = rendaFormalNaoSeAplica && rendaInformalNaoSeAplica;
      if (!ambosNaoSeAplicam && !validarCampoMonetarioMaiorQueZero(tomador.rendaTotalInformada)) {
        console.log(`Tomador ${i + 1} failed renda total validation - valor deve ser maior que zero`);
        return false;
      }
      
      // Verificar CPF ou CNPJ baseado no tipo de pessoa
      if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa física') {
        if (!validarCampoVazio(tomador.cpf)) {
          console.log(`Tomador ${i + 1} failed CPF validation`);
          return false;
        }
      } else if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica') {
        if (!validarCampoVazio(tomador.cnpj) || !validarCampoVazio(tomador.ramoPJ) || !validarCampoObjeto(tomador.quantidadeSociosPJ) || !validarCampoObjeto(tomador.numeroAdmin)) {
          console.log(`Tomador ${i + 1} failed PJ validation`);
          return false;
        }
      }
    }
    
    // Verificar se a renda total mínima de todos os tomadores é maior que R$ 7.000,00
    const rendaTotalTodosTomadores = converterValorMonetario(calcularRendaTotalTodosTomadores());
    if (rendaTotalTodosTomadores <= 7000) {
      console.log(`Renda total mínima não atingida: R$ ${rendaTotalTodosTomadores.toFixed(2)} (mínimo: R$ 7.000,00)`);
      return false;
    }
    
    console.log('All tomadores validation passed');
    return true;
  };

  const verificarEtapaEmprestimoCompleta = () => {
    if (!validarCampoObjeto(emprestimo.amortizacao) || !validarCampoObjeto(emprestimo.carencia) || 
        !validarValorSolicitado(emprestimo.valorSolicitado) || !validarCampoMonetario(emprestimo.rendaTotal) || 
        !validarPrazoSolicitado(emprestimo.prazoSolicitado) || !validarCampoVazio(emprestimo.jurosSolicitado) || 
        !validarCampoMonetario(emprestimo.parcelaSolicitada) || !validarCampoVazio(emprestimo.comentarios) || 
        !validarCampoObjeto(emprestimo.motivoEmprestimo)) {
      return false;
    }
    return true;
  };

  const verificarEtapaGarantiaCompleta = () => {
    if (!validarCampoObjeto(garantia.garantiaPertenceTomador) || !validarCampoMonetario(garantia.valorGarantia) || 
        !validarCampoObjeto(garantia.cidadeGarantia) || !validarCampoObjeto(garantia.ruralUrbano) || 
        !validarCampoVazio(garantia.enderecoGarantia) || !validarCampoObjeto(garantia.unidadeFederativa) || 
        !validarCampoObjeto(garantia.utilizacaoGarantia) || !validarCampoObjeto(garantia.tipoGarantia) ||
        garantia.situacaoGarantia === undefined) {
      return false;
    }
    
    // Se garantia não está quitada, verificar campos de financiamento
    if (garantia.situacaoGarantia === false) {
      if (!validarCampoObjeto(garantia.comQuemEstaFinanciada) || !validarCampoVazio(garantia.valorEmAberto) || 
          !validarCampoVazio(garantia.quantasParcelasFalta)) {
        return false;
      }
    }
    
    // Verificar campos de documentação
    if (garantia.escritura === undefined || garantia.nomeMatrícula === undefined || 
        garantia.imovelAverbado === undefined || garantia.possuiUsufruto === undefined || 
        garantia.processoInventario === undefined) {
      return false;
    }
    
    // Verificar campos de dívidas baseado no tipo (rural/urbano)
    if (garantia.ruralUrbano?.Name === 'Urbano') {
      if (garantia.dividaCondominio === undefined || garantia.dividaIPTU === undefined) {
        return false;
      }
    } else if (garantia.ruralUrbano?.Name === 'Rural') {
      if (!validarCampoObjeto(garantia.dividaITR)) {
        return false;
      }
    }
    
    return true;
  };

  const verificarEtapaGarantidoresCompleta = () => {
    if (!qtdGarantidores || qtdGarantidores === 0) return false;
    
    for (let i = 0; i < qtdGarantidores; i++) {
      const garantidor = garantidores[i];
      if (!garantidor) return false;
      
      if (!validarCampoObjeto(garantidor.estadoCivil) || !validarCampoVazio(garantidor.nome) || 
          !validarCampoVazio(garantidor.profissao) || !validarCampoVazio(garantidor.email) || 
          (!validarCampoVazio(garantidor.cpf) && !validarCampoVazio(garantidor.cnpj))) {
        return false;
      }
    }
    return true;
  };

  // Função para obter texto dinâmico baseado na etapa atual
  const obterTextoDinamico = () => {
    // Etapa de seleção de quantidade
    if (etapa === 0) {
      return {
        titulo: "O que é um Tomador?",
        descricao: "Pessoa física ou jurídica que solicita o crédito, com dados pessoais, endereço e informações financeiras para análise."
      };
    }
    
    // Etapa de tomadores
    if (etapa > 0 && etapa <= (quantidade || 0)) {
      return {
        titulo: "O que é um Tomador?",
        descricao: "Pessoa física ou jurídica que solicita o crédito, com dados pessoais, endereço e informações financeiras para análise."
      };
    }
    
    // Etapa de empréstimo
    if (etapa === (quantidade || 0) + 1) {
      return {
        titulo: "O que é um Empréstimo?",
        descricao: "Operação financeira onde uma instituição empresta dinheiro ao tomador, que deve devolver com juros em um prazo determinado."
      };
    }
    
    // Etapa de garantia
    if (etapa === (quantidade || 0) + 2) {
      return {
        titulo: "O que é uma Garantia?",
        descricao: "Bem (geralmente um imóvel) oferecido como segurança para o empréstimo, que pode ser executado em caso de inadimplência."
      };
    }
    
    // Etapa de garantidores
    if (showGarantidores && (etapa === (quantidade || 0) + 3 || etapa >= (quantidade || 0) + 4)) {
      return {
        titulo: "O que é um Garantidor?",
        descricao: "Pessoa que se compromete a pagar o empréstimo caso o tomador não consiga honrar com suas obrigações."
      };
    }
    
    return {
      titulo: "O que é um Tomador?",
      descricao: "Pessoa física ou jurídica que solicita o crédito, com dados pessoais, endereço e informações financeiras para análise."
    };
  };

  const validarTomador = (tomador: any): { valido: boolean; erros: { [key: string]: string } } => {
    const erros: { [key: string]: string } = {};
    
    // Validação de campos obrigatórios
    if (!validarCampoVazio(tomador.nome)) {
      erros.nome = 'Nome é obrigatório';
    } else if (!validarMinimoCaracteres(tomador.nome)) {
      erros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    if (!validarCampoVazio(tomador.email)) {
      erros.email = 'Email é obrigatório';
    } else if (!validarEmail(tomador.email)) {
      erros.email = 'Email inválido';
    }
    
    if (!validarCampoVazio(tomador.telefone)) {
      erros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(tomador.telefone)) {
      erros.telefone = 'Telefone inválido';
    }
    
    if (!validarCampoVazio(tomador.dataNascimento)) {
      erros.dataNascimento = 'Data de nascimento é obrigatória';
    } else if (!validarDataNascimento(tomador.dataNascimento)) {
      erros.dataNascimento = 'Idade deve estar entre 18 e 80 anos';
    }
    
    if (!validarCampoObjeto(tomador.tipoPessoa)) {
      erros.tipoPessoa = 'Tipo de pessoa é obrigatório';
    }
    
    // Validação de documento baseada no tipo de pessoa
    if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa física') {
      if (!validarCampoVazio(tomador.cpf)) {
        erros.cpf = 'CPF é obrigatório';
      } else if (!validarCPF(tomador.cpf)) {
        erros.cpf = 'CPF inválido';
      }
    } else if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica') {
      if (!validarCampoVazio(tomador.cnpj)) {
        erros.cnpj = 'CNPJ é obrigatório';
      } else if (!validarCNPJ(tomador.cnpj)) {
        erros.cnpj = 'CNPJ inválido';
      }
    }
    
    // Validação de campos de select
    if (!validarCampoObjeto(tomador.estadoCivil)) {
      erros.estadoCivil = 'Estado civil é obrigatório';
    }
    
    if (!validarCampoObjeto(tomador.qualificacaoProfissional)) {
      erros.qualificacaoProfissional = 'Qualificação profissional é obrigatória';
    }
    
    if (!validarCampoVazio(tomador.profissao)) {
      erros.profissao = 'Profissão é obrigatória';
    } else if (!validarMinimoCaracteres(tomador.profissao)) {
      erros.profissao = 'Profissão deve ter pelo menos 3 caracteres';
    }
    
    if (!validarCampoVazio(tomador.cep)) {
      erros.cep = 'CEP é obrigatório';
    } else if (!validarCEP(tomador.cep)) {
      erros.cep = 'CEP deve ter 8 dígitos (formato: 00000-000)';
    }
    
    if (!validarCampoVazio(tomador.endereco)) {
      erros.endereco = 'Endereço é obrigatório';
    } else if (!validarMinimoCaracteres(tomador.endereco)) {
      erros.endereco = 'Endereço deve ter pelo menos 3 caracteres';
    }
    
    // Validação de comprovação de renda formal
    if (!validarCampoObjeto(tomador.comprovacaoRendaFormal)) {
      erros.comprovacaoRendaFormal = 'Comprovação de renda formal é obrigatória';
    }
    
    // Validação de comprovação de renda informal
    if (!validarCampoObjeto(tomador.comprovacaoRendaInformal)) {
      erros.comprovacaoRendaInformal = 'Comprovação de renda informal é obrigatória';
    }
    
    // Validação de rendas baseada na comprovação
    const rendaFormalNaoSeAplica = tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica';
    const rendaInformalNaoSeAplica = tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica';
    
    if (!rendaFormalNaoSeAplica) {
      if (!validarCampoVazio(tomador.rendaFormal)) {
        erros.rendaFormal = 'Renda formal é obrigatória';
      } else if (!validarCampoMonetarioMaiorQueZero(tomador.rendaFormal)) {
        erros.rendaFormal = 'Renda formal deve ser maior que zero';
      }
    }
    
    if (!rendaInformalNaoSeAplica) {
      if (!validarCampoVazio(tomador.rendaInformal)) {
        erros.rendaInformal = 'Renda informal é obrigatória';
      } else if (!validarCampoMonetarioMaiorQueZero(tomador.rendaInformal)) {
        erros.rendaInformal = 'Renda informal deve ser maior que zero';
      }
    }
    
    // Renda total é sempre obrigatória (será calculada automaticamente)
    // Se ambos "renda formal" e "renda informal" são "não se aplica", permite renda total 0,00
    const ambosNaoSeAplicam = rendaFormalNaoSeAplica && rendaInformalNaoSeAplica;
    if (!validarCampoVazio(tomador.rendaTotalInformada)) {
      erros.rendaTotalInformada = 'Renda total informada é obrigatória';
    } else if (!ambosNaoSeAplicam && !validarCampoMonetarioMaiorQueZero(tomador.rendaTotalInformada)) {
      erros.rendaTotalInformada = 'Renda total deve ser maior que zero';
    }
    
    // Validações específicas para pessoa jurídica
    if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica') {
      if (!validarCampoObjeto(tomador.quantidadeSociosPJ)) {
        erros.quantidadeSociosPJ = 'Quantidade de sócios é obrigatória';
      }
      
      if (!validarCampoObjeto(tomador.numeroAdmin)) {
        erros.numeroAdmin = 'Número de administradores é obrigatório';
      }
      
      if (!validarCampoVazio(tomador.ramoPJ)) {
        erros.ramoPJ = 'Ramo da PJ é obrigatório';
      } else if (!validarMinimoCaracteres(tomador.ramoPJ)) {
        erros.ramoPJ = 'Ramo da PJ deve ter pelo menos 3 caracteres';
      }
    }
    
    return {
      valido: Object.keys(erros).length === 0,
      erros
    };
  };

  const validarEmprestimo = (emp: any): { valido: boolean; erros: { [key: string]: string } } => {
    const erros: { [key: string]: string } = {};
    if (!validarCampoObjeto(emp.amortizacao)) {
      erros.amortizacao = 'Amortização é obrigatória';
    }
    if (!validarCampoObjeto(emp.carencia)) {
      erros.carencia = 'Carência é obrigatória';
    }
    if (!validarCampoObjeto(emp.motivoEmprestimo)) {
      erros.motivoEmprestimo = 'Motivo do Empréstimo é obrigatório';
    }
    if (!validarCampoVazio(emp.valorSolicitado)) {
      erros.valorSolicitado = 'Valor solicitado é obrigatório';
    } else if (!validarValorSolicitado(emp.valorSolicitado)) {
      erros.valorSolicitado = 'Valor solicitado deve estar entre R$ 75.000,00 e R$ 5.000.000,00';
    }
    // Renda total é calculada automaticamente, não precisa validar
    if (!validarCampoVazio(emp.prazoSolicitado)) {
      erros.prazoSolicitado = 'Prazo solicitado é obrigatório';
    } else if (!validarPrazoSolicitado(emp.prazoSolicitado)) {
      erros.prazoSolicitado = 'Prazo solicitado deve estar entre 35 e 180 meses';
    }
    if (!validarCampoVazio(emp.jurosSolicitado)) {
      erros.jurosSolicitado = 'Juros solicitado é obrigatório';
    }
    if (!validarCampoVazio(emp.parcelaSolicitada)) {
      erros.parcelaSolicitada = 'Parcela solicitada é obrigatória';
    }
    if (!validarCampoVazio(emp.comentarios)) {
      erros.comentarios = 'Defesa do crédito é obrigatória';
    } else if (!validarMinimoCaracteres(emp.comentarios, 50)) {
      erros.comentarios = 'A defesa do crédito deve ter pelo menos 50 caracteres';
    }
    return { valido: Object.keys(erros).length === 0, erros };
  };

  const validarGarantia = (gar: any): { valido: boolean; erros: { [key: string]: string } } => {
    const erros: { [key: string]: string } = {};

    // Validações básicas
    if (!validarCampoObjeto(gar.garantiaPertenceTomador)) {
      erros.garantiaPertenceTomador = 'Informe se a garantia pertence ao tomador';
    }
    if (!validarCampoVazio(gar.valorGarantia)) {
      erros.valorGarantia = 'Valor da garantia é obrigatório';
    }
    if (!validarCampoObjeto(gar.cidadeGarantia)) {
      erros.cidadeGarantia = 'Cidade da garantia é obrigatória';
    }
    if (!validarCampoObjeto(gar.ruralUrbano)) {
      erros.ruralUrbano = 'Selecione se é Rural ou Urbano';
    }
    if (!validarCampoVazio(gar.enderecoGarantia)) {
      erros.enderecoGarantia = 'Endereço da garantia é obrigatório';
    }
    if (!validarCampoObjeto(gar.unidadeFederativa)) {
      erros.unidadeFederativa = 'Unidade Federativa é obrigatória';
    }
    if (!validarCampoObjeto(gar.utilizacaoGarantia)) {
      erros.utilizacaoGarantia = 'Qual a utilização da garantia é obrigatória';
    }
    if (!validarCampoObjeto(gar.tipoGarantia)) {
      erros.tipoGarantia = 'Tipo da garantia é obrigatório';
    }

    // Validação condicional para situação da garantia
    if (gar.situacaoGarantia === undefined) {
      erros.situacaoGarantia = 'Informe se a garantia está quitada';
    }

    // Validações condicionais para financiamento (quando garantia não está quitada)
    if (gar.situacaoGarantia === false) {
      if (!validarCampoObjeto(gar.comQuemEstaFinanciada)) {
        erros.comQuemEstaFinanciada = 'Informe com quem a garantia está financiada';
      }
      if (!validarCampoVazio(gar.valorEmAberto)) {
        erros.valorEmAberto = 'Valor em aberto da garantia é obrigatório';
      }
      if (!validarCampoVazio(gar.quantasParcelasFalta)) {
        erros.quantasParcelasFalta = 'Quantidade de parcelas em aberto é obrigatória';
      }
    }

    // Validações para campos booleanos
    if (gar.escritura === undefined) {
      erros.escritura = 'Informe se há escritura individual';
    }
    if (gar.nomeMatrícula === undefined) {
      erros.nomeMatrícula = 'Informe se o nome está na matrícula';
    }
    if (gar.processoInventario === undefined) {
      erros.processoInventario = 'Informe se há processo de inventário';
    }
    if (gar.imovelAverbado === undefined) {
      erros.imovelAverbado = 'Informe se o imóvel está averbado';
    }
    if (gar.possuiUsufruto === undefined) {
      erros.possuiUsufruto = 'Informe se o imóvel possui usufruto';
    }

    // Validações condicionais para dívidas baseadas no tipo do imóvel
    if (gar.ruralUrbano?.Name === 'Urbano') {
      if (gar.dividaCondominio === undefined) {
        erros.dividaCondominio = 'Informe se há dívida de condomínio';
      }
      if (gar.dividaIPTU === undefined) {
        erros.dividaIPTU = 'Informe se há dívida de IPTU';
      }
    } else if (gar.ruralUrbano?.Name === 'Rural') {
      if (!validarCampoObjeto(gar.dividaITR)) {
        erros.dividaITR = 'Informe se há dívida de ITR';
      }
    }

    return { valido: Object.keys(erros).length === 0, erros };
  };

  const validarGarantidor = (garantidor: any): { valido: boolean; erros: { [key: string]: string } } => {
    const erros: { [key: string]: string } = {};

    if (!validarCampoObjeto(garantidor.estadoCivil)) {
      erros.estadoCivil = 'Estado civil é obrigatório';
    }
    if (!validarCampoVazio(garantidor.nome)) {
      erros.nome = 'Nome é obrigatório';
    }
    if (!validarCampoVazio(garantidor.cpf) && !validarCampoVazio(garantidor.cnpj)) {
      erros.cpf = 'CPF ou CNPJ é obrigatório';
      erros.cnpj = 'CPF ou CNPJ é obrigatório';
    }
    if (validarCampoVazio(garantidor.cpf) && !validarCPF(garantidor.cpf)) {
      erros.cpf = 'CPF inválido';
    }
    if (validarCampoVazio(garantidor.cnpj) && !validarCNPJ(garantidor.cnpj)) {
      erros.cnpj = 'CNPJ inválido';
    }
    if (!validarCampoVazio(garantidor.profissao)) {
      erros.profissao = 'Profissão é obrigatória';
    }
    if (!validarCampoVazio(garantidor.email)) {
      erros.email = 'Email é obrigatório';
    } else if (!validarEmail(garantidor.email)) {
      erros.email = 'Email inválido';
    }

    return {
      valido: Object.keys(erros).length === 0,
      erros
    };
  };

  const handleDebug = () => {
    const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedTomadores = localStorage.getItem(TOMADORES_STORAGE_KEY);
    const savedGarantia = localStorage.getItem(GARANTIA_STORAGE_KEY);
    const savedEmprestimo= localStorage.getItem(EMPRESTIMO_STORAGE_KEY);
    const savedGarantidores = localStorage.getItem(GARANTIDORES_STORAGE_KEY);
    let qtd = 0;
    if (savedQtd) {
      try {
        const parsed = JSON.parse(savedQtd);
        qtd = parsed.Name ? Number(parsed.Name) : 0;
      } catch {}
    }
    if (savedTomadores) {
      try {
        const savedQtd = localStorage.getItem(LOCAL_STORAGE_KEY);
        const parsed = JSON.parse(savedTomadores);
        const parsedEmprestimo = JSON.parse(savedEmprestimo);
        const parsedGarantia = JSON.parse(savedGarantia);
        const parsedGarantidores = JSON.parse(savedGarantidores);

        console.log('Quantidade:', savedQtd);
        console.log('Tomadores:', parsed);
        console.log('Emprestimo:', parsedEmprestimo);
        console.log('Garantia:', parsedGarantia);
        console.log('Garantidores:', parsedGarantidores);
      } catch (err) {
        console.log('Erro ao ler dados dos tomadores:', err);
      }
    } else {
      console.log('Nenhum dado de tomadores salvo.');
    }

    // Informações sobre o cache do Ploomes
    console.log('=== CACHE DO PLOOMES ===');
    const cacheInfo = getCacheInfo();
    console.log('Status do cache:', cacheInfo);
    
    // Mostrar todas as chaves do cache
    const keys = Object.keys(localStorage);
    const ploomesKeys = keys.filter(key => key.startsWith('ploomes_options_'));
    console.log('Chaves do cache do Ploomes:', ploomesKeys);
    
    ploomesKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          const ageHours = Math.floor(age / (1000 * 60 * 60));
          console.log(`${key}: ${parsed.options.length} opções, ${ageHours}h atrás`);
        }
      } catch (error) {
        console.log(`${key}: Erro ao ler`);
      }
    });
  };

  const renderBanner = () => {
    const etapasSidebar = showGarantidores
      ? [...etapas, 'Garantidores']
      : etapas;

    return (
      <div className="w-full flex justify-center py-6">
        <div className="max-w-7xl w-full rounded-3xl shadow-2xl p-8 bg-white border-2 border-gray-200">
          {/* Header com logo e botão */}

          {/* Indicador de progresso geral */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-800">Progresso Geral</span>
              <span className="text-lg font-bold text-blue-600">
                {(() => {
                  let etapasCompletadas = 0;
                  if (verificarEtapaTomadoresCompleta()) etapasCompletadas++;
                  if (verificarEtapaEmprestimoCompleta()) etapasCompletadas++;
                  if (verificarEtapaGarantiaCompleta()) etapasCompletadas++;
                  if (garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro' && verificarEtapaGarantidoresCompleta()) etapasCompletadas++;
                  const totalEtapas = garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro' ? 4 : 3;
                  return `${etapasCompletadas}/${totalEtapas} etapas`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 shadow-md"
                style={{
                  width: `${(() => {
                    let etapasCompletadas = 0;
                    if (verificarEtapaTomadoresCompleta()) etapasCompletadas++;
                    if (verificarEtapaEmprestimoCompleta()) etapasCompletadas++;
                    if (verificarEtapaGarantiaCompleta()) etapasCompletadas++;
                    if (garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro' && verificarEtapaGarantidoresCompleta()) etapasCompletadas++;
                    const totalEtapas = garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro' ? 4 : 3;
                    return (etapasCompletadas / totalEtapas) * 100;
                  })()}%`
                }}
              ></div>
            </div>
          </div>

          {/* Barra de progresso das etapas */}
          <div className="flex items-center w-full justify-between space-x-6">

            <div className="flex items-center w-full justify-center space-x-6 ">
                {etapasSidebar.map((label, idx) => {
                  // Lógica para destacar a etapa correta
                  let isActive = false;
                  let isEnabled = false;
                  let isCompleted = false;
                  
                  if (idx === 0) {
                    isActive = (etapa === 0) || (etapa > 0 && etapa <= (quantidade || 0));
                    isEnabled = etapa >= 0;
                    isCompleted = verificarEtapaTomadoresCompleta();
                  } else if (idx === 1) {
                    isActive = etapa === (quantidade || 0) + 1;
                    isEnabled = etapa >= (quantidade || 0) + 1 || verificarEtapaTomadoresCompleta();
                    isCompleted = verificarEtapaEmprestimoCompleta();
                  } else if (idx === 2) {
                    isActive = etapa === (quantidade || 0) + 2;
                    isEnabled = etapa >= (quantidade || 0) + 2 || (verificarEtapaTomadoresCompleta() && verificarEtapaEmprestimoCompleta());
                    isCompleted = verificarEtapaGarantiaCompleta();
                  } else if (idx === 3) {
                    // Garantidores - sempre mostrar se as etapas anteriores estão completas e garantia é de terceiro
                    const garantidoresDevemAparecer = garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro';
                    isActive = garantidoresDevemAparecer && ((showQtdGarantidores && etapa === (quantidade || 0) + 3) || (etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores));
                    isEnabled = garantidoresDevemAparecer && (etapa >= (quantidade || 0) + 3 || (verificarEtapaTomadoresCompleta() && verificarEtapaEmprestimoCompleta() && verificarEtapaGarantiaCompleta()));
                    isCompleted = garantidoresDevemAparecer && verificarEtapaGarantidoresCompleta();
                  }
                  
                  // Determinar o ícone baseado no estado da etapa
                  const getStepIcon = () => {
                    switch (idx) {
                      case 0: return '👤';
                      case 1: return '💰';
                      case 2: return '🏠';
                      case 3: return '🛡️';
                      default: return '👤';
                    }
                  };

                  return (
                    <div key={label} className="flex items-center">
                      <button
                        className={`flex flex-col items-center space-y-3 px-6 py-4 rounded-xl transition-all duration-300 min-w-[120px] relative ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 border-2 border-blue-400 shadow-lg'
                            : isCompleted
                              ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-900 border-2 border-green-400 hover:from-green-200 hover:to-green-300 shadow-lg'
                              : isEnabled
                                ? 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 shadow-md'
                                : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                        }`}
                        disabled={!isEnabled}
                        onClick={() => {
                          if (!isEnabled) return;
                          if (idx === 0) {
                            // Navegar para tomadores - sempre vai para seleção de quantidade
                            setEtapa(0);
                          } else if (idx === 1) {
                            // Navegar para empréstimo - verificar renda total mínima primeiro
                            const rendaTotalTodosTomadores = converterValorMonetario(calcularRendaTotalTodosTomadores());
                            if (rendaTotalTodosTomadores <= 7000) {
                              setMostrarErroRendaMinima(true);
                              return;
                            }
                            setEtapa((quantidade || 0) + 1);
                          } else if (idx === 2) {
                            // Navegar para garantia
                            setEtapa((quantidade || 0) + 2);
                          } else if (idx === 3) {
                            // Navegar para garantidores - sempre vai para seleção de quantidade
                            if (garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro') {
                              setShowGarantidores(true);
                              setShowQtdGarantidores(true);
                              setEtapa((quantidade || 0) + 3);
                            }
                          }
                        }}
                      >
                        {/* Indicador de primeira etapa */}
                        {idx === 0 && (
                          <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            1º
                          </div>
                        )}
                        
                        {/* Indicador de última etapa */}
                        {idx === etapasSidebar.length - 1 && (
                          <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Última
                          </div>
                        )}
                        
                        {/* Indicador numérico para todas as etapas */}
                        <div className="absolute -bottom-2 -left-2 bg-gray-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                          {idx + 1}
                        </div>
                        
                        <div className={`w-14 h-14 flex items-center justify-center rounded-full border-2 text-2xl ${
                          isActive 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                            : isCompleted
                              ? 'border-green-600 bg-green-600 text-white shadow-lg'
                              : isEnabled
                                ? 'border-gray-500 bg-white text-gray-700 shadow-md'
                                : 'border-gray-400 bg-gray-200 text-gray-500'
                        }`}>
                          {getStepIcon()}
                        </div>
                        <span className="text-sm font-bold whitespace-nowrap">
                          {label}
                        </span>
                        {isActive && (
                          <span className="text-xs text-blue-700 font-bold flex items-center gap-1">
                            <span>▶</span> Etapa atual
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                            <span>✓</span> Concluída
                          </span>
                        )}
                        {!isEnabled && (
                          <span className="text-xs text-gray-600 font-bold flex items-center gap-1">
                            <span>🔒</span> Bloqueada
                          </span>
                        )}
                      </button>
                      
                      {/* Linha conectora entre etapas */}
                      {idx < etapasSidebar.length - 1 && (
                        <div className={`w-20 h-1 mx-3 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      )}
                    </div>
                  );
                })}
            </div>
              
              {/* Botão de limpar dados */}
              {(quantidade || emprestimo.valorSolicitado || garantia.valorGarantia) && (
                <button
                  onClick={() => setShowModalLimparDados(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm w-48 shadow-md"
                  title="Limpar todos os dados preenchidos"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Limpar Dados
                </button>
              )}
          </div>
          
        </div>
      </div>
    );
  };
  
  // Sidebar dinâmica
  const etapasSidebar = showGarantidores
    ? [...etapas, 'Garantidores']
    : etapas;

  const renderSidebar = () => {
    const textoAtual = obterTextoDinamico();
    
    return (
      <aside className="w-64 bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
        <div className="text-sm text-gray-700">
          <h2 className="font-bold text-gray-900 mb-3 text-lg">{textoAtual.titulo}</h2>
          <p className="leading-relaxed">
            {textoAtual.descricao}
          </p>
        </div>
      </aside>
    );
  };

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
      <section className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-5xl space-y-8 flex flex-col items-center border-2 border-gray-200">
        {/* Header com ícone */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            1. Quantidade de Tomadores
          </h2>
          <p className="text-gray-700 text-lg max-w-md leading-relaxed font-medium">
            Selecione quantos tomadores participarão desta operação de empréstimo
          </p>
        </div>
        
        {/* Campo de seleção */}
        <div className="w-full max-w-sm">
          {loading && (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-700 font-medium">Carregando opções...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-4">
              <p className="text-red-700 bg-red-100 border-2 border-red-300 rounded-lg px-4 py-3 font-medium">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                Quantidade de Tomadores
              </label>
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                <SelectInput
                  options={options.filter(o => o.Name !== '0')}
                  value={quantidadeId ?? undefined}
                  onChange={opt => {
                    setQuantidadeId(Number(opt.Id));
                    setQuantidade(Number(opt.Name));
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ Id: opt.Id, Name: opt.Name }));
                    console.log('Quantidade selecionada:', { Id: opt.Id, Name: opt.Name });
                  }}
                  placeholder="Selecione a quantidade"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Botão */}
        <div className="w-full max-w-sm">
          <button
            className="w-full py-5 px-6 font-bold text-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
            onClick={() => setEtapa(1)}
            disabled={!quantidade}
          >
            <div className="flex items-center justify-center">
              <span>Continuar</span>
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </section>
    );
  };

  // Estado de transição entre etapas
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextEtapa, setNextEtapa] = useState<number | null>(null);

  // Componente de loading
  const LoadingStep = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
      <svg className="animate-spin h-12 w-12 text-blue-600 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-blue-800 text-lg font-bold">{msg}</span>
    </div>
  );

  // Função para verificar se as opções de tomadores estão carregando
  const verificarCarregamentoTomadores = () => {
    if (!carregarOpcoesTomadores) return false;
    
    const isLoading = estadoCivilOptionsArr.some(opt => opt.loading) ||
           tipoPessoaOptionsArr.some(opt => opt.loading) ||
           qualificacaoProfissaoOptionsArr.some(opt => opt.loading) ||
           comprovacaoRendaFormalOptionsArr.some(opt => opt.loading) ||
           comprovacaoRendaInformalOptionsArr.some(opt => opt.loading) ||
           quantidadeSociosOptionsArr.some(opt => opt.loading) ||
           numeroAdminOptionsArr.some(opt => opt.loading);
    
    // Log quando terminar de carregar
    if (!isLoading && carregarOpcoesTomadores) {
      console.log('[Formulario] ✅ Opções de tomadores carregadas com sucesso!');
    }
    
    return isLoading;
  };

  // Função para verificar se as opções de empréstimo estão carregando
  const verificarCarregamentoEmprestimo = () => {
    if (!carregarOpcoesEmprestimo) return false;
    
    const isLoading = amortizacaoOptions.loading ||
           carenciaOptions.loading ||
           motivoEmprestimoOptions.loading;
    
    // Log quando terminar de carregar
    if (!isLoading && carregarOpcoesEmprestimo) {
      console.log('[Formulario] ✅ Opções de empréstimo carregadas com sucesso!');
    }
    
    return isLoading;
  };

  // Função para verificar se as opções de garantia estão carregando
  const verificarCarregamentoGarantia = () => {
    if (!carregarOpcoesGarantia) return false;
    
    const isLoading = pertenceTomadorOptions.loading ||
           utilizacaoGarantiaOptions.loading ||
           tipoGarantiaOptions.loading ||
           cidadeGarantiaOptions.loading ||
           ruralUrbanoOptions.loading ||
           unidadeFederativaOptions.loading ||
           comQuemEstaFinanciadaOptions.loading ||
           dividaITROptions.loading;
    
    // Log quando terminar de carregar
    if (!isLoading && carregarOpcoesGarantia) {
      console.log('[Formulario] ✅ Opções de garantia carregadas com sucesso!');
    }
    
    return isLoading;
  };

  // Função para verificar se as opções de garantidores estão carregando
  const verificarCarregamentoGarantidores = () => {
    if (!carregarOpcoesGarantidores) return false;
    
    const isLoading = loadingGarantidores ||
           estadoCivilGarantidoresOptionsArr.some(opt => opt.loading);
    
    // Log quando terminar de carregar
    if (!isLoading && carregarOpcoesGarantidores) {
      console.log('[Formulario] ✅ Opções de garantidores carregadas com sucesso!');
    }
    
    return isLoading;
  };

  // Formulário de cadastro de tomador
  const renderCadastroTomador = () => {
    const idx = etapa - 1;
    const tomador = tomadores[idx] || { ...initialTomador };

    // Verificar se as opções estão carregando
    if (verificarCarregamentoTomadores()) {
      return (
        <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center">
          <LoadingStep msg="Carregando opções de tomadores..." />
        </section>
      );
    }

    const estadoCivilOptions = estadoCivilOptionsArr[idx];
    const tipoPessoaOptions = tipoPessoaOptionsArr[idx];
    const qualificacaoProfissaoOptions = qualificacaoProfissaoOptionsArr[idx];
    const comprovacaoRendaFormalOptions = comprovacaoRendaFormalOptionsArr[idx];
    const comprovacaoRendaInformalOptions = comprovacaoRendaInformalOptionsArr[idx];
    const quantidadeSociosOptions = quantidadeSociosOptionsArr[idx];
    const numeroAdminOptions = numeroAdminOptionsArr[idx];



    return (
      <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      }`}>
        <h2 className="text-lg font-bold text-blue-900 mb-4">Tomador {idx + 1}</h2>
        <form className="w-full space-y-6">
          {/* Dados Pessoais */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-2">
            <legend className="text-blue-900 font-semibold px-2">Dados Pessoais</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <SelectInput
                options={estadoCivilOptions?.options || []}
                value={tomador.estadoCivil.Id ? String(tomador.estadoCivil.Id) : undefined}
                onChange={opt => {
                  limparErro('estadoCivil');
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], estadoCivil: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Estado Civil"
                placeholder="Selecione o estado civil"
                error={erros.estadoCivil}
                tooltip="Selecione seu estado civil atual (solteiro, casado, divorciado, etc.)"
              />
              <SelectInput
                options={tipoPessoaOptions?.options || []}
                value={tomador.tipoPessoa.Id ? String(tomador.tipoPessoa.Id) : undefined}
                onChange={opt => {
                  limparErro('tipoPessoa');
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], tipoPessoa: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Tipo Pessoa - Tomador 1"
                placeholder="Pessoa Física ou Jurídica"
                error={erros.tipoPessoa}
                tooltip="Selecione se você é uma pessoa física (CPF) ou jurídica (CNPJ)"
              />
              <InputText
                inputName="Nome"
                termo={tomador.nome}
                onSetName={v => {
                  limparErro('nome');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], nome: v }; return novo; });
                }}
                placeholder="Digite o nome"
                typeInput="Text"
                error={erros.nome}
                tooltip="Digite seu nome completo como consta nos documentos"
              />
              <InputText
                inputName="Data de Nascimento"
                termo={tomador.dataNascimento}
                onSetName={v => {
                  limparErro('dataNascimento');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], dataNascimento: v }; return novo; });
                }}
                placeholder="dd/mm/aaaa"
                typeInput="Date"
                error={erros.dataNascimento}
                tooltip="Digite sua data de nascimento (idade máxima: 80 anos)"
              />
            </div>
          </fieldset>

          {/* Documentação */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Documentação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa física' ? (
                <InputText
                  inputName="CPF"
                  termo={tomador.cpf}
                  onSetName={v => {
                    limparErro('cpf');
                    setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], cpf: v }; return novo; });
                  }}
                  placeholder="Digite seu CPF"
                  typeInput="Cpf"
                  error={erros.cpf}
                  tooltip="Digite seu CPF completo (apenas números ou com pontos e traços)"
                />
              ) : tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica' ? (
                <>
                  {quantidadeSociosOptions?.loading ? (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-blue-900">Quantidade de Sócios da PJ</label>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </div>
                      <div className="h-10 bg-gray-100 rounded animate-pulse flex items-center px-3">
                        <span className="text-gray-500">Carregando opções...</span>
                      </div>
                    </div>
                  ) : quantidadeSociosOptions?.error ? (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-blue-900">Quantidade de Sócios da PJ</label>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </div>
                      <div className="h-10 bg-red-50 border border-red-200 rounded flex items-center px-3">
                        <span className="text-red-600 text-sm">Erro ao carregar opções: {quantidadeSociosOptions.error}</span>
                      </div>
                    </div>
                  ) : (
                    <SelectInput
                      options={quantidadeSociosOptions?.options || []}
                      value={tomador.quantidadeSociosPJ.Id ? String(tomador.quantidadeSociosPJ.Id) : undefined}
                      onChange={opt => {
                        limparErro('quantidadeSociosPJ');
                        setTomadores(prev => {
                          const novo = [...prev];
                          novo[idx] = { ...novo[idx], quantidadeSociosPJ: { Id: opt.Id, Name: opt.Name } };
                          return novo;
                        });
                      }}
                      placeholder="Informe a quantidade de sócios"
                      label="Quantidade de Sócios da PJ"
                      error={erros.quantidadeSociosPJ}
                      tooltip="Selecione a quantidade total de sócios da pessoa jurídica"
                    />
                  )}
                  {numeroAdminOptions?.loading ? (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-blue-900">N° de admin</label>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </div>
                      <div className="h-10 bg-gray-100 rounded animate-pulse flex items-center px-3">
                        <span className="text-gray-500">Carregando opções...</span>
                      </div>
                    </div>
                  ) : numeroAdminOptions?.error ? (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium text-blue-900">N° de admin</label>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </div>
                      <div className="h-10 bg-red-50 border border-red-200 rounded flex items-center px-3">
                        <span className="text-red-600 text-sm">Erro ao carregar opções: {numeroAdminOptions.error}</span>
                      </div>
                    </div>
                  ) : (
                    <SelectInput
                      options={numeroAdminOptions?.options || []}
                      value={tomador.numeroAdmin.Id ? String(tomador.numeroAdmin.Id) : undefined}
                      onChange={opt => {
                        limparErro('numeroAdmin');
                        setTomadores(prev => {
                          const novo = [...prev];
                          novo[idx] = { ...novo[idx], numeroAdmin: { Id: opt.Id, Name: opt.Name } };
                          return novo;
                        });
                      }}
                      placeholder="Informe o número de administradores"
                      label="N° de admin"
                      error={erros.numeroAdmin}
                      tooltip="Selecione o número de administradores da pessoa jurídica"
                    />
                  )}
                  <InputText
                    inputName="CNPJ"
                    termo={tomador.cnpj}
                    onSetName={v => {
                      limparErro('cnpj');
                      setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], cnpj: v }; return novo; });
                    }}
                    placeholder="Digite seu CNPJ"
                    typeInput="Cnpj"
                    error={erros.cnpj}
                    tooltip="Digite o CNPJ da empresa (apenas números ou com pontos, barra e traços)"
                  />
                  <InputText
                    inputName="Digite qual o Ramo da PJ"
                    termo={tomador.ramoPJ}
                    onSetName={v => {
                      limparErro('ramoPJ');
                      setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], ramoPJ: v }; return novo; });
                    }}
                    placeholder="Informe o ramo da PJ"
                    typeInput="Text"
                    error={erros.ramoPJ}
                    tooltip="Digite o ramo de atividade da pessoa jurídica (ex: comércio, indústria, serviços)"
                  />
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 text-center">
                  Selecione o tipo de pessoa (Física ou Jurídica) para exibir os campos de documentação necessários.
                </div>
              )}
            </div>
          </fieldset>

          {/* Contato */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Contato</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="Email"
                termo={tomador.email}
                onSetName={v => {
                  limparErro('email');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], email: v }; return novo; });
                }}
                placeholder="Digite seu email"
                typeInput="Text"
                error={erros.email}
                tooltip="Digite seu email válido para contato (ex: nome@email.com)"
              />
              <InputText
                inputName="Telefone"
                termo={tomador.telefone}
                onSetName={v => {
                  limparErro('telefone');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], telefone: v }; return novo; });
                }}
                placeholder="Digite seu telefone"
                typeInput="Phone"
                error={erros.telefone}
                tooltip="Digite seu telefone com DDD (celular ou fixo)"
              />
            </div>
          </fieldset>

          {/* Endereço */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Endereço</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="CEP"
                termo={tomador.cep}
                onSetName={v => {
                  limparErro('cep');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], cep: v }; return novo; });
                }}
                placeholder="Digite o CEP"
                typeInput="Cep"
                error={erros.cep}
                tooltip="Digite o CEP do seu endereço (apenas números ou com hífen)"
              />
              <InputText
                inputName="Endereço"
                termo={tomador.endereco}
                onSetName={v => {
                  limparErro('endereco');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], endereco: v }; return novo; });
                }}
                placeholder="Digite o endereço"
                typeInput="Text"
                error={erros.endereco}
                tooltip="Digite seu endereço completo (rua, número, bairro, cidade)"
              />
            </div>
          </fieldset>

          {/* Profissional */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Profissional</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="Profissão"
                termo={tomador.profissao}
                onSetName={v => {
                  limparErro('profissao');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], profissao: v }; return novo; });
                }}
                placeholder="Digite a profissão"
                typeInput="Text"
                error={erros.profissao}
                tooltip="Digite sua profissão ou cargo atual"
              />
              <SelectInput
                options={qualificacaoProfissaoOptions?.options || []}
                value={tomador.qualificacaoProfissional.Id ? String(tomador.qualificacaoProfissional.Id) : undefined}
                onChange={opt => {
                  limparErro('qualificacaoProfissional');
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], qualificacaoProfissional: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Qualificação Profissional"
                placeholder="Digite a qualificação"
                error={erros.qualificacaoProfissional}
                tooltip="Selecione sua qualificação profissional (empregado, autônomo, empresário, etc.)"
              />
            </div>
          </fieldset>

          {/* Renda */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Renda</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                options={comprovacaoRendaFormalOptions?.options || []}
                value={tomador.comprovacaoRendaFormal.Id ? String(tomador.comprovacaoRendaFormal.Id) : undefined}
                onChange={opt => {
                  limparErro('comprovacaoRendaFormal');
                  const isNaoSeAplica = opt.Name?.toLowerCase() === 'não se aplica';
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { 
                      ...novo[idx], 
                      comprovacaoRendaFormal: { Id: opt.Id, Name: opt.Name },
                      rendaFormal: isNaoSeAplica ? 'R$ 0,00' : novo[idx].rendaFormal
                    };
                    return novo;
                  });
                }}
                label="Comprovação de renda formal"
                placeholder="Comprovação de renda formal"
                error={erros.comprovacaoRendaFormal}
                tooltip="Selecione como você comprova sua renda formal (holerite, contracheque, etc.)"
              />
              <InputText
                inputName="Renda Formal"
                termo={tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica' ? 'R$ 0,00' : tomador.rendaFormal}
                onSetName={v => {
                  limparErro('rendaFormal');
                  setTomadores(prev => { 
                    const novo = [...prev]; 
                    novo[idx] = { ...novo[idx], rendaFormal: v }; 
                    return novo; 
                  });
                }}
                placeholder="Renda formal"
                typeInput="Money"
                error={erros.rendaFormal}
                tooltip="Digite o valor da sua renda formal (salário, pró-labore, etc.)"
                disabled={tomador.comprovacaoRendaFormal?.Name?.toLowerCase() === 'não se aplica'}
              />
              <SelectInput
                options={comprovacaoRendaInformalOptions?.options || []}
                value={tomador.comprovacaoRendaInformal.Id ? String(tomador.comprovacaoRendaInformal.Id) : undefined}
                onChange={opt => {
                  limparErro('comprovacaoRendaInformal');
                  const isNaoSeAplica = opt.Name?.toLowerCase() === 'não se aplica';
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { 
                      ...novo[idx], 
                      comprovacaoRendaInformal: { Id: opt.Id, Name: opt.Name },
                      rendaInformal: isNaoSeAplica ? 'R$ 0,00' : novo[idx].rendaInformal
                    };
                    return novo;
                  });
                }}
                label="Comprovação de renda informal"
                placeholder="Comprovação de renda informal"
                error={erros.comprovacaoRendaInformal}
                tooltip="Selecione como você comprova sua renda informal (se aplicável)"
              />
              <InputText
                inputName="Renda Informal"
                termo={tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica' ? 'R$ 0,00' : tomador.rendaInformal}
                onSetName={v => {
                  limparErro('rendaInformal');
                  setTomadores(prev => { 
                    const novo = [...prev]; 
                    novo[idx] = { ...novo[idx], rendaInformal: v }; 
                    return novo; 
                  });
                }}
                placeholder="Renda informal"
                typeInput="Money"
                error={erros.rendaInformal}
                tooltip="Digite o valor da sua renda informal (freelance, bicos, etc.)"
                disabled={tomador.comprovacaoRendaInformal?.Name?.toLowerCase() === 'não se aplica'}
              />
              <div className="sm:col-span-2">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-blue-900">Renda Total Informada</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Valor total calculado automaticamente (Renda Formal + Renda Informal)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input
                      value={tomador.rendaTotalInformada}
                      onChange={() => {}} // Campo bloqueado, não permite edição
                      placeholder="Renda total (calculada automaticamente)"
                      className="relative w-full px-4 py-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 text-gray-800 font-bold text-xl shadow-lg cursor-not-allowed transition-all duration-300 hover:shadow-xl"
                      disabled={true}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <div className="flex items-center gap-2 text-blue-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold">Calculado</span>
                      </div>
                    </div>
                  </div>
                  {erros.rendaTotalInformada && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {erros.rendaTotalInformada}
                    </div>
                  )}
                  <div className="mt-3 text-sm text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800 mb-1">Valor Calculado Automaticamente</p>
                      <p className="text-blue-600 text-xs leading-relaxed">Este valor é calculado automaticamente com base nas rendas formal e informal informadas acima. O sistema soma os valores e exibe o total aqui.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => {
                setErros({});
                setMostrarErro(false);
                transitionToEtapa(etapa - 1);
              }}
            >
              Voltar
            </button>
            <button
              className="py-2 px-6 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition ml-4"
              type="button"
              onClick={() => {
                const tomadorAtual = tomadores[etapa - 1] || { ...initialTomador };
                const validacao = validarTomador(tomadorAtual);
                
                if (!validacao.valido) {
                  setErros(validacao.erros);
                  setMostrarErro(true);
                  return;
                }
                
                // Se estamos no último tomador, verificar a renda total mínima
                if (etapa === (quantidade || 0)) {
                  const rendaTotalTodosTomadores = converterValorMonetario(calcularRendaTotalTodosTomadores());
                  if (rendaTotalTodosTomadores <= 7000) {
                    setMostrarErroRendaMinima(true);
                    return;
                  }
                }
                
                setErros({});
                setMostrarErro(false);
                
                // Usar transição suave para próxima etapa
                transitionToEtapa(etapa + 1);
              }}
            >
              Próxima Etapa
            </button>
          </div>
        </form>
      </section>
    );
  };

  const renderModalErro = () => {
    if (!mostrarErro) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 text-2xl font-bold">✕</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops...</h3>
            <p className="text-gray-600 mb-6">
              Por favor, preencha todos os campos obrigatórios do Tomador {etapa}.
            </p>
            <button
              onClick={() => setMostrarErro(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModalErroEmprestimo = () => {
    if (!mostrarErroEmprestimo) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Campos Obrigatórios</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Por favor, preencha todos os campos obrigatórios antes de continuar.
          </p>
          <button
            onClick={() => setMostrarErroEmprestimo(false)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    );
  };

  const renderModalErroGarantia = () => {
    if (!mostrarErroGarantia) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Campos Obrigatórios</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Por favor, preencha todos os campos obrigatórios antes de continuar.
          </p>
          <button
            onClick={() => setMostrarErroGarantia(false)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    );
  };

  // Renderização da etapa de empréstimo (formulário preenchível)
  const renderEmprestimo = () => {
    // Verificar se as opções estão carregando
    if (verificarCarregamentoEmprestimo()) {
      return (
        <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <LoadingStep msg="Carregando opções de empréstimo..." />
        </section>
      );
    }

    return (
      <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      }`}>
        <form className="w-full space-y-6">
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Informações do Empréstimo</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={amortizacaoOptions.options}
                value={emprestimo.amortizacao?.Id || ''}
                onChange={opt => {
                  limparErroEmprestimo('amortizacao');
                  setEmprestimo(e => ({ ...e, amortizacao: { Id: opt.Id, Name: opt.Name } }));
                  localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify({ ...emprestimo, amortizacao: { Id: opt.Id, Name: opt.Name } }));
                }}
                label="Amortização Escolhida"
                placeholder="Selecione entre PRICE e SAC"
                error={errosEmprestimo.amortizacao}
                tooltip="Selecione o tipo de amortização do empréstimo (PRICE ou SAC)"
              />
              <SelectInput
                options={carenciaOptions.options}
                value={emprestimo.carencia?.Id || ''}
                onChange={opt => {
                  limparErroEmprestimo('carencia');
                  setEmprestimo(e => ({ ...e, carencia: { Id: opt.Id, Name: opt.Name } }));
                  localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify({ ...emprestimo, carencia: { Id: opt.Id, Name: opt.Name } }));
                }}
                label="Carência"
                placeholder="Selecione Carência Solicitada"
                error={errosEmprestimo.carencia}
                tooltip="Selecione se deseja carência para pagamento do empréstimo"
              />
              <InputText
                inputName="Valor Solicitado"
                termo={emprestimo.valorSolicitado}
                onSetName={v => {
                  limparErroEmprestimo('valorSolicitado');
                  setEmprestimo(e => ({ ...e, valorSolicitado: v }));
                }}
                placeholder="Informe o Valor Solicitado (R$ 75.000,00 - 5.000.000,00)"
                typeInput="Money"
                error={errosEmprestimo.valorSolicitado}
                tooltip="Digite o valor total do empréstimo que você deseja solicitar (mínimo: R$ 75.000,00, máximo: R$ 5.000.000,00)"
              />
              <InputText
                inputName="Prazo Solicitado"
                termo={emprestimo.prazoSolicitado}
                onSetName={v => {
                  limparErroEmprestimo('prazoSolicitado');
                  setEmprestimo(e => ({ ...e, prazoSolicitado: v }));
                }}
                placeholder="Digite o prazo solicitado (35-180 meses)"
                typeInput="Text"
                error={errosEmprestimo.prazoSolicitado}
                tooltip="Digite o prazo em meses para pagamento do empréstimo (mínimo: 35 meses, máximo: 180 meses)"
              />
              <InputText
                inputName="Juros Solicitado"
                termo={emprestimo.jurosSolicitado}
                onSetName={v => {
                  limparErroEmprestimo('jurosSolicitado');
                  setEmprestimo(e => ({ ...e, jurosSolicitado: v }));
                }}
                placeholder="Juros da operação"
                typeInput="Juros"
                error={errosEmprestimo.jurosSolicitado}
                tooltip="Digite a taxa de juros anual desejada para o empréstimo"
              />
              <InputText
                inputName="Parcela Solicitada"
                termo={emprestimo.parcelaSolicitada}
                onSetName={v => {
                  limparErroEmprestimo('parcelaSolicitada');
                  setEmprestimo(e => ({ ...e, parcelaSolicitada: v }));
                  localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify({ ...emprestimo, parcelaSolicitada: v }));
                }}
                placeholder="Informe o valor da parcela (R$)"
                typeInput="Money"
                error={errosEmprestimo.parcelaSolicitada}
                tooltip="O valor que o cliente deseja pagar de parcelas"
              />
              <div className="relative sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-blue-900">Renda Total</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Soma automática das rendas totais de todos os tomadores da operação</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <input
                    value={emprestimo.rendaTotal}
                    onChange={() => {}} // Campo bloqueado, não permite edição
                    placeholder="Renda total (calculada automaticamente)"
                    className="relative w-full px-4 py-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 text-gray-800 font-bold text-xl shadow-lg cursor-not-allowed transition-all duration-300 hover:shadow-xl"
                    disabled={true}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="flex items-center gap-2 text-blue-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold">Calculado</span>
                    </div>
                  </div>
                </div>
                {errosEmprestimo.rendaTotal && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errosEmprestimo.rendaTotal}
                  </div>
                )}
                <div className="mt-3 text-sm text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Soma Automática das Rendas</p>
                    <p className="text-blue-600 text-xs leading-relaxed">Este valor é calculado automaticamente somando as rendas totais de todos os tomadores cadastrados na operação.</p>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Motivo e Defesa do Crédito</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Importância da Defesa do Crédito</h4>
                      <p className="text-sm text-blue-700">
                        Esta etapa é fundamental para a análise do seu empréstimo. Descreva detalhadamente o motivo, 
                        justificativa e como o crédito será utilizado. Quanto mais detalhada e convincente for sua 
                        defesa, maiores são as chances de aprovação.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-blue-900">Defesa do Crédito *</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-400 cursor-help text-sm hover:text-blue-600 transition-colors">ⓘ</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Descreva detalhadamente o motivo do empréstimo, justificativa e como o valor será utilizado</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <textarea
                    value={emprestimo.comentarios}
                    onChange={(e) => {
                      limparErroEmprestimo('comentarios');
                      setEmprestimo(prev => ({ ...prev, comentarios: e.target.value }));
                    }}
                    placeholder="Descreva detalhadamente o motivo do empréstimo, sua justificativa e como o valor será utilizado. Seja específico e convincente para aumentar as chances de aprovação..."
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none ${
                      errosEmprestimo.comentarios 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200'
                    } focus:outline-none focus:ring-2`}
                    rows={6}
                    maxLength={2000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      Mínimo 50 caracteres • Máximo 2000 caracteres
                    </div>
                    <div className="text-xs text-gray-500">
                      {emprestimo.comentarios?.length || 0}/2000
                    </div>
                  </div>
                  {errosEmprestimo.comentarios && (
                    <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                      {errosEmprestimo.comentarios}
                    </div>
                  )}
                </div>
              </div>
              <SelectInput
                options={motivoEmprestimoOptions.options}
                value={emprestimo.motivoEmprestimo?.Id || ''}
                onChange={opt => {
                  limparErroEmprestimo('motivoEmprestimo');
                  setEmprestimo(e => ({ ...e, motivoEmprestimo: { Id: opt.Id, Name: opt.Name } }));
                  localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify({ ...emprestimo, motivoEmprestimo: { Id: opt.Id, Name: opt.Name } }));
                }}
                label="Motivo do Empréstimo"
                placeholder="Selecione o Motivo do Empréstimo"
                error={errosEmprestimo.motivoEmprestimo}
                tooltip="Selecione o principal motivo para solicitar o empréstimo"
              />
            </div>
          </fieldset>
          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => {
                setErrosEmprestimo({});
                setMostrarErroEmprestimo(false);
                transitionToEtapa(etapa - 1);
              }}
            >
              Voltar
            </button>
            <button
              className="py-2 px-6 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition ml-4"
              type="button"
              onClick={() => {
                const validacao = validarEmprestimo(emprestimo);
                if (!validacao.valido) {
                  setErrosEmprestimo(validacao.erros);
                  setMostrarErroEmprestimo(true);
                  return;
                }
                setErrosEmprestimo({});
                setMostrarErroEmprestimo(false);
                setEtapa(etapa + 1);
              }}
            >
              Próxima Etapa
            </button>
          </div>
        </form>
      </section>
    );
  };

  // Renderização da etapa de garantia (formulário preenchível)
  const renderGarantia = () => {
    // Verificar se as opções estão carregando
    if (verificarCarregamentoGarantia()) {
      return (
        <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <LoadingStep msg="Carregando opções de garantia..." />
        </section>
      );
    }

    return (
      <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      }`}>
        <form className="w-full space-y-6">
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Dados Básicos da Garantia</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={pertenceTomadorOptions.options}
                value={garantia.garantiaPertenceTomador?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('garantiaPertenceTomador');
                  setGarantia(e => ({ ...e, garantiaPertenceTomador: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, garantiaPertenceTomador: opt }));
                }}
                label="Garantia pertence ao tomador?"
                placeholder="Selecione a opção"
                error={errosGarantia.garantiaPertenceTomador}
                tooltip="Selecione se a garantia pertence ao tomador ou a terceiros"
              />
              <InputText
                inputName="Valor da Garantia"
                termo={garantia.valorGarantia}
                onSetName={v => {
                  limparErroGarantia('valorGarantia');
                  setGarantia(e => ({ ...e, valorGarantia: v }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, valorGarantia: v }));
                }}
                placeholder="Valor da garantia (R$)"
                typeInput="Money"
                error={errosGarantia.valorGarantia}
                tooltip="Digite o valor estimado da garantia (imóvel)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                options={utilizacaoGarantiaOptions.options || []}
                value={garantia.utilizacaoGarantia?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('utilizacaoGarantia');
                  setGarantia(e => ({ ...e, utilizacaoGarantia: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, utilizacaoGarantia: opt }));
                }}
                label="Qual a utilização da garantia?"
                placeholder="Selecione a opção"
                error={errosGarantia.utilizacaoGarantia}
                tooltip="Selecione qual será a utilização da garantia"
              />
              <SelectInput
                options={tipoGarantiaOptions.options || []}
                value={garantia.tipoGarantia?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('tipoGarantia');
                  setGarantia(e => ({ ...e, tipoGarantia: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, tipoGarantia: opt }));
                }}
                label="Tipo da garantia"
                placeholder="Selecione a opção"
                error={errosGarantia.tipoGarantia}
                tooltip="Selecione o tipo da garantia"
              />
            </div>
          </fieldset>

          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Localização</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={cidadeGarantiaOptions.options}
                value={garantia.cidadeGarantia?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('cidadeGarantia');
                  setGarantia(e => ({ ...e, cidadeGarantia: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, cidadeGarantia: opt }));
                }}
                label="Cidade da garantia"
                placeholder="Selecione a opção"
                error={errosGarantia.cidadeGarantia}
                tooltip="Selecione a cidade onde está localizada a garantia"
              />
              <SelectInput
                options={ruralUrbanoOptions.options}
                value={garantia.ruralUrbano?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('ruralUrbano');
                  setGarantia(e => ({ ...e, ruralUrbano: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, ruralUrbano: opt }));
                }}
                label="Selecione Rural ou Urbano"
                placeholder="Selecione a opção"
                error={errosGarantia.ruralUrbano}
                tooltip="Selecione se a garantia está em área rural ou urbana"
              />
              <InputText
                inputName="Endereço da Garantia"
                termo={garantia.enderecoGarantia}
                onSetName={v => {
                  limparErroGarantia('enderecoGarantia');
                  setGarantia(e => ({ ...e, enderecoGarantia: v }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, enderecoGarantia: v }));
                }}
                placeholder="Digite o endereço completo"
                typeInput="Text"
                error={errosGarantia.enderecoGarantia}
                tooltip="Digite o endereço completo da garantia (rua, número, bairro)"
              />
              <SelectInput
                options={unidadeFederativaOptions.options}
                value={garantia.unidadeFederativa?.Id || ''}
                onChange={opt => {
                  limparErroGarantia('unidadeFederativa');
                  setGarantia(e => ({ ...e, unidadeFederativa: opt }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, unidadeFederativa: opt }));
                }}
                label="Unidade Federativa"
                placeholder="Selecione a opção"
                error={errosGarantia.unidadeFederativa}
                tooltip="Selecione o estado onde está localizada a garantia"
              />
            </div>
          </fieldset>

          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Situação da Garantia</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={opcoesSimNao}
                value={garantia.situacaoGarantia === true ? 'true' : garantia.situacaoGarantia === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('situacaoGarantia');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, situacaoGarantia: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, situacaoGarantia: valor }));
                }}
                label="Garantia quitada?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.situacaoGarantia}
                tooltip="Selecione se a garantia está totalmente quitada ou ainda possui financiamento"
              />
            </div>
          </fieldset>

          {garantia.situacaoGarantia === false && (
            <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
              <legend className="text-blue-900 font-semibold px-2">Financiamento</legend>
              
              {/* Aviso informativo */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    Atenção: Como a garantia não está quitada, é necessário preencher as informações de financiamento abaixo.
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <SelectInput
                  options={comQuemEstaFinanciadaOptions.options}
                  value={garantia.comQuemEstaFinanciada?.Id || ''}
                  onChange={opt => {
                    limparErroGarantia('comQuemEstaFinanciada');
                    setGarantia(e => ({ ...e, comQuemEstaFinanciada: opt }));
                    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, comQuemEstaFinanciada: opt }));
                  }}
                  label="Com quem a garantia está financiada"
                  placeholder="Selecione a opção"
                  error={errosGarantia.comQuemEstaFinanciada}
                  tooltip="Selecione a instituição financeira que financia a garantia"
                />
                <InputText
                  inputName="Valor em aberto da Garantia"
                  termo={garantia.valorEmAberto || ''}
                  onSetName={v => {
                    limparErroGarantia('valorEmAberto');
                    setGarantia(e => ({ ...e, valorEmAberto: v }));
                    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, valorEmAberto: v }));
                  }}
                  placeholder="Saldo devedor (R$)"
                  typeInput="Money"
                  error={errosGarantia.valorEmAberto}
                  tooltip="Digite o valor que ainda falta pagar do financiamento da garantia"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText
                  inputName="Quantas parcelas falta"
                  termo={garantia.quantasParcelasFalta || ''}
                  onSetName={v => {
                    limparErroGarantia('quantasParcelasFalta');
                    setGarantia(e => ({ ...e, quantasParcelasFalta: v }));
                    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, quantasParcelasFalta: v }));
                  }}
                  placeholder="Quantas parcelas tem em aberto?"
                  typeInput="Text"
                  error={errosGarantia.quantasParcelasFalta}
                  tooltip="Digite quantas parcelas ainda faltam pagar do financiamento"
                />
              </div>
            </fieldset>
          )}

          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Documentação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={opcoesSimNao}
                value={garantia.escritura === true ? 'true' : garantia.escritura === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('escritura');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, escritura: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, escritura: valor }));
                }}
                label="Escritura individual?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.escritura}
                tooltip="Selecione se a escritura da garantia é individual ou em condomínio"
              />
              <SelectInput
                options={opcoesSimNao}
                value={garantia.nomeMatrícula === true ? 'true' : garantia.nomeMatrícula === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('nomeMatrícula');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, nomeMatrícula: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, nomeMatrícula: valor }));
                }}
                label="Nome está na matrícula?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.nomeMatrícula}
                tooltip="Selecione se o nome do proprietário está na matrícula da garantia"
              />
            </div>
          </fieldset>

          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Situações Especiais</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectInput
                options={opcoesSimNao}
                value={garantia.imovelAverbado === true ? 'true' : garantia.imovelAverbado === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('imovelAverbado');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, imovelAverbado: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, imovelAverbado: valor }));
                }}
                label="Imóvel averbado?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.imovelAverbado}
                tooltip="Selecione se o imóvel possui averbações (restrições) no registro"
              />
              <SelectInput
                options={opcoesSimNao}
                value={garantia.possuiUsufruto === true ? 'true' : garantia.possuiUsufruto === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('possuiUsufruto');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, possuiUsufruto: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, possuiUsufruto: valor }));
                }}
                label="Possui usufruto?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.possuiUsufruto}
                tooltip="Selecione se o imóvel possui usufruto registrado"
              />
              <SelectInput
                options={opcoesSimNao}
                value={garantia.processoInventario === true ? 'true' : garantia.processoInventario === false ? 'false' : ''}
                onChange={opt => {
                  limparErroGarantia('processoInventario');
                  const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                  setGarantia(e => ({ ...e, processoInventario: valor }));
                  localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, processoInventario: valor }));
                }}
                label="Processo de inventário?"
                placeholder="Selecione Sim ou Não"
                error={errosGarantia.processoInventario}
                tooltip="Selecione se existe processo de inventário envolvendo o imóvel"
              />
            </div>
          </fieldset>

          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4 bg-blue-50">
            <legend className="text-blue-900 font-semibold px-2">Dívidas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {garantia.ruralUrbano?.Name === 'Urbano' ? (
                <>
                  <SelectInput
                    options={opcoesSimNao}
                    value={garantia.dividaCondominio === true ? 'true' : garantia.dividaCondominio === false ? 'false' : ''}
                    onChange={opt => {
                      limparErroGarantia('dividaCondominio');
                      const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                      setGarantia(e => ({ ...e, dividaCondominio: valor }));
                      localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, dividaCondominio: valor }));
                    }}
                    label="Dívida de condomínio"
                    placeholder="Selecione Sim ou Não"
                    error={errosGarantia.dividaCondominio}
                    tooltip="Selecione se existem dívidas de condomínio em aberto"
                  />
                  <SelectInput
                    options={opcoesSimNao}
                    value={garantia.dividaIPTU === true ? 'true' : garantia.dividaIPTU === false ? 'false' : ''}
                    onChange={opt => {
                      limparErroGarantia('dividaIPTU');
                      const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                      setGarantia(e => ({ ...e, dividaIPTU: valor }));
                      localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, dividaIPTU: valor }));
                    }}
                    label="Dívida de IPTU"
                    placeholder="Selecione Sim ou Não"
                    error={errosGarantia.dividaIPTU}
                    tooltip="Selecione se existem dívidas de IPTU em aberto"
                  />
                </>
              ) : garantia.ruralUrbano?.Name === 'Rural' ? (
                <SelectInput
                  options={dividaITROptions.options}
                  value={garantia.dividaITR?.Id || ''}
                  onChange={opt => {
                    limparErroGarantia('dividaITR');
                    setGarantia(e => ({ ...e, dividaITR: opt }));
                    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, dividaITR: opt }));
                  }}
                  label="Dívida de ITR"
                  placeholder="Selecione a opção"
                  error={errosGarantia.dividaITR}
                  tooltip="Selecione se existem dívidas de ITR (Imposto Territorial Rural) em aberto"
                />
              ) : (
                <div className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    Selecione se o imóvel é Rural ou Urbano para exibir os campos de dívidas correspondentes.
                  </p>
                </div>
              )}
            </div>
          </fieldset>

          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => {
                setErrosGarantia({});
                setMostrarErroGarantia(false);
                transitionToEtapa(etapa - 1);
              }}
            >
              Voltar
            </button>
            <button
              className="py-2 px-6 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition ml-4"
              type="button"
              onClick={() => {
                const validacao = validarGarantia(garantia);
                if (!validacao.valido) {
                  setErrosGarantia(validacao.erros);
                  setMostrarErroGarantia(true);
                  return;
                }
                setErrosGarantia({});
                setMostrarErroGarantia(false);
                
                if (garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro') {
                  setShowGarantidorModal(true);
                } else {
                  // Finalizar cadastro
                  console.log('Formulário finalizado com sucesso!');
                  enviarDadosParaBackend();
                }
              }}
            >
              Finalizar Cadastro
            </button>
          </div>
        </form>
      </section>
    );
  };

  // Modal de aviso para garantidores
  const renderGarantidorModal = () => (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto z-50 flex flex-col items-center relative">
        <div className="text-blue-600 text-5xl mb-4">i</div>
        <h2 className="text-xl font-bold mb-2">Atenção!</h2>
        <p className="text-gray-700 mb-6 text-center">Como o imóvel é de terceiros, é necessário cadastrar os garantidores da operação.</p>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105 mr-4"
            onClick={() => {
              setShowGarantidorModal(false);
            }}
          >
            Cancelar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105"
            onClick={() => {
              setShowGarantidorModal(false);
              setShowQtdGarantidores(true);
              setEtapa((quantidade || 0) + 3);
            }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );

  // Etapa para escolher quantidade de garantidores
  const renderQtdGarantidores = () => (
    <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Quantidade de Garantidores</h2>
      <div className="w-full flex flex-col items-center">
        <label className="block mb-2 font-medium">Selecione a quantidade de garantidores</label>
        <SelectInput
          options={quantidadeGarantidoresOptions}
          value={qtdGarantidoresId ? String(qtdGarantidoresId) : undefined}
          onChange={opt => {
            if (opt) {
              const qtd = Number(opt.Name);
              setQtdGarantidores(qtd);
              setQtdGarantidoresId(opt.Id);
              setGarantidores(Array(qtd).fill(null).map(() => ({ ...initialGarantidor })));
              localStorage.setItem(QUANTIDADE_GARANTIDORES_STORAGE_KEY, JSON.stringify({ Id: opt.Id, Name: opt.Name }));
              console.log('Quantidade de garantidores selecionada:', { Id: opt.Id, Name: opt.Name });
            }
          }}
          label="Quantidade de Garantidores"
          placeholder="Selecione a quantidade"
          tooltip="Selecione quantos garantidores participarão do empréstimo (1 a 4)"
        />
      </div>
      <button
        className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50 mt-6"
        onClick={() => {
          setShowQtdGarantidores(false);
          transitionToEtapa((quantidade || 0) + 4);
        }}
        disabled={!qtdGarantidoresId}
      >
        Continuar
      </button>
    </section>
  );

  // Formulário de garantidores
  const renderGarantidores = () => {
    // O índice do garantidor atual é etapa - ((quantidade || 0) + 4)
    const idx = etapa - ((quantidade || 0) + 4);
    const garantidor = garantidores[idx] || { ...initialGarantidor };

    // Verificar se as opções estão carregando
    if (verificarCarregamentoGarantidores()) {
      return (
        <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <LoadingStep msg="Carregando opções de garantidores..." />
        </section>
      );
    }

    const estadoCivilOptions = estadoCivilGarantidoresOptionsArr[idx];

    console.log('Renderizando garantidor:', { idx, garantidor, totalGarantidores: garantidores.length });

    return (
      <section className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
      }`}>
        <h2 className="text-lg font-bold text-blue-900 mb-4">Garantidor {idx + 1}</h2>
        <form className="w-full space-y-6">
          {/* Dados Pessoais */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-2">
            <legend className="text-blue-900 font-semibold px-2">Dados Pessoais</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <SelectInput
                options={estadoCivilOptions.options}
                value={garantidor.estadoCivil.Id ? String(garantidor.estadoCivil.Id) : undefined}
                onChange={opt => {
                  limparErroGarantidores('estadoCivil');
                  setGarantidores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], estadoCivil: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Estado Civil"
                placeholder="Selecione o estado civil"
                error={errosGarantidores.estadoCivil}
                tooltip="Selecione o estado civil do garantidor"
              />
              <InputText
                inputName="Nome"
                termo={garantidor.nome}
                onSetName={v => {
                  limparErroGarantidores('nome');
                  setGarantidores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], nome: v }; return novo; });
                }}
                placeholder="Digite o nome"
                typeInput="Text"
                error={errosGarantidores.nome}
                tooltip="Digite o nome completo do garantidor"
              />
            </div>
          </fieldset>

          {/* Documentação */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Documentação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="CPF"
                termo={garantidor.cpf}
                onSetName={v => {
                  limparErroGarantidores('cpf');
                  setGarantidores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], cpf: v }; return novo; });
                }}
                placeholder="Digite o CPF"
                typeInput="Cpf"
                error={errosGarantidores.cpf}
                tooltip="Digite o CPF do garantidor (apenas números ou com pontos e traços)"
              />
              <InputText
                inputName="CNPJ"
                termo={garantidor.cnpj}
                onSetName={v => {
                  limparErroGarantidores('cnpj');
                  setGarantidores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], cnpj: v }; return novo; });
                }}
                placeholder="Digite o CNPJ"
                typeInput="Cnpj"
                error={errosGarantidores.cnpj}
                tooltip="Digite o CNPJ do garantidor (apenas números ou com pontos, barra e traços)"
              />
            </div>
          </fieldset>

          {/* Profissional */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Profissional</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="Profissão"
                termo={garantidor.profissao}
                onSetName={v => {
                  limparErroGarantidores('profissao');
                  setGarantidores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], profissao: v }; return novo; });
                }}
                placeholder="Digite a profissão"
                typeInput="Text"
                error={errosGarantidores.profissao}
                tooltip="Digite a profissão ou cargo atual do garantidor"
              />
              <InputText
                inputName="Email"
                termo={garantidor.email}
                onSetName={v => {
                  limparErroGarantidores('email');
                  setGarantidores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], email: v }; return novo; });
                }}
                placeholder="Digite o email"
                typeInput="Text"
                error={errosGarantidores.email}
                tooltip="Digite o email do garantidor"
              />
            </div>
          </fieldset>

          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => {
                setErrosGarantidores({});
                setMostrarErroGarantidores(false);
                transitionToEtapa(etapa - 1);
              }}
            >
              Voltar
            </button>
            <button
              className="py-2 px-6 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition ml-4"
              type="button"
              onClick={() => {
                const garantidorAtual = garantidores[idx] || { ...initialGarantidor };
                const validacao = validarGarantidor(garantidorAtual);
                
                if (!validacao.valido) {
                  setErrosGarantidores(validacao.erros);
                  setMostrarErroGarantidores(true);
                  return;
                }
                setErrosGarantidores({});
                setMostrarErroGarantidores(false);
                
                // Se a próxima etapa ainda for um garantidor, usar transição suave
                if (idx + 1 < qtdGarantidores) {
                  transitionToEtapa(etapa + 1);
                } else {
                  // Finalizar cadastro
                  console.log('Formulário finalizado com sucesso!');
                  enviarDadosParaBackend();
                }
              }}
            >
              {idx + 1 < qtdGarantidores ? 'Próximo Garantidor' : 'Finalizar Cadastro'}
            </button>
          </div>
        </form>
      </section>
    );
  };

  // Modal de erro para garantidores
  const renderModalErroGarantidores = () => (
    <div className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto z-50 flex flex-col items-center relative">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Atenção!</h2>
        <p className="text-gray-700 mb-6 text-center">Existem campos obrigatórios não preenchidos ou com dados inválidos. Verifique os campos destacados em vermelho.</p>
        <button
          className="w-full py-3 font-semibold rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105"
          onClick={() => setMostrarErroGarantidores(false)}
        >
          Entendi
        </button>
      </div>
    </div>
  );

  const renderModalErroRendaMinima = () => {
    if (!mostrarErroRendaMinima) return null;

    const rendaTotalAtual = calcularRendaTotalTodosTomadores();
    const rendaTotalNumerica = converterValorMonetario(rendaTotalAtual);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-orange-500 text-2xl font-bold">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Renda Mínima Não Atingida</h3>
            <p className="text-gray-600 mb-4">
              A renda total mínima de todos os tomadores deve ser maior que <strong>R$ 7.000,00</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-gray-700 mb-2">Renda total atual:</p>
              <p className="text-lg font-semibold text-gray-900">{rendaTotalAtual}</p>
              <p className="text-sm text-gray-500 mt-1">
                Faltam: <span className="font-semibold text-red-600">R$ {(7000 - rendaTotalNumerica).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span>
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Para continuar, você pode:
            </p>
            <ul className="text-left text-gray-600 mb-6 space-y-2">
              <li>• Adicionar mais tomadores à operação</li>
              <li>• Aumentar a renda dos tomadores existentes</li>
              <li>• Compor mais renda para atingir o valor mínimo</li>
            </ul>
            <button
              onClick={() => setMostrarErroRendaMinima(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Função para calcular renda total de todos os tomadores
  const calcularRendaTotalTodosTomadores = (): string => {
    const total = tomadores.reduce((soma, tomador) => {
      const rendaTotal = converterValorMonetario(tomador.rendaTotalInformada || 'R$ 0,00');
      return soma + rendaTotal;
    }, 0);
    return formatarValorMonetario(total);
  };

  // Função para atualizar renda total do empréstimo
  const atualizarRendaTotalEmprestimo = () => {
    const rendaTotalCalculada = calcularRendaTotalTodosTomadores();
    setEmprestimo(prev => ({ ...prev, rendaTotal: rendaTotalCalculada }));
    localStorage.setItem(EMPRESTIMO_STORAGE_KEY, JSON.stringify({ ...emprestimo, rendaTotal: rendaTotalCalculada }));
  };

  // Atualizar renda total do empréstimo sempre que os tomadores mudarem
  useEffect(() => {
    if (tomadores.length > 0) {
      const rendaTotalCalculada = calcularRendaTotalTodosTomadores();
      if (emprestimo.rendaTotal !== rendaTotalCalculada) {
        setEmprestimo(prev => ({ ...prev, rendaTotal: rendaTotalCalculada }));
      }
    }
  }, [tomadores, emprestimo.rendaTotal]);

  // Inicializar renda total quando entrar na etapa de empréstimo
  useEffect(() => {
    if (etapa === (quantidade || 0) + 1 && tomadores.length > 0) {
      const rendaTotalCalculada = calcularRendaTotalTodosTomadores();
      if (emprestimo.rendaTotal !== rendaTotalCalculada) {
        setEmprestimo(prev => ({ ...prev, rendaTotal: rendaTotalCalculada }));
      }
    }
  }, [etapa, quantidade, tomadores, emprestimo.rendaTotal]);

  // Função para scroll automático para o topo
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para transição suave entre etapas
  const transitionToEtapa = (novaEtapa: number) => {
    setIsTransitioning(true);
    setNextEtapa(novaEtapa);
    
    // Pequeno delay para permitir a animação de fade out
    setTimeout(() => {
      setEtapa(novaEtapa);
      setNextEtapa(null);
      setIsTransitioning(false);
      scrollToTop();
    }, 300);
  };

  // Overlay de transição
  const TransitionOverlay = () => {
    if (!isTransitioning) return null;
    
    return (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-40 transition-opacity duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  };

  // Overlay de loading para envio
  const LoadingEnvioOverlay = () => {
    if (!isEnviando) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enviando Dados</h3>
            <p className="text-gray-600 mb-4">
              Aguarde enquanto enviamos seus dados para análise...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Scroll automático para o topo quando a etapa mudar
  useEffect(() => {
    if (!isTransitioning) {
      scrollToTop();
    }
  }, [etapa]);

  // Função para enviar dados para o backend
  const enviarDadosParaBackend = async () => {
    setIsEnviando(true);
    try {
      console.log('🚀 Iniciando envio de dados para o backend...');
      
      // Lista de todos os campos possíveis do tomador
      const camposTomador = [
        'estadoCivil', 'tipoPessoa', 'nome', 'dataNascimento', 'email', 'telefone', 'cep', 'endereco',
        'profissao', 'qualificacaoProfissional', 'comprovacaoRendaFormal', 'rendaFormal',
        'comprovacaoRendaInformal', 'rendaInformal', 'rendaTotalInformada',
        'cpf', 'cnpj', 'ramoPJ', 'quantidadeSociosPJ', 'numeroAdmin'
      ];

      // Preparar dados dos tomadores (apenas até a quantidade selecionada, todos os campos)
      const tomadoresParaEnviar = tomadores.slice(0, quantidade || 0).map(tomador => {
        const dadosTomador: any = {};
        camposTomador.forEach(campo => {
          dadosTomador[campo] = tomador[campo] ?? "";
        });
        return dadosTomador;
      });

      console.log('📊 Tomadores preparados:', tomadoresParaEnviar);

      // Preparar dados do empréstimo
      const dadosEmprestimo = {
        amortizacao: emprestimo.amortizacao,
        carencia: emprestimo.carencia,
        valorSolicitado: emprestimo.valorSolicitado,
        rendaTotal: emprestimo.rendaTotal,
        prazoSolicitado: emprestimo.prazoSolicitado,
        jurosSolicitado: emprestimo.jurosSolicitado,
        parcelaSolicitada: emprestimo.parcelaSolicitada,
        motivoEmprestimo: emprestimo.motivoEmprestimo,
        comentarios: emprestimo.comentarios
      };

      console.log('💰 Dados do empréstimo:', dadosEmprestimo);

      // Preparar dados da garantia
      const dadosGarantia = {
        garantiaPertenceTomador: garantia.garantiaPertenceTomador,
        valorGarantia: garantia.valorGarantia,
        situacaoGarantia: garantia.situacaoGarantia,
        cidadeGarantia: garantia.cidadeGarantia,
        ruralUrbano: garantia.ruralUrbano,
        enderecoGarantia: garantia.enderecoGarantia,
        unidadeFederativa: garantia.unidadeFederativa,
        comQuemEstaFinanciada: garantia.comQuemEstaFinanciada,
        valorEmAberto: garantia.valorEmAberto,
        quantasParcelasFalta: garantia.quantasParcelasFalta,
        escritura: garantia.escritura,
        nomeNaMatricula: Boolean(garantia.nomeMatrícula),
        processoInventario: garantia.processoInventario,
        imovelAverbado: garantia.imovelAverbado,
        possuiUsufruto: garantia.possuiUsufruto,
        dividaCondominio: garantia.dividaCondominio,
        dividaIPTU: garantia.dividaIPTU,
        dividaITR: garantia.dividaITR,
        utilizacaoGarantia: garantia.utilizacaoGarantia,
        tipoGarantia: garantia.tipoGarantia
      };

      console.log('🏠 Dados da garantia:', dadosGarantia);

      // Preparar dados dos garantidores (apenas os preenchidos)
      const garantidoresParaEnviar = garantidores.slice(0, qtdGarantidores).map(garantidor => ({
        estadoCivil: garantidor.estadoCivil,
        nome: garantidor.nome,
        cpf: garantidor.cpf,
        cnpj: garantidor.cnpj,
        profissao: garantidor.profissao,
        email: garantidor.email
      }));

      console.log('👥 Garantidores preparados:', garantidoresParaEnviar);

      // Dados completos para envio
      const dadosCompletos = {
        quantidadeTomadores: { Id: quantidadeId, Name: quantidade },
        tomadores: tomadoresParaEnviar,
        emprestimo: dadosEmprestimo,
        garantia: dadosGarantia,
        quantidadeGarantidores: { Id: qtdGarantidoresId, Name: qtdGarantidores },
        garantidores: garantidoresParaEnviar,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Dados completos para envio:', dadosCompletos);
      console.log('�� Enviando para URL: http://localhost:3063/cadastro/offline/');

      // Enviar para o backend
      const response = await fetch('http://localhost:3063/cadastro/offline/env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCompletos)
      });

      console.log('📡 Resposta do servidor:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados enviados com sucesso:', result);
        console.log('🔍 Status da API:', result.status);
        console.log('🔍 Mensagem da API:', result.msg);
        
        // Capturar dados de retorno da API
        setSuccessData({
          status: result.status,
          msg: result.msg,
          nomeCompleto: result.retorno?.nomeCompleto,
          email: result.retorno?.email
        });
        setShowSuccessModal(true);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro no servidor: ${response.status} - ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Erro ao enviar dados:', error);
      setErroEnvio(error.message || 'Erro desconhecido ao enviar formulário');
      setShowModalErroEnvio(true);
    } finally {
      setIsEnviando(false);
    }
  };

  // Modal de sucesso para exibir retorno da API
  const renderModalSucesso = () => {
    if (!showSuccessModal || !successData) return null;

    // Se a API retornou dados, consideramos sucesso (mesmo que status não seja 'success')
    const isSuccess = successData.status === 'success' || 
                     successData.status === 200 || 
                     successData.status === 'OK' ||
                     (successData.msg && successData.msg.toLowerCase().includes('sucesso'));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
          <div className="flex flex-col items-center text-center">
            {/* Ícone de sucesso/erro */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isSuccess ? (
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Título */}
            <h2 className={`text-2xl font-bold mb-4 ${
              isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {isSuccess ? 'Cadastro Realizado!' : 'Erro no Cadastro'}
            </h2>

            {/* Mensagem da API */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {successData.msg || 'Operação concluída com sucesso!'}
            </p>

            {/* Informações do cliente */}
            {isSuccess && successData.nomeCompleto && (
              <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Informações do Cliente:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-blue-800">
                      <strong>Nome:</strong> {successData.nomeCompleto}
                    </span>
                  </div>
                  {successData.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-sm text-blue-800">
                        <strong>Email:</strong> {successData.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status da operação */}
            <div className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isSuccess 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {successData.status}
                </span>
              </div>
            </div>

            {/* Botão de fechar */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessData(null);
                if (isSuccess) {
                  // Se foi sucesso, limpar dados e voltar para etapa inicial
                  limparTodosOsDados();
                }
              }}
              className={`w-full py-3 px-6 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
              }`}
            >
              {isSuccess ? 'Novo Cadastro' : 'Tentar Novamente'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de erro de envio
  const renderModalErroEnvio = () => {
    if (!showModalErroEnvio) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 text-2xl font-bold">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro no Envio</h3>
            <p className="text-gray-600 mb-6">
              {erroEnvio}
            </p>
            <p className="text-gray-600 mb-6">
              O que você gostaria de fazer?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => {
                  setShowModalErroEnvio(false);
                  setErroEnvio('');
                  // Manter os dados e tentar novamente
                  enviarDadosParaBackend();
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => {
                  setShowModalErroEnvio(false);
                  setErroEnvio('');
                  // Limpar dados e começar novo cadastro
                  limparTodosOsDados();
                }}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Novo Cadastro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de confirmação para limpar dados
  const renderModalLimparDados = () => {
    if (!showModalLimparDados) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-orange-500 text-2xl font-bold">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Limpar Dados</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja apagar todos os dados preenchidos? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowModalLimparDados(false)}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowModalLimparDados(false);
                  limparTodosOsDados();
                }}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Botão de teste para debug (temporário)
  const BotaoTesteEnvio = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          console.log('🧪 Teste de envio iniciado...');
          enviarDadosParaBackend();
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
      >
        🧪 Teste Envio
      </button>
    </div>
  );

  // Ajustar renderização principal para incluir fluxo correto
  return (
    <div className="p-6 min-h-screen">
      {showGarantidorModal && renderGarantidorModal()}
      {renderBanner()}
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-start justify-center py-16">
        <div className="flex space-x-8 max-w-7xl w-full px-4">
          {renderSidebar()}
          <div className="flex-1 flex flex-col items-center max-w-8xl">
            {etapa === 0
              ? renderSelecaoQuantidade()
              : etapa > 0 && etapa <= (quantidade || 0)
                ? renderCadastroTomador()
                : etapa === (quantidade || 0) + 1
                  ? renderEmprestimo()
                  : etapa === (quantidade || 0) + 2
                    ? renderGarantia()
                    : etapa === (quantidade || 0) + 3 && garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro'
                      ? renderQtdGarantidores()
                      : etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores && garantia.garantiaPertenceTomador?.Name === 'Imóvel de terceiro'
                        ? renderGarantidores()
                        : null}
          </div>
        </div>
        {mostrarErro && renderModalErro()}
        {mostrarErroEmprestimo && renderModalErroEmprestimo()}
        {mostrarErroGarantia && renderModalErroGarantia()}
        {mostrarErroGarantidores && renderModalErroGarantidores()}
        {mostrarErroRendaMinima && renderModalErroRendaMinima()}
        {showModalErroEnvio && renderModalErroEnvio()}
        {showModalLimparDados && renderModalLimparDados()}
        {/* Botão de debug fixo no canto inferior direito */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <button
            onClick={handleDebug}
            className="bg-blue-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition font-bold text-lg tracking-wide"
            title="Debug - Ver informações do cache e dados"
          >
            Debug
          </button>
          <button
            onClick={() => {
              clearAllPloomesCache();
              alert('Cache do Ploomes limpo! Recarregue a página para buscar novos dados.');
            }}
            className="bg-orange-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-orange-700 transition font-bold text-lg tracking-wide"
            title="Limpar cache do Ploomes"
          >
            🗑️ Cache
          </button>
        </div>
      </main>
      <TransitionOverlay />
      <LoadingEnvioOverlay />
      {/* <BotaoTesteEnvio /> */}
      {showSuccessModal && renderModalSucesso()}
    </div>
  );
};

export default Formulario;
