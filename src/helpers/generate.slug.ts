export const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const generateUniqueSlug = async (
  baseSlug: string,
  Model: any,
  currentId: any = null
) => {
  let counter = 1;
  let slug = baseSlug;

  const buildQuery = (slugToCheck: string) =>
    currentId
      ? { slug: slugToCheck, _id: { $ne: currentId } }
      : { slug: slugToCheck };

  while (await Model.findOne(buildQuery(slug))) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
