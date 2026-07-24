import knowledgeCategories from './knowledgeCategories';
import knowledgeData from './knowledgeDetails';
import { learningPathBlueprints } from './learningPaths';
import { getSectionDeepDive } from './sectionDeepDives';
import { getDetailedTutorial } from './tutorialProfiles';
import { challengeCatalog } from '../shared/challengeCatalog';
import { targetEnvironments } from '../shared/targetEnvironments';

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

  test('learner tutorials do not expose maintainer acceptance checklists', () => {
    const sqlInjection = knowledgeData['sql-injection'];
    const tutorial = getDetailedTutorial(
      'sql-injection',
      sqlInjection,
      sqlInjection.sections[0]
    );

    expect(tutorial).not.toHaveProperty('checklist');
    expect(tutorial.labTasks.length).toBeGreaterThan(0);
    expect(tutorial.pitfalls.length).toBeGreaterThan(0);
  });

  test('every knowledge section has an aligned local lab target', () => {
    const detailCategoryIds = Object.keys(knowledgeData).sort();
    const catalogCategoryIds = Object.keys(challengeCatalog).sort();

    expect(catalogCategoryIds).toEqual(detailCategoryIds);

    for (const knowledgeId of detailCategoryIds) {
      const detailSections = knowledgeData[knowledgeId].sections.map(({ title }) => title);
      const targetSections = Object.keys(targetEnvironments[knowledgeId]?.sections || {});

      expect(challengeCatalog[knowledgeId].sections).toEqual(detailSections);
      expect(targetSections).toEqual(detailSections);

      for (const sectionTitle of targetSections) {
        const target = targetEnvironments[knowledgeId].sections[sectionTitle];
        expect(target.dockerImage).toBe('relum/local-lab:latest');
        expect(target.localDockerfile).toBe('labs/relum-lab/Dockerfile');
        expect(target.env).toContain(`RELUM_KNOWLEDGE_ID=${knowledgeId}`);
        expect(target.env).toContain(`RELUM_SECTION_TITLE=${sectionTitle}`);
      }
    }
  });
});
