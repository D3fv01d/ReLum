import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCode, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { getDetailedTutorial } from '../data/tutorialProfiles';

function DetailedTutorial({ categoryId, category, section }) {
  const tutorial = getDetailedTutorial(categoryId, category, section);

  return (
    <section className="lesson-block">
      <h3>
        <FontAwesomeIcon icon={faBook} />
        章节练习指南
      </h3>

      <div className="lesson-grid two-columns">
        <div className="lesson-grid-item">
          <h4>
            <FontAwesomeIcon icon={faInfoCircle} />
            学习目标
          </h4>
          <ul>
            {tutorial.learningGoals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-grid-item">
          <h4>
            <FontAwesomeIcon icon={faCode} />
            前置知识
          </h4>
          <ul>
            {tutorial.prerequisites.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lesson-subsection">
        <h4>实操步骤</h4>
        <ol className="lesson-steps">
          {tutorial.workflow.map((step, index) => (
            <li key={step.title}>
              <span>
                {index + 1}
              </span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="lesson-subsection lesson-code">
        <h4>{tutorial.example.title}</h4>
        <pre>
          <code>{tutorial.example.code}</code>
        </pre>
      </div>

      <div className="lesson-grid two-columns">
        <div className="lesson-grid-item">
          <h4>实验任务</h4>
          <ul>
            {tutorial.labTasks.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-grid-item">
          <h4>常见误区</h4>
          <ul>
            {tutorial.pitfalls.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default DetailedTutorial;
