import axios from "axios";
import { Registro } from '../models/Registros';

const url = 'http://homologacao.plugboleto.com.br/api/v1/boletos/lote';

const headers = {
  'cnpj-sh': '12067625000150',
  'token-sh': 'a60c428fbfcafa73bc8eda5e9b7fee4e',
  'cnpj-cedente': '16123920000137',
  'Content-Type': 'application/json',
};

// Configurações específicas para cada banco
const bancosConfig: {
  [key: string]: {
    cedenteContaNumero: string;
    cedenteContaNumeroDV: string;
    cedenteConvenioNumero: string;
    cedenteContaCodigoBanco: string;
  };
} = {
  bancoBB: {
    cedenteContaNumero: '07081',
    cedenteContaNumeroDV: '4',
    cedenteConvenioNumero: '12345',
    cedenteContaCodigoBanco: '001',
  },
  bancoITAU: {
    cedenteContaNumero: '82735',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '3213827352',
    cedenteContaCodigoBanco: '341',
  },
  bancoCAIXA: {
    cedenteContaNumero: '4123',
    cedenteContaNumeroDV: '4',
    cedenteConvenioNumero: '926364',
    cedenteContaCodigoBanco: '104',
  },
  bancoINTER: {
    cedenteContaNumero: '9263',
    cedenteContaNumeroDV: '1',
    cedenteConvenioNumero: '9263',
    cedenteContaCodigoBanco: '077',
  },
  bancoSANTANDER: {
    cedenteContaNumero: '452131',
    cedenteContaNumeroDV: '4',
    cedenteConvenioNumero: '9821',
    cedenteContaCodigoBanco: '033',
  },
  bancoSICREDI: {
    cedenteContaNumero: '82631',
    cedenteContaNumeroDV: '7',
    cedenteConvenioNumero: '82631',
    cedenteContaCodigoBanco: '748',
  },bancoSICOOB: {
    cedenteContaNumero: '832716',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '274311',
    cedenteContaCodigoBanco: '756',
  },
  bancoBANRISUL: {
    cedenteContaNumero: '827364519',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '827353212',
    cedenteContaCodigoBanco: '041',
  },
};

// Função para gerar os dados do boleto usando a configuração do banco
function criarDataBoleto(banco: string): any {
  const config = bancosConfig[banco];
  
  if (!config) {
    throw new Error(`Configuração do banco "${banco}" não encontrada.`);
  }
  
  const dadosBoleto: any = {
    CedenteContaNumero: config.cedenteContaNumero,
    CedenteContaNumeroDV: config.cedenteContaNumeroDV,
    CedenteConvenioNumero: config.cedenteConvenioNumero,
    CedenteContaCodigoBanco: config.cedenteContaCodigoBanco,

    SacadoCPFCNPJ: "12495135960",
    SacadoEnderecoNumero: "4123",
    SacadoEnderecoBairro: "Centro",
    SacadoEnderecoCEP: "87080145",
    SacadoEnderecoCidade: "Maringá",
    SacadoEnderecoComplemento: "Frente",
    SacadoEnderecoLogradouro: "Rua Aviário, 423",
    SacadoEnderecoPais: "Brasil",
    SacadoEnderecoUF: "PR",
    SacadoNome: "Teste",
    SacadoTelefone: "44999111111",
    SacadoCelular: "44999111111",
    SacadoEmail: "thiagohinobu42@gmail.com",
    
    TituloDataEmissao: "05/10/2024",
    TituloDataVencimento: "20/11/2024",
    TituloMensagem01: "Juros 0,25 ao dia",
    TituloMensagem02: "Não receber apos 30 dias de atraso",
    TituloMensagem03: "titulo sujeito a protesto apos 30 dias",
    
    TituloNumeroDocumento: "200",
    TituloValor: "500,00",
    TituloLocalPagamento: "Pagavel preferencialmente na ag bb",
    TituloCodigoJuros: "1",
    TituloDataJuros: "21/11/2024",
    TituloValorJuros: "1,00",
    TituloInstrucao1: "1",
    TituloInstrucaoPrazo1: "10",
    hibrido: true,
  };

  // Adiciona "TituloNossoNumero" apenas se o banco não for o Banco Inter
  if (banco !== 'bancoINTER') {
    dadosBoleto.TituloNossoNumero = "2394";
  }

  return [dadosBoleto];
}

// Função principal para criar e registrar o boleto
export async function criarBoletoERegistrar(banco: string) {
  const start = Date.now(); // Inicia o tempo de resposta

  try {
    const data = criarDataBoleto(banco);
    const response = await axios.post(url, data, { headers });
    
    const tempo = Date.now() - start; // Calcula o tempo de resposta
    const codigoStatus = response.status; // Captura o código de status da resposta HTTP
    const erro = response.data.erro || null;
    const statusBanco = 'online';

    // Salva o registro no banco de dados
    await Registro.create({
      nome_banco: banco, // Agora armazena o nome do banco
      tempo,
      codigo: codigoStatus, // Armazena o código de status da resposta
      erro,
      disparado_em: new Date(),
      statusBanco,
    });

    console.log(`Resposta do servidor para ${banco}:`, response.data);
    
  } catch (error: any) {
    const tempo = Date.now() - start; // Tempo de resposta em caso de erro
    const erro = error.message || "Erro desconhecido";
    const codigoStatus = error.response?.status || "N/A"; // Captura o código de status em caso de erro
    const statusBanco = 'offline';

    // Salva o erro no banco de dados
    await Registro.create({
      nome_banco: banco, // Armazena o nome do banco
      tempo,
      codigo: codigoStatus, // Armazena o código de status do erro
      erro,
      disparado_em: new Date(),
      statusBanco,
    });

    console.error(`Erro ao enviar a requisição para ${banco}:`, error.message);
  }
}

// Função para criar boletos para todos os bancos
export async function criarBoletosParaTodosOsBancos() {
  for (const banco in bancosConfig) {
    await criarBoletoERegistrar(banco);
  }
}

// Chama a função para criar boletos para todos os bancos
criarBoletosParaTodosOsBancos();


