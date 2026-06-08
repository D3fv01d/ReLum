import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListCheck,
  faMagnifyingGlass,
  faShieldAlt,
  faVial,
} from '@fortawesome/free-solid-svg-icons';
import { getSectionDeepDive } from '../../data/sectionDeepDives';

function InfoList({ icon, items, title }) {
  return (
    <div className="rounded-md bg-[#1E1E1E] p-4">
      <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-300">
        <FontAwesomeIcon icon={icon} className="mr-2" />
        {title}
      </h4>
      <ul className="ml-5 list-disc space-y-1 text-sm leading-6 text-gray-300">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionDeepDive({ category, categoryId, section }) {
  const deepDive = getSectionDeepDive(categoryId, category, section);

  return (
    <div className="mb-6 rounded-lg border border-[#3A3A3A] bg-[#242424] p-4">
      <h3 className="mb-3 flex items-center text-lg font-medium">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 text-primary" />
        精讲拆解
      </h3>
      <p className="mb-4 text-sm leading-6 text-gray-300">{deepDive.summary}</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoList icon={faMagnifyingGlass} title="判断条件" items={deepDive.diagnosis} />
        <InfoList icon={faListCheck} title="观察证据" items={deepDive.observations} />
      </div>

      <div className="mt-4 rounded-md bg-[#1E1E1E] p-4">
        <h4 className="mb-3 flex items-center text-sm font-semibold text-blue-300">
          <FontAwesomeIcon icon={faVial} className="mr-2" />
          实验路径
        </h4>
        <ol className="space-y-3">
          {deepDive.practice.map((step, index) => (
            <li key={step.title} className="flex gap-3 text-sm leading-6 text-gray-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="font-medium text-white">{step.title}</div>
                <div className="mt-1">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {deepDive.examples.length > 0 && (
        <div className="mt-4 rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-3 text-sm font-semibold text-blue-300">关键样例与用途</h4>
          <div className="space-y-3">
            {deepDive.examples.map(example => (
              <div key={`${example.label}-${example.code}`} className="rounded border border-[#333] bg-black/20 p-3">
                <div className="mb-2 text-sm font-medium text-white">{example.label}</div>
                <pre className="overflow-x-auto rounded bg-black/30 p-2 text-sm">
                  <code className="whitespace-pre-wrap text-primary">{example.code}</code>
                </pre>
                <p className="mt-2 text-sm leading-6 text-gray-400">{example.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-md bg-[#1E1E1E] p-4">
        <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-300">
          <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
          修复复盘
        </h4>
        <ul className="ml-5 list-disc space-y-1 text-sm leading-6 text-gray-300">
          {deepDive.remediation.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SectionDeepDive;
