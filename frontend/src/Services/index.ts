// Função para buscar dados da API
export const fetchData = async (): Promise<any> => {
  try {
    const response = await fetch("http://localhost:3000/registros");

    // Verifica se a resposta está OK
    if (!response.ok) {
      throw new Error(`Erro: ${response.statusText} (Status: ${response.status})`);
    }

    // Converte a resposta para JSON
    const data = await response.json();
    return data;

  } catch (error) {
    // Trata erros de requisição
    console.error("Erro ao buscar dados da API:", error);
    throw error; // Repassa o erro para que a chamada original saiba
  }
};
