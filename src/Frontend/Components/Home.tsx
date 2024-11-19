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
  LineChart,
  Line,
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

        {/* Gráfico */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={700}>
            <LineChart
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
              <Line dataKey="tempo" fill="#0a0b11">
                {filteredData.slice(-20).map((entry, index) => {
                  let barColor = "#8884d8";
                  if (entry.tempo >= 0 && entry.tempo <= 299) barColor = "#5CF962";
                  else if (entry.tempo >= 300 && entry.tempo <= 499) barColor = "#FFDE2F";
                  else if (entry.tempo >= 500) barColor = "#FF2F2F";
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>

    );
  }    
