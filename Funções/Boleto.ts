import axios from "axios";
import { Registro } from "../models/Registros";

// Função para criar o boleto e registrar os dados no banco
export async function criarBoletoERegistrar() {
  const url = 'http://homologacao.plugboleto.com.br/api/v1/boletos/lote';  // Substitua pela URL do seu endpoint

  const headers = {
    'cnpj-sh': '12067625000150',
    'token-sh': 'a60c428fbfcafa73bc8eda5e9b7fee4e',
    'cnpj-cedente': '16123920000137',
    'Content-Type': 'application/json',
  };

  interface BoletoRequest {
    CedenteContaNumero: string;
    CedenteContaNumeroDV: string;
    CedenteConvenioNumero: string;
    CedenteContaCodigoBanco: string;
    SacadoCPFCNPJ: string;
    SacadoEnderecoNumero: string;
    SacadoEnderecoBairro: string;
    SacadoEnderecoCEP: string;
    SacadoEnderecoCidade: string;
    SacadoEnderecoComplemento: string;
    SacadoEnderecoLogradouro: string;
    SacadoEnderecoPais: string;
    SacadoEnderecoUF: string;
    SacadoNome: string;
    SacadoTelefone: string;
    SacadoCelular: string;
    SacadoEmail: string;
    TituloDataEmissao: string;
    TituloDataVencimento: string;
    TituloMensagem01: string;
    TituloMensagem02: string;
    TituloMensagem03: string;
    TituloNossoNumero: string;
    TituloNumeroDocumento: string;
    TituloValor: string;
    TituloLocalPagamento: string;
    TituloCodigoJuros: string;
    TituloDataJuros: string;
    TituloValorJuros: string;
    TituloInstrucao1: string;
    TituloInstrucaoPrazo1: string;
    hibrido: boolean;
  }

  const data: BoletoRequest = {
    CedenteContaNumero: "",
    CedenteContaNumeroDV: "",
    CedenteConvenioNumero: "",
    CedenteContaCodigoBanco: "",
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
    TituloNossoNumero: "1243",
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

  try {
    // Enviando os dados para criar o boleto
    const response = await axios.post(url, data, { headers });
    console.log('Boleto criado com sucesso:', response.data);

    // Agora, vamos salvar os dados no banco de dados (Tabela de Registros)
    const tempoResposta = 2000; // Exemplo de tempo, você pode medir o tempo real de resposta da API
    const codigo = response.data.status || '200'; // Supondo que a resposta tenha um status
    const erro = response.data.erro || null; // Supondo que a resposta tenha um campo erro
    const disparadoEm = new Date();

    // Criando o registro no banco de dados
    const registro = await Registro.create({
      id_banco: 1,  // Aqui você coloca o ID do banco de dados, se for necessário
      tempo: tempoResposta,
      codigo: codigo,
      erro: erro,
      disparado_em: disparadoEm,
    });

    console.log('Registro salvo no banco de dados:', registro);
  } catch (error: unknown) {
    // Tratando o erro, se for do tipo Error
    if (error instanceof Error) {
      console.error('Erro ao criar boleto ou salvar no banco de dados:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }
  }
}


