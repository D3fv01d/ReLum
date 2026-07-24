import knowledgeCategories from './knowledgeCategories';
import {
  getCategoryPathContexts,
  getLearningPath,
  getOrderedPathCategories,
  learningPaths,
} from './learningPaths';

describe('learningPaths', () => {
  test('uses stable path and stage identifiers', () => {
    expect(new Set(learningPaths.map((path) => path.id)).size).toBe(learningPaths.length);
    learningPaths.forEach((path) => {
      expect(path.stages.length).toBeGreaterThan(0);
      expect(new Set(path.stages.map((stage) => stage.id)).size).toBe(path.stages.length);
    });
  });

  test('references existing knowledge categories only', () => {
    const knownCategoryIds = new Set(knowledgeCategories.map((category) => category.id));

    learningPaths.forEach((path) => {
      getOrderedPathCategories(path).forEach((categoryId) => {
        expect(knownCategoryIds.has(categoryId)).toBe(true);
      });
    });
  });

  test('gives every category at least one learning context', () => {
    knowledgeCategories.forEach((category) => {
      expect(getCategoryPathContexts(category.id).length).toBeGreaterThan(0);
    });
    expect(getLearningPath('web-pentest')?.title).toBe('Web 安全测试');
  });
});
