import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/index.css'; // Se você tiver estilos
import App from './Frontend/App';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

