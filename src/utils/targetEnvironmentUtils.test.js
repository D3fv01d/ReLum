import {
  getExerciseNameForImage,
  getTargetEnvironmentStats,
  listTargetSections,
} from './targetEnvironmentUtils';

describe('target environment catalog', () => {
  test('exposes one local runtime for all configured sections', () => {
    const sections = listTargetSections();
    const imageNames = new Set(sections.map(({ target }) => target.dockerImage));

    expect(sections).toHaveLength(137);
    expect([...imageNames]).toEqual(['relum/local-lab:latest']);
    expect(getExerciseNameForImage('relum/local-lab:latest')).toBe(
      'ReLum 本地靶场运行时（覆盖 137 个章节）'
    );
  });

  test('counts the shared image as installing every mapped section', () => {
    expect(getTargetEnvironmentStats([])).toEqual({
      totalEnvironments: 137,
      installedCount: 0,
      installPercent: 0,
    });

    expect(getTargetEnvironmentStats(['relum/local-lab:latest'])).toEqual({
      totalEnvironments: 137,
      installedCount: 137,
      installPercent: 100,
    });
  });
});
