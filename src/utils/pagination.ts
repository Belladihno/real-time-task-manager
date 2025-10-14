import { Model } from "mongoose";
import { IPaginationResult, IPaginationOptions } from "@/@types/interface";

export const paginate = async (
  Model: Model<any>,
  options: IPaginationOptions = {}
) => {
  const page: number = options.page || 1;
  const limit: number = options.limit || 10;
  const select: string = options.select || "-__v";
  const populate = options.populate || "";
  const sort = options.sort || "";
  const filter: object = options.filter || {};

  const skip: number = (page - 1) * limit;

  let query = Model.find(filter);

  if (select) {
    query = query.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        query = query.populate(pop);
      });
    } else if (typeof populate === 'object') {
      query = query.populate(populate);
    } else {
      query = query.populate(populate);
    }
  }

  if (sort) {
    query = query.sort(sort);
  }

  const [data, total] = await Promise.all([
    query.limit(limit).skip(skip).lean(),
    Model.countDocuments(filter),
  ]);

  const totalPages: number = Math.ceil(total / limit);

  const paginationInfo: IPaginationResult = {
    page,
    limit,
    total,
    totalPages,
  };

  return {
    data,
    pagination: paginationInfo,
  };
};
