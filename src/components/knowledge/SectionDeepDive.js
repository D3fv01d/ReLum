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
    <div className="lesson-grid-item">
      <h4>
        <FontAwesomeIcon icon={icon} />
        {title}
      </h4>
      <ul>
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
    <section className="lesson-block">
      <h3>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        精讲拆解
      </h3>
      <p className="lesson-summary">{deepDive.summary}</p>

      <div className="lesson-grid two-columns">
        <InfoList icon={faMagnifyingGlass} title="判断条件" items={deepDive.diagnosis} />
        <InfoList icon={faListCheck} title="观察证据" items={deepDive.observations} />
      </div>

      <div className="lesson-subsection">
        <h4>
          <FontAwesomeIcon icon={faVial} />
          实验路径
        </h4>
        <ol className="lesson-steps">
          {deepDive.practice.map((step, index) => (
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

      {deepDive.examples.length > 0 && (
        <div className="lesson-subsection">
          <h4>关键样例与用途</h4>
          <div className="lesson-examples">
            {deepDive.examples.map(example => (
              <div key={`${example.label}-${example.code}`} className="lesson-example">
                <strong>{example.label}</strong>
                <pre>
                  <code>{example.code}</code>
                </pre>
                <p>{example.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lesson-subsection">
        <h4>
          <FontAwesomeIcon icon={faShieldAlt} />
          修复复盘
        </h4>
        <ul className="lesson-list">
          {deepDive.remediation.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default SectionDeepDive;
