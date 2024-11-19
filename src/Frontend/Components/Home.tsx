// Dashboard.tsx
"use client";
import { useEffect, useState } from "react";
import React from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  const [tooltip, setTooltip] = useState<string | null>(null); // bolinhas

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

  // Filtra os dados com base no banco selecionado
  const filteredData = selectedBank
    ? data.filter((item) => item.nome_banco === selectedBank)
    : data; // Se nenhum banco for selecionado, exibe todos os dados

    return (
      <main className="dashboard-container">
        {/* Barra lateral de bancos */}
        <div className="sidebar">
          <div className="bank-buttons">
            {banks.map((bank, index) => (
              <button
                key={index}
                onClick={() => setSelectedBank(bank)}
                className={`bank-button ${
                  selectedBank === bank ? "selected" : ""
                }`}
              >
                {bank}
              </button>
            ))}
            <button
              onClick={() => setSelectedBank("")}
              className={`bank-button ${
                selectedBank === "" ? "selected" : ""
              }`}
            >
              Todos os Bancos
            </button>
          </div>
        </div>

        {/* Bolinhas explicativas acima do gráfico */}
      <div className="flex justify-center gap-4 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-10">
        <div
          onMouseEnter={() => setTooltip("Até 299 ms (Verde)")}
          onMouseLeave={() => setTooltip(null)}
          className="w-4 h-4 bg-green-500 rounded-full cursor-pointer"
        />
        <div
          onMouseEnter={() => setTooltip("300-499 ms (Amarelo)")}
          onMouseLeave={() => setTooltip(null)}
          className="w-4 h-4 bg-yellow-500 rounded-full cursor-pointer"
        />
        <div
          onMouseEnter={() => setTooltip("Acima de 500 ms (Vermelho)")}
          onMouseLeave={() => setTooltip(null)}
          className="w-4 h-4 bg-red-500 rounded-full cursor-pointer"
        />
      </div>

      {/* Tooltip para mostrar a explicação das bolinhas */}
      {tooltip && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8 p-2 bg-black text-white text-xs rounded">
          {tooltip}
        </div>
      )}

        {/* Gráfico */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={700}>
            <BarChart
              data={filteredData.slice(-20)}
              style={{ backgroundColor: "#0a0b11" }}
              margin={{ top: 20, right: 55, left: 20, bottom: -35 }}
            >
              <CartesianGrid
                  stroke="#4F5566"
                  strokeDasharray="none"
                  horizontal={true}
                  vertical={true}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F121B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#232A40" stopOpacity={1} />
                  </linearGradient>
                </defs>
              <XAxis
                dataKey="disparado_em"
                angle={-45}
                textAnchor="end"
                height={120}
                tickFormatter={(tick) => formatDate(tick)}
                interval={0}
              />
              <YAxis domain={[100, 1000]} ticks={[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]} />
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="top" align="center" />
              <Bar dataKey="tempo" fill="#0a0b11">
                {filteredData.slice(-20).map((entry, index) => {
                  let barColor = "#8884d8";
                  if (entry.tempo >= 0 && entry.tempo <= 299) barColor = "#5CF962";
                  else if (entry.tempo >= 300 && entry.tempo <= 499) barColor = "#FFDE2F";
                  else if (entry.tempo >= 500) barColor = "#FF2F2F";
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>

    );
  }    
