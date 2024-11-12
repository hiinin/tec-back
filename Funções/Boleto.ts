import axios from "axios";

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
  banco1: {
    cedenteContaNumero: '07081',
    cedenteContaNumeroDV: '4',
    cedenteConvenioNumero: '12345',
    cedenteContaCodigoBanco: '001',
  },
  banco2: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco3: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco4: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco5: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco6: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco7: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
  banco8: {
    cedenteContaNumero: '07021',
    cedenteContaNumeroDV: '2',
    cedenteConvenioNumero: '54321',
    cedenteContaCodigoBanco: '002',
  },
};

// Função para gerar os dados do boleto usando a configuração do banco
function criarDataBoleto(banco: string): any {
  const config = bancosConfig[banco];
  return [
    {
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
      
      TituloNossoNumero: "7293",
      TituloNumeroDocumento: "200",
      TituloValor: "500,00",
      TituloLocalPagamento: "Pagavel preferencialmente na ag bb",
      TituloCodigoJuros: "1",
      TituloDataJuros: "21/11/2024",
      TituloValorJuros: "1,00",
      TituloInstrucao1: "1",
      TituloInstrucaoPrazo1: "10",
      hibrido: true,
    }
  ];
}

// Função principal para criar e registrar o boleto
export async function criarBoletoERegistrar(banco: string) {
  try {
    const data = criarDataBoleto(banco);

    const response = await axios.post(url, data, { headers });
    
    console.log("Resposta do servidor:", response.data);
  } catch (error) {
    console.error("Erro ao enviar a requisição:", error);
  }
}

// Exemplo de uso, definindo o banco como 'bancoBrasil'
criarBoletoERegistrar('bancoBrasil');
