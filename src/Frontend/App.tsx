import React from 'react';
import Chart from './Components/Home';
import '../index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-7xl w-full bg-white rounded-lg shadow-lg">
        <h1></h1>
        <Chart />
      </div>
    </div>
  );
};

export default App;
