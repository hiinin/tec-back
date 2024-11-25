// Dashboard.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, ReferenceLine, Scatter, TooltipProps } from "recharts";
import React from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Interface para tipar os dados
interface DataPoint {
  id: number;
  nome_banco: string;
  tempo: number;
  erro: string | null;
  codigo: string;
  disparado_em: string;
  statusBanco: string;
  createdAt: string;
  updatedAt: string;
}

const fetchBankStatus = async () => {
  const response = await fetch('http://localhost:5000/registros'); // Substitua pelo endpoint correto
  const data = await response.json();
  return data; // Exemplo: [{ nome_banco: 'bancoBB', statusBanco: 'online' }, ...]
};

export default function Dashboard() {
  const [data, setData] = useState<DataPoint[]>([]); // Todos os dados
  const [selectedBank, setSelectedBank] = useState<string>(""); // Banco selecionado
  const [banks, setBanks] = useState<string[]>([]); // Lista de bancos
  const [banksStatus, setBanksStatus] = useState<Status[]>([]); // Status dos bancos
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h'); // Período selecionado
  const [isErrorView, setIsErrorView] = useState(false); // Estado para alternar entre erros e gráfico de tempo
  const filteredErrorData = data.filter((item) => item.erro !== null && item.erro !== "");
  const [bancoSelecionado, setBancoSelecionado] = useState<string>("BB");

  const bancos = [
    "bancoBB", 
    "bancoITAU", 
    "bancoCAIXA", 
    "bancoINTER", 
    "bancoSANTANDER", 
    "bancoSICREDI", 
    "bancoSICOOB", 
    "bancoBANRISUL"
  ];

  useEffect(() => {
    // Carrega os status dos bancos quando o componente é montado
    const loadBankStatus = async () => {
      const statusData = await fetchBankStatus();
      setBanksStatus(statusData);
    };

    loadBankStatus();
  }, []); 
  
  const imagensDosBancos: Record<string, string> = {
    "bancoBB": "/images/bb.jfif",
    "bancoITAU": "/images/itau.jfif",
    "bancoCAIXA": "/images/caixa.jfif",
    "bancoINTER": "/images/inter.jfif",
    "bancoSANTANDER": "/images/santander.jfif",
    "bancoSICREDI": "/images/sicredi.jfif",
    "bancoSICOOB": "/images/sicoob.jfif",
    "bancoBANRISUL": "/images/banrisul.jfif",
  };
  
  const bancoMap: Record<string, string> = {
    bancoBB: "Banco do Brasil",
    bancoCAIXA: "Caixa",
    bancoITAU: "Itaú",
    bancoINTER: "Banco Inter",
    bancoSANTANDER: "Santander",
    bancoSICREDI: "Sicredi",
    bancoSICOOB: "Sicoob",
    bancoBANRISUL: "Banrisul",
  };

  
  interface Status {
    nome_banco: string;
    statusBanco: 'online' | 'offline';  // Estado do banco (online ou offline)
  }
  
  interface StatusButtonProps {
    status: Status;
    onClick: () => void;
  }
  
  


  // Função para buscar os dados da API
  const fetchData = async (): Promise<DataPoint[]> => {
    try {
      const response = await fetch("http://localhost:5000/registros");
      if (!response.ok) {
        throw new Error(`Erro: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
      throw error;
    }
  };

  // Função para obter os bancos
  const getBanks = (data: DataPoint[]) => {
    const uniqueBanks = Array.from(new Set(data.map((item) => item.nome_banco)));
    setBanks(uniqueBanks); // Atualiza a lista de bancos
  };

// Modificando o useMemo para garantir a filtragem após carregar os dados
useEffect(() => {
  const getData = async () => {
    try {
      const result = await fetchData();
      setData(result);
      getBanks(result);
    } catch (error) {
      console.error("Erro ao processar os dados:", error);
    }
  };
  getData();
}, []); // Carrega os dados uma vez ao montar o componente

const filteredData = useMemo(() => {
  console.log("Período selecionado:", selectedPeriod);
  console.log("Data antes de filtrar:", data);  // Verifica os dados antes de filtrar
  const now = new Date();
  let filtered = [...data];

  if (selectedBank) {
    filtered = filtered.filter((item) => item.nome_banco === selectedBank);
  }

  switch (selectedPeriod) {
    case '24h':
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.disparado_em);
        return now.getTime() - itemDate.getTime() <= 24 * 60 * 60 * 1000;
      });
      break;
    case '7d':
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.disparado_em);
        return now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      });
      break;
    case '30d':
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.disparado_em);
        return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      });
      break;
    default:
      break;
  }

  console.log("Data filtrada:", filtered);  // Verifica os dados filtrados
  return filtered;
}, [selectedBank, selectedPeriod, data]);



// Função de formatação para exibir apenas a hora e minuto
const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Verifique se a data é válida
  if (isNaN(date.getTime())) {
    return '';  // Retorna vazio se a data for inválida
  }

  // Formata a data para hora e minuto, e garante o formato correto
  return format(date, 'HH:mm');
};

  // Função para alternar a visualização
  const toggleViewMode = () => {
    setIsErrorView((prev) => !prev); // Alterna entre visualização de erro e gráfico de tempo
  };

  // Tooltip para mostrar erros ao deixar mouse em cima
  const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { tempo, erro, disparado_em } = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#1c1c1c",
            color: "#ffffff",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
        >
          <p><strong>Tempo (ms):</strong> {tempo}</p>
          <p><strong>Erro:</strong> {erro ? "Sim" : "Não"}</p>
          <p><strong>Criado em:</strong> {disparado_em}:00</p>
        </div>
      );
    }
    return null;
  };

  const selecionarBanco = (nomeBanco: string) => {
    setBancoSelecionado(nomeBanco); // Atualiza o banco selecionado
    setSelectedBank(nomeBanco); // Filtra os dados pelo banco selecionado
  };

  

  // Função para gerar o gráfico de erros
  const errorData = filteredData.filter(item => item.erro); // Filtra apenas os itens com erro

  return (
    <main className="dashboard-container">
      <div className="sidebar">
          <img 
            src="/images/tecnospeed.jpeg" 
            alt="Logo Tecnosped" 
            className="sidebar-image" 
          />
        <div className="bank-buttons">
        {banks.map((bank, index) => (
          <button
            key={index}
            onClick={() => setSelectedBank(bank)} // Seleciona o banco e atualiza os dados
            className={`bank-button ${selectedBank === bank ? "selected" : ""}`}
          >
            {/* Verifica se a imagem existe para o banco */}
            <img
              src={imagensDosBancos[bank]}
              alt={bank}
              style={{ marginRight: 10 }}
            />
            <span className="bank-name">{bancoMap[bank] || bank}</span>
            {/* Bolinha de status (verde ou vermelha) */}
            <div
                    className={`status-bullet ${banksStatus.find(b => b.nome_banco === bank)?.statusBanco === "online" ? "online" : "offline"}`}
                  />
          </button>
          ))}
          </div>

          <div className="period-buttons">
            <button
              onClick={() => setSelectedPeriod('24h')}
              className={selectedPeriod === '24h' ? 'selected' : ''}
            >
              24h
            </button>
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={selectedPeriod === '7d' ? 'selected' : ''}
            >
              7 dias
            </button>
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={selectedPeriod === '30d' ? 'selected' : ''}
            >
              1 mês
            </button>
            <button
              onClick={toggleViewMode}
              className={`toggle-view-button ${isErrorView ? 'active' : ''}`}
              title="Alternar entre gráfico de tempo e erros"
            >
              {isErrorView ? "⏱️" : "⚠️"}
            </button>
          </div>
        </div>

      {/* Gráfico ou tabela com base no modo de visualização */}
      <div className="chart-container">
        {isErrorView ? (
          /* Gráfico de erros */
          <ResponsiveContainer width="100%" height={807}>
            <BarChart
              data={errorData.reduce((acc, item) => {
                // Extrair a hora do campo `disparado_em`
                const hour = new Date(item.disparado_em).getHours();
                const existingHour = acc.find((entry) => entry.hour === hour);

                if (existingHour) {
                  existingHour.erros += 1; // Incrementa os erros na hora já existente
                  if (item.erro) {
                    existingHour.erroNomes.push(item.erro); // Adiciona o nome do erro
                  }
                } else {
                  acc.push({
                    hour,
                    erros: 1, // Inicializa o contador de erros
                    erroNomes: item.erro ? [item.erro] : [], // Inicializa o array de nomes de erros
                  });
                }

                return acc;
              }, [] as { hour: number; erros: number; erroNomes: string[] }[])}
              style={{ backgroundColor: "#0a0b11" }}
              margin={{ top: 20, right: 55, left: 20, bottom: 35 }}
            >
              <CartesianGrid stroke="#4F5566" strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickCount={10}
                tick={(props) => (
                  <text {...props} fill="#FFFFFF" textAnchor="middle" dy={10} fontSize={12} />
                )}
                angle={-45}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#FFFFFF" }}
                domain={[0, 9]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload; // Dados do ponto atual

                    // Formatar o dia e a hora para exibição
                    const formattedDate = new Date(dataPoint.fullDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });

                    return (
                      <div
                        style={{
                          backgroundColor: "#1c1c1c",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #444",
                        }}
                      >
                        <p><strong>Dia:</strong> {formattedDate}</p>
                        <p><strong>Hora:</strong> {dataPoint.hour}:00</p>
                        <p>
                          <strong>Erros:</strong>{" "}
                          {dataPoint.erroNomes.length > 0
                            ? dataPoint.erroNomes.join(", ") // Lista os erros
                            : "Nenhum"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend layout="horizontal" verticalAlign="top" align="center" />
              <Bar dataKey="erros" fill="#FF2F2F" />
            </BarChart>
          </ResponsiveContainer>

        ) : (
          // Gráfico normal de tempo (como anteriormente)
          <ResponsiveContainer width="100%" height={807}>
            <LineChart
              data={filteredData.slice(-50)} // Usando os dados filtrados sem erro
              
              style={{ backgroundColor: "#0a0b11" }}
              margin={{ top: 20, right: 55, left: 20, bottom: -35 }}
            >
              <CartesianGrid stroke="#4F5566" strokeDasharray="none" horizontal={true} vertical={true} />
              <XAxis
                dataKey="disparado_em"
                angle={-45}
                textAnchor="end"
                height={120}
                tickFormatter={formatDate}  // Formata a data usando a função personalizada
                tick={{ fill: "#FFFFFF" }}
                interval={0}
              />
              <YAxis
                domain={[100, 1000]}
                ticks={[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]}
                tick={{ fill: "#FFFFFF" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="top" align="center" />
              <Line
                dataKey="tempo"
                stroke="#B4F22E"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  let fill = "#B4F22E";

                  if (payload.erro) {
                    fill = "#FF2F2F"; // Vermelho para erro
                  } else if (payload.tempo > 500) {
                    fill = "#FFDE2F"; // Amarelo para tempo acima de 500ms
                  }

                  return (
                    <circle cx={cx} cy={cy} r={5} fill={fill} stroke={fill} strokeWidth={2} />
                  );
                }}
              />
              <ReferenceLine
                y={200}
                stroke="#B4F22E" // Cor da linha
                strokeDasharray="none" // Linha tracejada
                label={{
                  position: "insideTopRight",
                  fill: "#FF5722",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="ad">
        <a href="https/youtube.com">AD</a>
      </div>
    </main>
  );
}
