import React from 'react';
import { createRoot } from 'react-dom/client'; // Use createRoot for React 18
import './index.css';
import UpdatedSEOTool from './UpdatedSEOTool';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<UpdatedSEOTool />);
