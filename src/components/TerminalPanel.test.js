import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { TerminalPanel } from './TerminalPanel';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TerminalPanel', () => {
  let container;
  let root;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
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

  test('recalls submitted commands with arrow keys', () => {
    act(() => {
      root.render(<TerminalPanel showTerminal setShowTerminal={() => {}} />);
    });

    const getInput = () => container.querySelector('input[type="text"]');
    const submitCommand = (command) => {
      const input = getInput();
      const form = input.closest('form');

      act(() => {
        input.value = command;
        Simulate.change(input, { target: { value: command } });
      });

      act(() => {
        Simulate.submit(form);
      });
    };

    const pressHistoryKey = (key) => {
      const input = getInput();

      act(() => {
        Simulate.keyDown(input, { key, currentTarget: input });
      });

      return getInput().value;
    };

    submitCommand('help');
    submitCommand('noop');

    expect(pressHistoryKey('ArrowUp')).toBe('noop');

    expect(pressHistoryKey('ArrowUp')).toBe('help');

    expect(pressHistoryKey('ArrowDown')).toBe('noop');

    expect(pressHistoryKey('ArrowDown')).toBe('');
  });
});
