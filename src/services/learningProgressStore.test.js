import {
  isSectionCompleted,
  readLearningProgress,
  recordSectionCompletion,
  recordSectionVisit,
  sanitizeProgress,
} from './learningProgressStore';

describe('learningProgressStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('records recent sections without duplicating the same section', () => {
    recordSectionVisit('sql-injection', '字符型SQL注入', 100);
    recordSectionVisit('sql-injection', '数值型SQL注入', 200);
    recordSectionVisit('sql-injection', '字符型SQL注入', 300);

    expect(readLearningProgress().recentSections).toEqual([
      {
        categoryId: 'sql-injection',
        sectionTitle: '字符型SQL注入',
        visitedAt: 300,
      },
      {
        categoryId: 'sql-injection',
        sectionTitle: '数值型SQL注入',
        visitedAt: 200,
      },
    ]);
  });

  test('marks a section complete and keeps the first completion time', () => {
    const first = recordSectionCompletion('xss', '反射型跨站脚本', 100);
    const second = recordSectionCompletion('xss', '反射型跨站脚本', 200);

    expect(isSectionCompleted(first, 'xss', '反射型跨站脚本')).toBe(true);
    expect(second.completedSections).toEqual(first.completedSections);
  });

  test('drops malformed persisted values', () => {
    expect(sanitizeProgress({
      completedSections: {
        valid: { completedAt: 10 },
        invalid: { completedAt: 'not-a-date' },
      },
      recentSections: [{ categoryId: '', sectionTitle: 'bad', visitedAt: 10 }],
    })).toEqual({
      completedSections: { valid: { completedAt: 10 } },
      recentSections: [],
    });
  });
});
