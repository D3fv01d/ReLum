import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import AiSettingsPanel from './AiSettingsPanel';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('AiSettingsPanel', () => {
  let container;
  let root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    container = null;
    root = null;
  });

  test('fills local Ollama defaults and makes API key optional', () => {
    act(() => {
      root.render(<AiSettingsPanel />);
    });

    const providerSelect = container.querySelector('#provider');
    const apiUrlInput = container.querySelector('#apiUrl');
    const modelInput = container.querySelector('#model');
    const apiKeyInput = container.querySelector('#apiKey');

    act(() => {
      providerSelect.value = 'ollama';
      Simulate.change(providerSelect, { target: { value: 'ollama' } });
    });

    expect(apiUrlInput.value).toBe('http://localhost:11434/api/chat');
    expect(modelInput.value).toBe('llama3.1');
    expect(apiKeyInput.required).toBe(false);
  });
});
