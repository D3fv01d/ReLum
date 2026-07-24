import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCloudArrowDown,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  isImageInstalled,
} from '../../utils/targetEnvironmentUtils';

const TargetEnvironmentsTab = ({
  availableEnvironmentGroups,
  environmentQuery,
  filteredEnvironmentCount,
  installedImages,
  onEnvironmentQueryChange,
}) => (
  <div className="target-environments-panel">
    <div className="target-toolbar">
      <span>{filteredEnvironmentCount} 个匹配环境</span>
      <label className="search-field compact">
        <span className="sr-only">搜索靶场环境</span>
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="search"
          value={environmentQuery}
          onChange={(event) => onEnvironmentQueryChange(event.target.value)}
          placeholder="名称、分类或镜像"
        />
        {environmentQuery && (
          <button type="button" onClick={() => onEnvironmentQueryChange('')} aria-label="清空搜索">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </label>
    </div>

    {availableEnvironmentGroups.length > 0 ? (
      <div className="environment-groups">
        {availableEnvironmentGroups.map(({ category, sections }) => (
          <section key={category} className="environment-group">
            <div className="environment-group-heading">
              <h3>{category.replace(/-/g, ' ')}</h3>
              <span>{sections.length} 个环境</span>
            </div>
            {sections.map(({ sectionName, target }) => {
              const installed = isImageInstalled(installedImages, target.dockerImage);

              return (
                <div key={sectionName} className="environment-row">
                  <div>
                    <strong>{sectionName}</strong>
                    <small>{target.dockerImage}</small>
                  </div>
                  <span className={installed ? 'installed' : ''}>
                    <FontAwesomeIcon icon={installed ? faCheck : faCloudArrowDown} />
                    {installed ? '已安装' : '未安装'}
                  </span>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    ) : (
      <div className="empty-state compact-empty">
        <FontAwesomeIcon icon={faSearch} />
        <p>没有匹配的靶场环境</p>
      </div>
    )}
  </div>
);

export default TargetEnvironmentsTab;
