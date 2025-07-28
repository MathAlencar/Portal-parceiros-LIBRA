import React, { useState, useEffect, Fragment } from 'react';
import { usePloomesOptions } from '@/hooks/usePloomesOptions';
import { TOMADORES_OPTIONS_IDS } from '@/hooks/ploomesOptionsIds';
import { SelectInput } from '@/components/FormMVP/SelectInput';
import { InputText } from '@/components/FormInputs/InputText';
import { QUANTIDADE_TOMADORES_OPTIONS_ID } from '@/hooks/ploomesOptionsIds';

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
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
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
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
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
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < data.getDate())) {
    return idade - 1 <= 80;
  }
  
  return idade <= 80;
};

const validarCampoVazio = (valor: string): boolean => {
  return valor && valor.trim() !== '' && valor !== 'R$ 0,00' && valor !== 'R$ 0,00' && valor !== 'Selecione uma opção' && valor !== 'Digite o nome' && valor !== 'Digite o email' && valor !== 'Digite o telefone' && valor !== 'Digite o CEP' && valor !== 'Digite o endereço' && valor !== 'Digite a profissão' && valor !== 'Renda formal' && valor !== 'Renda informal' && valor !== 'Renda total';
};

const validarCampoObjeto = (valor: any): boolean => {
  return valor && valor.Id && valor.Id !== '' && valor.Name && valor.Name !== '';
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
};

// Definições iniciais
const GARANTIDORES_STORAGE_KEY = 'ploomes_garantidores_dados';
const initialGarantidor = {
  estadoCivil: { id: '', name: '' },
  nome: '',
  cpf: '',
  cnpj: '',
  profissao: '',
};

