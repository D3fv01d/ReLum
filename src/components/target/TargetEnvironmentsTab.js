import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  getExerciseNameForImage,
  getImageName,
  isImageInstalled,
} from '../../utils/targetEnvironmentUtils';

const TargetEnvironmentsTab = ({
  availableEnvironmentGroups,
  environmentQuery,
  filteredEnvironmentCount,
  installedImages,
  onEnvironmentQueryChange,
}) => (
  <div>
    <div className="mb-4">
      <div className="text-white mb-2">已安装靶场环境</div>

      {installedImages.length === 0 ? (
        <div className="bg-gray-700 p-4 rounded text-gray-300">
          尚未安装任何靶场环境。请前往"管理选项"安装靶场环境。
        </div>
      ) : (
        <div className="bg-gray-700 rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">题目名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">镜像名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {installedImages.map((image, index) => {
                const imageName = getImageName(image);
                const exerciseName = getExerciseNameForImage(imageName);

                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'}>
                    <td className="px-4 py-3 text-sm text-white">{exerciseName}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{imageName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                        已安装
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    <div>
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-white">可用靶场环境</div>
          <div className="text-xs text-gray-400">
            共 {filteredEnvironmentCount} 个匹配环境
          </div>
        </div>
        <div className="relative md:w-80">
          <label htmlFor="target-environment-search" className="sr-only">
            搜索靶场环境
          </label>
          <FontAwesomeIcon
            icon={faSearch}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            id="target-environment-search"
            type="search"
            value={environmentQuery}
            onChange={(event) => onEnvironmentQueryChange(event.target.value)}
            placeholder="搜索名称、分类或镜像"
            className="w-full rounded-md border border-gray-600 bg-gray-900 py-2 pl-9 pr-10 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400"
          />
          {environmentQuery && (
            <button
              type="button"
              onClick={() => onEnvironmentQueryChange('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
              aria-label="清空靶场搜索"
            >
              <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {availableEnvironmentGroups.length === 0 ? (
          <div className="rounded bg-gray-700 p-4 text-sm text-gray-300">
            没有找到匹配的靶场环境。
          </div>
        ) : availableEnvironmentGroups.map(({ category, sections }) => (
          <div key={category} className="bg-gray-700 p-4 rounded">
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">
              {category.replace(/-/g, ' ')} 靶场
            </h3>

            <div className="space-y-2">
              {sections.map(({ sectionName, target }) => {
                const isInstalled = isImageInstalled(installedImages, target.dockerImage);

                return (
                  <div key={sectionName} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <div>
                      <div className="text-white">{sectionName}</div>
                      <div className="text-gray-400 text-xs">{target.dockerImage}</div>
                    </div>
                    <div>
                      {isInstalled ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                          已安装
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-300">
                          未安装
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TargetEnvironmentsTab;
