import prisma from '../../config/database';

type ListDepartmentsParams = { search?: string; page: number; limit: number };

export const listDepartments = async ({ search, page, limit }: ListDepartmentsParams) => {
  const skip = (page - 1) * limit;
  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.department.count({ where }),
  ]);

  return { departments, total, page, limit, totalPages: Math.ceil(total / limit) };
};

type ListFeesParams = { identifier: string; search?: string; page: number; limit: number };

export const listDepartmentFees = async ({ identifier, search, page, limit }: ListFeesParams) => {
  const skip = (page - 1) * limit;

  const department = await prisma.department.findFirst({
    where: {
      OR: [
        { id: identifier },
        { externalId: identifier },
        { name: { equals: identifier, mode: 'insensitive' } },
      ],
    },
  });

  if (!department) return null;

  const feesWhere = {
    departmentId: department.id,
    ...(search ? { billname: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [fees, total] = await Promise.all([
    prisma.departmentFee.findMany({
      where: feesWhere,
      skip,
      take: limit,
      orderBy: { billname: 'asc' },
    }),
    prisma.departmentFee.count({ where: feesWhere }),
  ]);

  return { department, fees, total, page, limit, totalPages: Math.ceil(total / limit) };
};
