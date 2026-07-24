import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faBullseye,
  faCheckDouble,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import knowledgeCategories from '../../data/knowledgeCategories';
import { getOrderedPathCategories } from '../../data/learningPaths';

const categoryById = new Map(
  knowledgeCategories.map((category) => [category.id, category])
);

function ModuleLearningGuide({ category, context }) {
  if (!context) {
    return null;
  }

  const { path, stage } = context;
  const orderedCategories = getOrderedPathCategories(path);
  const currentIndex = orderedCategories.indexOf(category.id);
  const previousCategory = categoryById.get(orderedCategories[currentIndex - 1]);
  const nextCategory = categoryById.get(orderedCategories[currentIndex + 1]);
  const pathQuery = `?path=${path.id}`;

  return (
    <section className="module-learning-guide" aria-label="模块学习引导">
      <div className="module-guide-item">
        <FontAwesomeIcon icon={faBullseye} />
        <div>
          <strong>本阶段要解决的问题</strong>
          <p>{stage.objective}</p>
        </div>
      </div>
      <div className="module-guide-item">
        <FontAwesomeIcon icon={faLayerGroup} />
        <div>
          <strong>建议前置</strong>
          <p>{path.prerequisites.join('；')}</p>
        </div>
      </div>
      <div className="module-guide-item">
        <FontAwesomeIcon icon={faCheckDouble} />
        <div>
          <strong>模块完成标准</strong>
          <p>依次完成 {category.sections.length} 个章节；配置靶场的章节必须提交正确 flag。</p>
        </div>
      </div>
      <nav className="module-neighbors" aria-label="相邻学习模块">
        {previousCategory ? (
          <Link to={`/knowledge/${previousCategory.id}${pathQuery}`}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span><small>上一模块</small><strong>{previousCategory.title}</strong></span>
          </Link>
        ) : null}
        {nextCategory ? (
          <Link to={`/knowledge/${nextCategory.id}${pathQuery}`}>
            <span><small>下一模块</small><strong>{nextCategory.title}</strong></span>
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        ) : (
          <Link to={`/knowledge${pathQuery}`}>
            <span><small>路径完成</small><strong>返回学习路径</strong></span>
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        )}
      </nav>
    </section>
  );
}

export default ModuleLearningGuide;
