// Dashboard.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { ReferenceLine, Scatter, TooltipProps } from "recharts";
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

export default function Dashboard() {
  const [data, setData] = useState<DataPoint[]>([]); // Todos os dados
  const [selectedBank, setSelectedBank] = useState<string>(""); // Banco selecionado
  const [banks, setBanks] = useState<string[]>([]); // Lista de bancos
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h'); // Período selecionado
  const [isErrorView, setIsErrorView] = useState(false); // Estado para alternar entre erros e gráfico de tempo

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

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData();
        setData(result);
        getBanks(result); // Atualiza a lista de bancos ao receber os dados
      } catch (error) {
        console.error("Erro ao processar os dados:", error);
      }
    };

    getData();
  }, []);

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "HH:mm"); // Formata a data para hora e minuto
  };

  // Função para filtrar os dados com base no período selecionado e no banco
  const filteredData = useMemo(() => {
    const now = new Date();
    let filtered = [...data];

    // Filtra pelo banco selecionado, se houver
    if (selectedBank) {
      filtered = filtered.filter((item) => item.nome_banco === selectedBank);
    }

    // Filtra pelo período selecionado
    switch (selectedPeriod) {
      case '24h':
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 24 * 60 * 60 * 1000; // 24 horas em ms
        });
        break;
      case '7d':
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
        });
        break;
      case '30d':
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedBank, selectedPeriod, data]);

  // Função para alternar a visualização
  const toggleViewMode = () => {
    setIsErrorView((prev) => !prev); // Alterna entre visualização de erro e gráfico de tempo
  };

  // Tooltip customizado para o gráfico
  const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { tempo, erro, disparado_em } = payload[0].payload;
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
          <p><strong>Tempo (ms):</strong> {tempo}</p>
          <p><strong>Erro:</strong> {erro ? "Sim" : "Não"}</p>
          <p><strong>Criado em:</strong> {disparado_em}</p>
        </div>
      );
    }
    return null;
  };

  // Função para gerar o gráfico de erros
  const errorData = filteredData.filter(item => item.erro); // Filtra apenas os itens com erro

  return (
    <main className="dashboard-container">
      {/* Barra lateral de bancos */}
      <div className="sidebar">
        <div className="bank-buttons">
          {banks.map((bank, index) => (
            <button
              key={index}
              onClick={() => setSelectedBank(bank)}
              className={`bank-button ${selectedBank === bank ? "selected" : ""}`}
            >
              {bank}
            </button>
          ))}
          <button
            onClick={() => setSelectedBank("")}
            className={`bank-button ${selectedBank === "" ? "selected" : ""}`}
          >
            Todos os Bancos
          </button>
        </div>

        {/* Botões para alternar entre os períodos */}
        <div className="period-buttons">
          <button 
            onClick={() => setSelectedPeriod('24h')} 
            className={selectedPeriod === '24h' ? 'selected' : ''}
          >
            Últimas 24h
          </button>
          <button 
            onClick={() => setSelectedPeriod('7d')} 
            className={selectedPeriod === '7d' ? 'selected' : ''}
          >
            Últimos 7 dias
          </button>
          <button 
            onClick={() => setSelectedPeriod('30d')} 
            className={selectedPeriod === '30d' ? 'selected' : ''}
          >
            Último mês
          </button>
          {/* Botão para alternar entre os modos de visualização */}
          <button 
            onClick={toggleViewMode} // Alterna a visualização
            className={`toggle-view-button ${isErrorView ? 'active' : ''}`} // Adiciona classe "active" quando estiver no modo de erros
            title="Alternar entre gráfico de tempo e erros"
          >
            {isErrorView ? "⚠️" : "⏱️"} {/* Ícone do botão */}
          </button>
        </div>
      </div>

      {/* Gráfico ou tabela com base no modo de visualização */}
      <div className="chart-container">
        {isErrorView ? (
          // Gráfico de erros
          <ResponsiveContainer width="100%" height={700}>
            <LineChart
              data={errorData.slice(-20)} // Usando dados filtrados com erro
              style={{ backgroundColor: "#0a0b11" }}
              margin={{ top: 20, right: 55, left: 20, bottom: -35 }}
            >
              <CartesianGrid stroke="#4F5566" strokeDasharray="none" horizontal={true} vertical={true} />
              <XAxis
                dataKey="disparado_em"
                angle={-45}
                textAnchor="end"
                height={120}
                tickFormatter={formatDate}
                tick={{ fill: "#FFFFFF" }}
                interval={0}
              />
              <YAxis
                domain={[0, 10]} // Definindo o domínio para quantidade de erros
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} // Configurando os ticks no eixo Y
                tick={{ fill: "#FFFFFF" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="top" align="center" />
              <Scatter
                data={errorData.map((item) => ({
                  x: item.disparado_em, // Posição no eixo X (data do erro)
                  y: 1, // Valor fixo para erros (indicando que houve erro)
                }))}
                fill="#FF5722" // Cor das bolinhas
                shape="circle"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Gráfico normal de tempo (como anteriormente)
          <ResponsiveContainer width="100%" height={700}>
            <LineChart
              data={filteredData.slice(-20)} // Usando os dados filtrados sem erro
              style={{ backgroundColor: "#0a0b11" }}
              margin={{ top: 20, right: 55, left: 20, bottom: -35 }}
            >
              <CartesianGrid stroke="#4F5566" strokeDasharray="none" horizontal={true} vertical={true} />
              <XAxis
                dataKey="disparado_em"
                angle={-45}
                textAnchor="end"
                height={120}
                tickFormatter={formatDate}
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
              <Scatter
                data={filteredData.slice(-20).map((item) => ({
                  x: item.disparado_em, // Posição no eixo X
                  y: 200, // Posição fixa no eixo Y (linha horizontal)
                }))}
                fill="#FF5722" // Cor das bolinhas
                shape="circle"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </main>
  );
}
