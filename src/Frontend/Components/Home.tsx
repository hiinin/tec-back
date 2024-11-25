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
  const response = await fetch('http://localhost:5000/registros');
  const data = await response.json();
  return data;
};

export default function Dashboard() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [banks, setBanks] = useState<string[]>([]);
  const [banksStatus, setBanksStatus] = useState<Status[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [isErrorView, setIsErrorView] = useState(false);
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
    statusBanco: 'online' | 'offline';
  }
  
  interface StatusButtonProps {
    status: Status;
    onClick: () => void;
  }
  
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

  const getBanks = (data: DataPoint[]) => {
    const uniqueBanks = Array.from(new Set(data.map((item) => item.nome_banco)));
    setBanks(uniqueBanks);
  };

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
}, []);

const filteredData = useMemo(() => {
  console.log("Período selecionado:", selectedPeriod);
  console.log("Data antes de filtrar:", data);
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

  console.log("Data filtrada:", filtered);
  return filtered;
}, [selectedBank, selectedPeriod, data]);


const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'HH:mm');
};

  const toggleViewMode = () => {
    setIsErrorView((prev) => !prev);
  };

  const CustomTooltip: React.FC<TooltipProps<any, any>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { tempo, erro, disparado_em } = payload[0].payload;

      const date = new Date(disparado_em);
      const formattedDate = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
  
      return (
        <div
          style={{
            backgroundColor: "#1c1c1c",
            color: "#ffffff",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #444",
            lineHeight: "1.5",
          }}
        >
          <p>
            <strong>Tempo:</strong> {tempo}(ms)</p>
          <p><strong>Erro:</strong> {erro ? "Sim" : "Não"}</p>
          <p><strong>Criado em:</strong> {formattedDate} às {formattedTime}</p>
        </div>
      );
    }
    return null;
  };
  

  const selecionarBanco = (nomeBanco: string) => {
    setBancoSelecionado(nomeBanco);
    setSelectedBank(nomeBanco);
  };

  const errorData = filteredData.filter(item => item.erro);

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
            onClick={() => setSelectedBank(bank)}
            className={`bank-button ${selectedBank === bank ? "selected" : ""}`}
          >
            <img
              src={imagensDosBancos[bank]}
              alt={bank}
              style={{ marginRight: 10 }}
            />
            <span className="bank-name">{bancoMap[bank] || bank}</span>
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

      <div className="chart-container">
        {isErrorView ? (
          /* Gráfico de erros */
          <ResponsiveContainer width="100%" height={807}>
            <BarChart
              data={errorData.reduce((acc, item) => {
                const hour = new Date(item.disparado_em).getHours();
                const existingHour = acc.find((entry) => entry.hour === hour);

                if (existingHour) {
                  existingHour.erros += 1;
                  if (item.erro) {
                    existingHour.erroNomes.push(item.erro);
                  }
                } else {
                  acc.push({
                    hour,
                    erros: 1,
                    erroNomes: item.erro ? [item.erro] : [],
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
                    const dataPoint = payload[0].payload;

                    const fullDateString = "25-11-2024 12:00";
                    const dateParts = fullDateString.split(" ")[0].split("-");
                    const parsedDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                    const formattedDate = parsedDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    console.log("Data formatada:", formattedDate);

                    
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
                            ? dataPoint.erroNomes.join(", ")
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
          // Gráfico de tempo
          <ResponsiveContainer width="100%" height={900}>
            <LineChart
              data={filteredData.slice(-50)}
              
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
                    fill = "#FF2F2F";
                  } else if (payload.tempo > 500) {
                    fill = "#FFDE2F";
                  }

                  return (
                    <circle cx={cx} cy={cy} r={5} fill={fill} stroke={fill} strokeWidth={2} />
                  );
                }}
              />
              <ReferenceLine
                y={200}
                stroke="#B4F22E"
                strokeDasharray="none"
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
        <a href="https/youtube.com">Advertisement</a>
      </div>
    </main>
  );
}