const Formulario: React.FC = () => {
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

  const limparErro = (campo: string) => {
    setErros(prev => {
      const novosErros = { ...prev };
      delete novosErros[campo];
      return novosErros;
    });
  };

  // Estado dos dados do empréstimo
  const [emprestimo, setEmprestimo] = useState({ ...initialEmprestimo });
  const [errosEmprestimo, setErrosEmprestimo] = useState<{ [key: string]: string }>({});
  const [mostrarErroEmprestimo, setMostrarErroEmprestimo] = useState(false);

  // Estado dos dados da garantia
  const [garantia, setGarantia] = useState({ ...initialGarantia });
  const [errosGarantia, setErrosGarantia] = useState<{ [key: string]: string }>({});
  const [mostrarErroGarantia, setMostrarErroGarantia] = useState(false);

  // Estado dos dados dos garantidores
  const [garantidores, setGarantidores] = useState([{ ...initialGarantidor }]);
  const [showGarantidorModal, setShowGarantidorModal] = useState(false);
  const [showQtdGarantidores, setShowQtdGarantidores] = useState(false);
  const [showGarantidores, setShowGarantidores] = useState(false);
  const [qtdGarantidores, setQtdGarantidores] = useState(1);

  const { options, loading, error } = usePloomesOptions(QUANTIDADE_TOMADORES_OPTIONS_ID);
  const amortizacaoOptions = usePloomesOptions(44254);
  const carenciaOptions = usePloomesOptions(46299);
  const motivoEmprestimoOptions = usePloomesOptions(31247);
  // const estadoCivilOptions = usePloomesOptions(ESTADO_CIVIL_OPTIONS_ID);
  // const tipoPessoaOptions = usePloomesOptions(TIPO_PESSOA_OPTIONS_ID);
  // const qualificacaoProfissaoOptions = usePloomesOptions(QUALIFICACAO_PROFISSAO_OPTIONS_ID);
  // const comprovacaoRendaFormalOptions = usePloomesOptions(COMPROVACAO_RENDA_FORMAL_OPTIONS_ID);
  // const comprovacaoRendaInformalOptions = usePloomesOptions(COMPROVACAO_RENDA_INFORMAL_OPTIONS_ID);
  // const quantidadeSociosOptions = usePloomesOptions(QUANTIDADE_SOCIOS_OPTIONS_ID);

  // Hooks de opções para todos os tomadores (sempre na mesma ordem)
  const estadoCivilOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.estadoCivil));
  const tipoPessoaOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.tipoPessoa));
  const qualificacaoProfissaoOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.qualificacaoProfissao));
  const comprovacaoRendaFormalOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.comprovacaoRendaFormal));
  const comprovacaoRendaInformalOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.comprovacaoRendaInformal));
  const quantidadeSociosOptionsArr = TOMADORES_OPTIONS_IDS.map(ids => usePloomesOptions(ids.quantidadeSocios));

  // [Após os hooks de empréstimo, adicionar hooks da garantia]
  const pertenceTomadorOptions = usePloomesOptions(31246);
  const cidadeGarantiaOptions = usePloomesOptions(31460);
  const ruralUrbanoOptions = usePloomesOptions(46826);
  const unidadeFederativaOptions = usePloomesOptions(38986);
  const comQuemEstaFinanciadaOptions = usePloomesOptions(32453);

  // Opções Sim/Não para campos booleanos
  const opcoesSimNao = [
    { Id: 'true', Name: 'Sim' },
    { Id: 'false', Name: 'Não' }
  ];

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
    if (savedGarantia) {
      try {
        const parsed = JSON.parse(savedGarantia);
        setGarantia({ ...initialGarantia, ...parsed });
      } catch {}
    }
  }, []);

  // Salvar dados da garantia no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify(garantia));
  }, [garantia]);

  // Carregar garantidores do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(GARANTIDORES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setGarantidores(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(GARANTIDORES_STORAGE_KEY, JSON.stringify(garantidores));
  }, [garantidores]);

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

  const validarTomador = (tomador: any): { valido: boolean; erros: { [key: string]: string } } => {
    const erros: { [key: string]: string } = {};
    
    // Validação de campos obrigatórios
    if (!validarCampoVazio(tomador.nome)) {
      erros.nome = 'Nome é obrigatório';
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
      erros.dataNascimento = 'Idade máxima permitida é 80 anos';
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
    
    if (!validarCampoObjeto(tomador.comprovacaoRendaFormal)) {
      erros.comprovacaoRendaFormal = 'Comprovação de renda formal é obrigatória';
    }
    
    if (!validarCampoObjeto(tomador.comprovacaoRendaInformal)) {
      erros.comprovacaoRendaInformal = 'Comprovação de renda informal é obrigatória';
    }
    
    // Validação de campos adicionais
    if (!validarCampoVazio(tomador.profissao)) {
      erros.profissao = 'Profissão é obrigatória';
    }
    
    if (!validarCampoVazio(tomador.cep)) {
      erros.cep = 'CEP é obrigatório';
    }
    
    if (!validarCampoVazio(tomador.endereco)) {
      erros.endereco = 'Endereço é obrigatório';
    }
    
    if (!validarCampoVazio(tomador.rendaFormal)) {
      erros.rendaFormal = 'Renda formal é obrigatória';
    }
    
    if (!validarCampoVazio(tomador.rendaInformal)) {
      erros.rendaInformal = 'Renda informal é obrigatória';
    }
    
    if (!validarCampoVazio(tomador.rendaTotalInformada)) {
      erros.rendaTotalInformada = 'Renda total informada é obrigatória';
    }
    
    // Validação de campos específicos para PJ
    if (tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica') {
      if (!validarCampoObjeto(tomador.quantidadeSociosPJ)) {
        erros.quantidadeSociosPJ = 'Quantidade de sócios é obrigatória';
      }
      
      if (!validarCampoVazio(tomador.ramoPJ)) {
        erros.ramoPJ = 'Ramo da PJ é obrigatório';
      }
    }
    
    return { valido: Object.keys(erros).length === 0, erros };
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
    }
    if (!validarCampoVazio(emp.rendaTotal)) {
      erros.rendaTotal = 'Renda total é obrigatória';
    }
    if (!validarCampoVazio(emp.prazoSolicitado)) {
      erros.prazoSolicitado = 'Prazo solicitado é obrigatório';
    }
    if (!validarCampoVazio(emp.jurosSolicitado)) {
      erros.jurosSolicitado = 'Juros solicitado é obrigatório';
    }
    if (!validarCampoVazio(emp.comentarios)) {
      erros.comentarios = 'Comentários são obrigatórios';
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
      if (gar.dividaIPTU === undefined) {
        erros.dividaIPTU = 'Informe se há dívida de ITR';
      }
    }

    return { valido: Object.keys(erros).length === 0, erros };
  };

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

  // Sidebar dinâmica
  const etapasSidebar = showGarantidores
    ? [...etapas, 'Garantidores']
    : etapas;

  const renderSidebar = () => (
    <aside className="w-64 bg-white rounded-2xl shadow-lg p-6 space-y-8">
      <nav className="space-y-6">
        {etapasSidebar.map((label, idx) => {
          // Lógica para destacar a etapa correta
          let isActive = false;
          let isEnabled = false;
          if (idx === 0) {
            isActive = (etapa === 0) || (etapa > 0 && etapa <= (quantidade || 0));
            isEnabled = etapa >= 0;
          } else if (idx === 1) {
            isActive = etapa === (quantidade || 0) + 1;
            isEnabled = etapa === (quantidade || 0) + 1;
          } else if (idx === 2) {
            isActive = etapa === (quantidade || 0) + 2;
            isEnabled = etapa === (quantidade || 0) + 2;
          } else if (showGarantidores && idx === 3) {
            isActive = (showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3) || (etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores);
            isEnabled = (showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3) || (etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores);
          }
          return (
            <Fragment key={label}>
              <button
                className={`flex items-center w-full space-x-3 px-2 py-2 rounded-lg transition font-semibold text-left ${
                  isActive
                    ? 'bg-indigo-100 text-blue-900'
                    : isEnabled
                      ? 'bg-white text-gray-700 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                disabled={!isEnabled}
                onClick={() => {
                  if (!isEnabled) return;
                  if (idx === 0) setEtapa(1);
                  else if (idx === 1) setEtapa((quantidade || 0) + 1);
                  else if (idx === 2) setEtapa((quantidade || 0) + 2);
                  else if (showGarantidores && idx === 3) setEtapa((quantidade || 0) + 4);
                }}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${isActive ? 'border-blue-800 bg-blue-800 text-white' : 'border-gray-300 bg-white'}`}>
                  {idx === 0 ? '👤' : idx === 1 ? '💰' : idx === 2 ? '🏠' : '🛡️'}
                </div>
                <span className="ml-2">
                  {label}
                </span>
              </button>
              {idx < etapasSidebar.length - 1 && <hr className="border-gray-200" />}
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
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center">
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
              onChange={opt => {
                setQuantidadeId(Number(opt.Id));
                setQuantidade(Number(opt.Name));
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ Id: opt.Id, Name: opt.Name }));
                console.log('Quantidade selecionada:', { Id: opt.Id, Name: opt.Name });
              }}
            />
          )}
        </div>
        <button
          className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50"
          onClick={() => setEtapa(1)}
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

  // Formulário de cadastro de tomador
  const renderCadastroTomador = () => {
    if (showLoading) {
      return <LoadingStep msg="Carregando próximo tomador..." />;
    }
    const idx = etapa - 1;
    const tomador = tomadores[idx] || { ...initialTomador };

    const estadoCivilOptions = estadoCivilOptionsArr[idx];
    const tipoPessoaOptions = tipoPessoaOptionsArr[idx];
    const qualificacaoProfissaoOptions = qualificacaoProfissaoOptionsArr[idx];
    const comprovacaoRendaFormalOptions = comprovacaoRendaFormalOptionsArr[idx];
    const comprovacaoRendaInformalOptions = comprovacaoRendaInformalOptionsArr[idx];
    const quantidadeSociosOptions = quantidadeSociosOptionsArr[idx];

    console.log(idx)

    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Tomador {idx + 1}</h2>
        <form className="w-full space-y-6">
          {/* Dados Pessoais */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-2">
            <legend className="text-blue-900 font-semibold px-2">Dados Pessoais</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <SelectInput
                options={estadoCivilOptions.options}
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
              />
              <SelectInput
                options={tipoPessoaOptions.options}
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
                />
              ) : tomador.tipoPessoa?.Name?.toLowerCase() === 'pessoa jurídica' ? (
                <>
                  <SelectInput
                    options={quantidadeSociosOptions.options}
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
                  />
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
              />
              <SelectInput
                options={qualificacaoProfissaoOptions.options}
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
              />
            </div>
          </fieldset>

          {/* Renda */}
          <fieldset className="border border-blue-200 rounded-xl p-4 mb-4">
            <legend className="text-blue-900 font-semibold px-2">Renda</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                options={comprovacaoRendaFormalOptions.options}
                value={tomador.comprovacaoRendaFormal.Id ? String(tomador.comprovacaoRendaFormal.Id) : undefined}
                onChange={opt => {
                  limparErro('comprovacaoRendaFormal');
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], comprovacaoRendaFormal: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Comprovação de renda formal"
                placeholder="Comprovação de renda formal"
                error={erros.comprovacaoRendaFormal}
              />
              <InputText
                inputName="Renda Formal"
                termo={tomador.rendaFormal}
                onSetName={v => {
                  limparErro('rendaFormal');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], rendaFormal: v }; return novo; });
                }}
                placeholder="Renda formal"
                typeInput="Money"
                error={erros.rendaFormal}
              />
              <SelectInput
                options={comprovacaoRendaInformalOptions.options}
                value={tomador.comprovacaoRendaInformal.Id ? String(tomador.comprovacaoRendaInformal.Id) : undefined}
                onChange={opt => {
                  limparErro('comprovacaoRendaInformal');
                  setTomadores(prev => {
                    const novo = [...prev];
                    novo[idx] = { ...novo[idx], comprovacaoRendaInformal: { Id: opt.Id, Name: opt.Name } };
                    return novo;
                  });
                }}
                label="Comprovação de renda informal"
                placeholder="Comprovação de renda informal"
                error={erros.comprovacaoRendaInformal}
              />
              <InputText
                inputName="Renda Informal"
                termo={tomador.rendaInformal}
                onSetName={v => {
                  limparErro('rendaInformal');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], rendaInformal: v }; return novo; });
                }}
                placeholder="Renda informal"
                typeInput="Money"
                error={erros.rendaInformal}
              />
              <InputText
                inputName="Renda Total Informada"
                termo={tomador.rendaTotalInformada}
                onSetName={v => {
                  limparErro('rendaTotalInformada');
                  setTomadores(prev => { const novo = [...prev]; novo[idx] = { ...novo[idx], rendaTotalInformada: v }; return novo; });
                }}
                placeholder="Renda total"
                typeInput="Money"
                error={erros.rendaTotalInformada}
              />
            </div>
          </fieldset>

          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => {
                setErros({});
                setMostrarErro(false);
                setEtapa(etapa - 1);
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
                setErros({});
                setMostrarErro(false);
                // Se a próxima etapa ainda for um tomador, mostrar loading de tomador
                if (etapa < (quantidade || 0)) {
                  setShowLoading(true);
                  setTimeout(() => {
                    setShowLoading(false);
                    setEtapa(etapa + 1);
                  }, 500);
                } else {
                  // Se for para a etapa de empréstimo, apenas avança sem loading de tomador
                  setEtapa(etapa + 1);
                }
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
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar o Empréstimo..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center">
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
              />
              <InputText
                inputName="Valor Solicitado"
                termo={emprestimo.valorSolicitado}
                onSetName={v => {
                  limparErroEmprestimo('valorSolicitado');
                  setEmprestimo(e => ({ ...e, valorSolicitado: v }));
                }}
                placeholder="Informe o Valor Solicitado (R$)"
                typeInput="Money"
                error={errosEmprestimo.valorSolicitado}
              />
              <InputText
                inputName="Renda Total"
                termo={emprestimo.rendaTotal}
                onSetName={v => {
                  limparErroEmprestimo('rendaTotal');
                  setEmprestimo(e => ({ ...e, rendaTotal: v }));
                }}
                placeholder="Informe a Renda Total (R$)"
                typeInput="Money"
                error={errosEmprestimo.rendaTotal}
              />
              <InputText
                inputName="Prazo Solicitado"
                termo={emprestimo.prazoSolicitado}
                onSetName={v => {
                  limparErroEmprestimo('prazoSolicitado');
                  setEmprestimo(e => ({ ...e, prazoSolicitado: v }));
                }}
                placeholder="Digite o prazo solicitado"
                typeInput="Text"
                error={errosEmprestimo.prazoSolicitado}
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
              />
            </div>
            <h3 className="font-bold text-blue-900 mb-2 mt-6">Motivo e Comentários</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputText
                inputName="Comentários"
                termo={emprestimo.comentarios}
                onSetName={v => {
                  limparErroEmprestimo('comentarios');
                  setEmprestimo(e => ({ ...e, comentarios: v }));
                }}
                placeholder="Comentários sobre o motivo"
                typeInput="Text"
                error={errosEmprestimo.comentarios}
              />
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
              />
            </div>
          </fieldset>
          <div className="flex w-full justify-between mt-6">
            <button
              className="py-2 px-6 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              type="button"
              onClick={() => setEtapa(etapa - 1)}
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
    if (showLoading) {
      return <LoadingStep msg="Agora iremos cadastrar a Garantia..." />;
    }
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center justify-center">
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
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                  />
                </>
              ) : garantia.ruralUrbano?.Name === 'Rural' ? (
                <SelectInput
                  options={opcoesSimNao}
                  value={garantia.dividaIPTU === true ? 'true' : garantia.dividaIPTU === false ? 'false' : ''}
                  onChange={opt => {
                    limparErroGarantia('dividaIPTU');
                    const valor = opt && opt.Id ? opt.Id === 'true' : undefined;
                    setGarantia(e => ({ ...e, dividaIPTU: valor }));
                    localStorage.setItem(GARANTIA_STORAGE_KEY, JSON.stringify({ ...garantia, dividaIPTU: valor }));
                  }}
                  label="Dívida de ITR"
                  placeholder="Selecione Sim ou Não"
                  error={errosGarantia.dividaIPTU}
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
                setEtapa(etapa - 1);
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
        <select
          className="border rounded px-4 py-2 w-40 text-center"
          value={qtdGarantidores}
          onChange={e => {
            const qtd = Number(e.target.value);
            setQtdGarantidores(qtd);
            setGarantidores(Array(qtd).fill(null).map(() => ({ ...initialGarantidor })));
          }}
        >
          {[1, 2, 3, 4].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <button
        className="w-full py-3 font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105 disabled:opacity-50 mt-6"
        onClick={() => {
          setShowQtdGarantidores(false);
          setEtapa((quantidade || 0) + 4);
        }}
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
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Garantidor {idx + 1}</h2>
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <SelectInput
              options={options} // Assuming options is available globally or passed as prop
              value={garantidor.estadoCivil.id ? String(garantidor.estadoCivil.id) : undefined}
              onChange={opt => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], estadoCivil: { id: opt.Id, name: opt.Name } };
                  return novo;
                });
              }}
              placeholder="Selecione o estado civil"
            />
            <InputText
              inputName="Nome"
              termo={garantidor.nome}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], nome: v };
                  return novo;
                });
              }}
              placeholder="Digite o nome"
              typeInput="Text"
            />
            <InputText
              inputName="CPF"
              termo={garantidor.cpf}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], cpf: v };
                  return novo;
                });
              }}
              placeholder="Digite o CPF"
              typeInput="Cpf"
            />
            <InputText
              inputName="CNPJ"
              termo={garantidor.cnpj}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], cnpj: v };
                  return novo;
                });
              }}
              placeholder="Digite o CNPJ"
              typeInput="Cnpj"
            />
            <InputText
              inputName="Profissão"
              termo={garantidor.profissao}
              onSetName={v => {
                setGarantidores(prev => {
                  const novo = [...prev];
                  novo[idx] = { ...novo[idx], profissao: v };
                  return novo;
                });
              }}
              placeholder="Digite o nome do garantidor"
              typeInput="Text"
            />
          </div>
        </div>
        <div className="flex w-full justify-between mt-2">
          <button
            className="flex-1 py-2 font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105"
            onClick={() => {
              if (idx > 0) setEtapa(etapa - 1);
              else setEtapa((quantidade || 0) + 2);
            }}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2 font-medium rounded-full bg-blue-700 text-white hover:bg-blue-800 transition transform hover:scale-105 ml-4"
            onClick={() => {
              if (idx + 1 < qtdGarantidores) {
                setEtapa(etapa + 1);
              } else {
                alert('Cadastro finalizado!');
              }
            }}
          >
            {idx + 1 < qtdGarantidores ? 'Próximo Garantidor' : 'Finalizar Cadastro'}
          </button>
        </div>
      </section>
    );
  };

  // Ajustar renderização principal para incluir fluxo correto
  return (
    <>
      {showGarantidorModal && renderGarantidorModal()}
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
                    : showGarantidores && showQtdGarantidores && etapa === (quantidade || 0) + 3
                      ? renderQtdGarantidores()
                      : showGarantidores && etapa >= (quantidade || 0) + 4 && etapa < (quantidade || 0) + 4 + qtdGarantidores
                        ? renderGarantidores()
                        : null}
          </div>
        </div>
        {renderModalErro()}
        {renderModalErroEmprestimo()}
        {renderModalErroGarantia()}
        {/* Botão de debug fixo no canto inferior direito */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <button
            onClick={handleDebug}
            className="bg-blue-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition font-bold text-lg tracking-wide"
          >
            Debug
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              alert('LocalStorage limpo!');
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-red-700 transition font-bold text-lg tracking-wide"
          >
            Limpar Dados
          </button>
        </div>
      </main>
    </>
  );
};

export default Formulario;
