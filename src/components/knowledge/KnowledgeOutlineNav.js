import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCircle,
  faExclamationTriangle,
  faListUl,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const getStatusMeta = (status = {}) => {
  if (status.loading) {
    return {
      icon: faSpinner,
      label: '启动中',
      className: 'text-blue-300',
      spin: true,
    };
  }

  if (status.error) {
    return {
      icon: faExclamationTriangle,
      label: '异常',
      className: 'text-red-300',
      spin: false,
    };
  }

  if (status.url) {
    return {
      icon: faCheckCircle,
      label: '运行中',
      className: 'text-green-300',
      spin: false,
    };
  }

  return null;
};

const difficultyLabel = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

function KnowledgeOutlineNav({
  activeSectionId,
  completedSectionTitles = new Set(),
  onSectionSelect,
  sectionIds,
  sections,
  targetEnvStatuses = {},
}) {
  return (
    <nav aria-label="知识章节目录" className="knowledge-outline">
        <div className="outline-heading">
          <h2>
            <FontAwesomeIcon icon={faListUl} />
            目录
          </h2>
          <span>{sections.length} 节</span>
        </div>

        <ol>
          {sections.map((section, index) => {
            const sectionId = sectionIds[index];
            const isActive = sectionId === activeSectionId;
            const statusMeta = getStatusMeta(targetEnvStatuses[section.title]);
            const isCompleted = completedSectionTitles.has(section.title);

            return (
              <li key={section.title}>
                <button
                  type="button"
                  aria-current={isActive ? 'location' : undefined}
                  className={isActive ? 'active' : ''}
                  onClick={() => onSectionSelect(sectionId)}
                >
                  <span className={`outline-index ${isCompleted ? 'completed' : ''}`}>
                    {isCompleted ? <FontAwesomeIcon icon={faCheckCircle} /> : index + 1}
                  </span>

                  <span className="outline-copy">
                    <strong>{section.title}</strong>
                    <small>
                      <FontAwesomeIcon icon={faCircle} className="text-[5px]" />
                      {difficultyLabel[section.difficulty] || '章节'}
                      {statusMeta && (
                        <span className={statusMeta.className}>
                          <FontAwesomeIcon
                            icon={statusMeta.icon}
                            className={statusMeta.spin ? 'animate-spin' : ''}
                          />
                          {statusMeta.label}
                        </span>
                      )}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
  );
}

export default KnowledgeOutlineNav;
