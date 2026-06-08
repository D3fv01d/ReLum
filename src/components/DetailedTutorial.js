import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCode, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { getDetailedTutorial } from '../data/tutorialProfiles';

function DetailedTutorial({ categoryId, category, section }) {
  const tutorial = getDetailedTutorial(categoryId, category, section);

  return (
    <div className="mb-6 rounded-lg border border-[#3A3A3A] bg-[#242424] p-4">
      <h3 className="mb-4 flex items-center text-lg font-medium">
        <FontAwesomeIcon icon={faBook} className="mr-2 text-primary" />
        详细教程与实战示例
      </h3>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-300">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            学习目标
          </h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-300">
            {tutorial.learningGoals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-blue-300">
            <FontAwesomeIcon icon={faCode} className="mr-2" />
            前置知识
          </h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-300">
            {tutorial.prerequisites.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-[#1E1E1E] p-4">
        <h4 className="mb-3 text-sm font-semibold text-blue-300">实操步骤</h4>
        <ol className="space-y-3">
          {tutorial.workflow.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-gray-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="font-medium text-white">{step.title}</div>
                <div className="mt-1 leading-6">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 rounded-md bg-[#1E1E1E] p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-300">{tutorial.example.title}</h4>
        <pre className="overflow-x-auto rounded bg-black/30 p-3 text-sm text-gray-300">
          <code className="whitespace-pre-wrap text-primary">{tutorial.example.code}</code>
        </pre>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-300">实验任务</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-300">
            {tutorial.labTasks.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-300">验收清单</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-300">
            {tutorial.checklist.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-[#1E1E1E] p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-300">常见误区</h4>
          <ul className="ml-5 list-disc space-y-1 text-sm text-gray-300">
            {tutorial.pitfalls.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DetailedTutorial;
