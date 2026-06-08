import knowledgeCategories from './knowledgeCategories';
import knowledgeData from './knowledgeDetails';
import { learningPathBlueprints } from './learningPaths';

describe('knowledge content integrity', () => {
  test('every knowledge category has a populated detail page', () => {
    for (const category of knowledgeCategories) {
      const detail = knowledgeData[category.id];

      expect(detail).toBeTruthy();
      expect(detail.title).toBe(category.title);
      expect(detail.sections.length).toBeGreaterThan(0);
      expect(detail.protection.length).toBeGreaterThan(0);
    }
  });

  test('learning path blueprints reference existing categories', () => {
    const categoryIds = new Set(knowledgeCategories.map(category => category.id));

    for (const path of learningPathBlueprints) {
      expect(path.categories.length).toBeGreaterThan(0);

      for (const categoryId of path.categories) {
        expect(categoryIds.has(categoryId)).toBe(true);
      }
    }
  });
});
