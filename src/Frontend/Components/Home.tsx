// Dashboard.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { TooltipProps } from "recharts";
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

  // Função para filtrar os dados com base no período selecionado
  const filteredData = useMemo(() => {
    const now = new Date();
    let filtered = [...data];

    switch (selectedPeriod) {
      case '24h':
        // Filtra para as últimas 24 horas
        filtered = data.filter(item => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 24 * 60 * 60 * 1000; // 24 horas em ms
        });
        break;
      case '7d':
        // Filtra para os últimos 7 dias
        filtered = data.filter(item => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
        });
        break;
      case '30d':
        // Filtra para o último mês
        filtered = data.filter(item => {
          const itemDate = new Date(item.disparado_em);
          return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
        });
        break;
      default:
        break;
    }
    return filtered;
  }, [selectedPeriod, data]);

  // Definir o tipo genérico para o TooltipProps
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
          <button onClick={() => setSelectedPeriod('24h')}>Últimas 24h</button>
          <button onClick={() => setSelectedPeriod('7d')}>Últimos 7 dias</button>
          <button onClick={() => setSelectedPeriod('30d')}>Último mês</button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={700}>
          <LineChart
            data={filteredData.slice(-20)}
            style={{ backgroundColor: "#0a0b11" }}
            margin={{ top: 20, right: 55, left: 20, bottom: -35 }}
          >
            <CartesianGrid stroke="#4F5566" strokeDasharray="none" horizontal={true} vertical={true} />
            <XAxis
              dataKey="disparado_em"
              angle={-45}
              textAnchor="end"
              height={120}
              tickFormatter={(tick) => formatDate(tick)}
              tick={{ fill: "#FFFFFF" }}
              interval={0}
            />
            <YAxis
              domain={[100, 1000]}
              ticks={[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]}
              tick={{ fill: "#FFFFFF" }}
            />
            <Tooltip content={<CustomTooltip />} /> {/* Tooltip personalizado */}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
