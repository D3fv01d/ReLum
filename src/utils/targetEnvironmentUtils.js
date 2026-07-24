import { targetEnvironments } from '../config/targetEnvironments';

const UNKNOWN_REPOSITORY = '未知';
const DEFAULT_TAG = 'latest';

const parseImageName = (imageName) => {
  const normalizedName = String(imageName || UNKNOWN_REPOSITORY);
  const lastSlashIndex = normalizedName.lastIndexOf('/');
  const lastColonIndex = normalizedName.lastIndexOf(':');

  if (lastColonIndex > lastSlashIndex) {
    return {
      repository: normalizedName.slice(0, lastColonIndex) || UNKNOWN_REPOSITORY,
      tag: normalizedName.slice(lastColonIndex + 1) || DEFAULT_TAG,
    };
  }

  return {
    repository: normalizedName,
    tag: DEFAULT_TAG,
  };
};

const getImageCandidates = (image) => {
  if (!image) {
    return [];
  }

  if (typeof image === 'string') {
    const { repository, tag } = parseImageName(image);
    return [image, `${repository}:${tag}`, repository].filter(Boolean);
  }

  const repository = image.repository || image.name || image.Image || UNKNOWN_REPOSITORY;
  const tag = image.tag || image.Tag || DEFAULT_TAG;

  return [
    image.fullName,
    image.FullName,
    `${repository}:${tag}`,
    repository,
  ].filter(Boolean);
};

export const normalizeImage = (image) => {
  if (typeof image === 'string') {
    const { repository, tag } = parseImageName(image);

    return {
      fullName: image,
      repository,
      tag,
      id: image,
      size: '未知',
      createdSince: '未知',
    };
  }

  const repository = image.repository || image.name || image.Image || UNKNOWN_REPOSITORY;
  const tag = image.tag || image.Tag || DEFAULT_TAG;
  const fullName = image.fullName || image.FullName || `${repository}:${tag}`;

  return {
    repository,
    tag,
    fullName,
    id: image.id || image.ID || image.Id || fullName,
    size: image.size || image.Size || '未知',
    createdSince: image.createdSince || image.CreatedSince || '未知',
  };
};

export const isMeaningfulImage = (image) => {
  if (!image) {
    return false;
  }

  const { repository, tag } = typeof image === 'string'
    ? parseImageName(image)
    : {
      repository: image.repository || image.name || image.Image,
      tag: image.tag || image.Tag,
    };

  return !(
    (repository === '<none>' || repository === 'none') &&
    (tag === '<none>' || tag === 'none')
  );
};

export const getImageName = (image) => getImageCandidates(image)[0] || UNKNOWN_REPOSITORY;

export const isImageInstalled = (installedImages, dockerImage) => (
  installedImages.some(image => getImageCandidates(image).includes(dockerImage))
);

export const listTargetSections = (environments = targetEnvironments) => (
  Object.keys(environments).flatMap(category => {
    const sections = environments[category].sections || {};

    return Object.keys(sections).map(sectionName => ({
      category,
      sectionName,
      target: sections[sectionName],
    }));
  })
);

export const getExerciseNameForImage = (imageName, environments = targetEnvironments) => {
  const matches = listTargetSections(environments)
    .filter(({ target }) => target.dockerImage === imageName);

  if (matches.length > 1) {
    return `ReLum 本地靶场运行时（覆盖 ${matches.length} 个章节）`;
  }

  return matches.length === 1
    ? `${matches[0].sectionName} (${matches[0].category})`
    : '未知题目';
};

export const getFilteredEnvironmentGroups = (query = '', environments = targetEnvironments) => {
  const normalizedQuery = query.trim().toLowerCase();

  return Object.keys(environments)
    .map(category => {
      const sections = environments[category].sections || {};
      const matchingSections = Object.keys(sections)
        .filter(sectionName => {
          if (!normalizedQuery) {
            return true;
          }

          const target = sections[sectionName];
          return [
            category,
            sectionName,
            target.description,
            target.dockerImage,
          ].some(value => String(value || '').toLowerCase().includes(normalizedQuery));
        })
        .map(sectionName => ({
          sectionName,
          target: sections[sectionName],
        }));

      return {
        category,
        sections: matchingSections,
      };
    })
    .filter(group => group.sections.length > 0);
};

export const getTargetEnvironmentStats = (
  installedImages = [],
  environments = targetEnvironments
) => {
  const targetSections = listTargetSections(environments);
  const totalEnvironments = targetSections.length;
  const installedCount = targetSections.filter(({ target }) => (
    isImageInstalled(installedImages, target.dockerImage)
  )).length;

  return {
    totalEnvironments,
    installedCount,
    installPercent: totalEnvironments
      ? Math.round((installedCount / totalEnvironments) * 100)
      : 0,
  };
};
