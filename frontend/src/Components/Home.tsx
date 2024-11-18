"use client";
import { useEffect, useState } from "react";
import React from "react";
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

// Função para buscar os dados da API
const fetchData = async (): Promise<DataPoint[]> => {
  try {
    const response = await fetch("http://localhost:3000/registros");
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

export default function Home() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchData();
        
        // Log para verificar se os dados estão sendo recebidos corretamente
        console.log("Dados recebidos da API:", result);
        
        // Atualizando o estado com os dados recebidos
        setData(result);
      } catch (error) {
        console.error("Erro ao processar os dados:", error);
      }
    };

    getData();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gráfico de Desempenho</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="nome_banco" // Mostra o nome do banco no eixo X
            angle={-45}
            textAnchor="end"
            interval={0}
            height={120}
          />
          <YAxis />
          <Tooltip />
          <Legend
            layout="horizontal"
            verticalAlign="top"
            align="center"
            iconType="rect"
            iconSize={12}
          />
          <Bar dataKey="tempo" name="Tempo (ms)" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.statusBanco === "online" ? "#8884d8" : "red"} // Colore os bancos conforme o status
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
