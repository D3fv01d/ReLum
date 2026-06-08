import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import KnowledgeOutlineNav from './KnowledgeOutlineNav';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('KnowledgeOutlineNav', () => {
  let container;
  let root;

  beforeEach(() => {
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

  test('renders sections and selects a target section', () => {
    const handleSectionSelect = jest.fn();
    const sections = [
      { title: '字符型SQL注入', difficulty: 'beginner' },
      { title: '联合注入', difficulty: 'intermediate' },
    ];

    act(() => {
      root.render(
        <KnowledgeOutlineNav
          activeSectionId="section-1"
          onSectionSelect={handleSectionSelect}
          sectionIds={['section-1', 'section-2']}
          sections={sections}
          targetEnvStatuses={{
            联合注入: {
              url: 'http://localhost:8081',
            },
          }}
        />
      );
    });

    expect(container.textContent).toContain('目录');
    expect(container.textContent).toContain('字符型SQL注入');
    expect(container.textContent).toContain('联合注入');
    expect(container.textContent).toContain('运行中');
    expect(container.querySelector('[aria-current="location"]').textContent).toContain('字符型SQL注入');

    const buttons = container.querySelectorAll('button');
    act(() => {
      Simulate.click(buttons[1]);
    });

    expect(handleSectionSelect).toHaveBeenCalledWith('section-2');
  });
});
