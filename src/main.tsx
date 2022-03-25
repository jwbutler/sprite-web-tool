import SpriteTool from './SpriteTool';
import React from 'react';
import ReactDOM from 'react-dom';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Hello, World!');
  const container = document.getElementById('CONTAINER');
  ReactDOM.render(<SpriteTool />, container);
});
