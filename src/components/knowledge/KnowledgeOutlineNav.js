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
  onSectionSelect,
  sectionIds,
  sections,
  targetEnvStatuses = {},
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <nav
        aria-label="知识章节目录"
        className="rounded-lg border border-[#333] bg-[#222222] p-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center text-base font-semibold">
            <FontAwesomeIcon icon={faListUl} className="mr-2 text-primary" />
            目录
          </h2>
          <span className="text-xs text-gray-400">{sections.length} 节</span>
        </div>

        <ol className="space-y-1">
          {sections.map((section, index) => {
            const sectionId = sectionIds[index];
            const isActive = sectionId === activeSectionId;
            const statusMeta = getStatusMeta(targetEnvStatuses[section.title]);

            return (
              <li key={section.title}>
                <button
                  type="button"
                  aria-current={isActive ? 'location' : undefined}
                  className={`group flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-white'
                      : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
                  }`}
                  onClick={() => onSectionSelect(sectionId)}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-[#333333] text-gray-400 group-hover:text-white'
                  }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{section.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <FontAwesomeIcon icon={faCircle} className="text-[5px]" />
                      {difficultyLabel[section.difficulty] || '章节'}
                      {statusMeta && (
                        <span className={`ml-auto inline-flex items-center gap-1 ${statusMeta.className}`}>
                          <FontAwesomeIcon
                            icon={statusMeta.icon}
                            className={statusMeta.spin ? 'animate-spin' : ''}
                          />
                          {statusMeta.label}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

export default KnowledgeOutlineNav;
