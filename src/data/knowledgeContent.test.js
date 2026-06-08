import knowledgeCategories from './knowledgeCategories';
import knowledgeData from './knowledgeDetails';
import { learningPathBlueprints } from './learningPaths';
import { getSectionDeepDive } from './sectionDeepDives';

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

  test('SQL injection sections include detailed learning material', () => {
    const sqlInjection = knowledgeData['sql-injection'];

    for (const section of sqlInjection.sections) {
      const deepDive = getSectionDeepDive('sql-injection', sqlInjection, section);
      const totalDeepDiveText = [
        deepDive.summary,
        ...deepDive.diagnosis,
        ...deepDive.observations,
        ...deepDive.practice.map(step => `${step.title}${step.detail}`),
        ...deepDive.remediation,
      ].join('');

      expect(totalDeepDiveText.length).toBeGreaterThan(section.content.length * 4);
      expect(deepDive.diagnosis.length).toBeGreaterThanOrEqual(4);
      expect(deepDive.observations.length).toBeGreaterThanOrEqual(4);
      expect(deepDive.practice.length).toBeGreaterThanOrEqual(5);
      expect(deepDive.remediation.length).toBeGreaterThanOrEqual(4);
    }
  });
});
