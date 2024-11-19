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
import { format } from "date-fns"; // Importando para formatação da data

// Interface para tipar os dados
interface DataPoint {
  id: number;
  nome_banco: string;
  tempo: number;
  erro: string | null;
  codigo: string;
  disparado_em: string;
  statusBanco: string;
  createdAt: string; // Assumindo que o createdAt seja uma string de data
  updatedAt: string;
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

export default function Home() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedBanco, setSelectedBanco] = useState<string>(''); // Estado para armazenar o banco selecionado
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]); // Estado para armazenar os dados filtrados

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

  // Função para filtrar os dados com base no banco selecionado
  useEffect(() => {
    if (selectedBanco) {
      const filtered = data.filter(item => item.nome_banco === selectedBanco);
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // Se nenhum banco for selecionado, mostrar todos os dados
    }
  }, [selectedBanco, data]);

  // Função para manipular a mudança no select
  const handleBancoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBanco(event.target.value);
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "HH:mm"); // Formata a data para hora e minuto
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gráfico de Desempenho</h1>

      {/* Dropdown para selecionar o banco */}
      <select onChange={handleBancoChange} value={selectedBanco} className="mb-4 p-2 border">
        <option value="">Selecione um banco</option>
        {Array.from(new Set(data.map((entry) => entry.nome_banco))).map((banco, index) => (
          <option key={index} value={banco}>
            {banco}
          </option>
        ))}
      </select>

      {/* Exibição do gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="createdAt" // Usando 'createdAt' para o eixo X
            angle={-45}
            textAnchor="end"
            interval={0}
            height={120}
            tickFormatter={(tick) => formatDate(tick)} // Formatando o valor de 'createdAt'
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
            {filteredData.map((entry, index) => (
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
