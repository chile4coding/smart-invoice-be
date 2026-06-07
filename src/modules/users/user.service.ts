import { Role } from '@prisma/client';
import prisma from '../../config/database';
import { hashPassword } from '../../utils/bcrypt';

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  createdById: string;
};

type ListUsersParams = {
  search?: string;
  page: number;
  limit: number;
};

export const createUser = async (input: CreateUserInput) => {
  const hashedPassword = await hashPassword(input.password);
  return prisma.user.create({
    data: { ...input, password: hashedPassword },
    select: safeUserSelect,
  });
};

export const listUsers = async ({ search, page, limit }: ListUsersParams) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: safeUserSelect,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: safeUserSelect });

export const updateProfile = (id: string, firstName: string, lastName: string) =>
  prisma.user.update({ where: { id }, data: { firstName, lastName }, select: safeUserSelect });

export const changePassword = async (id: string, newPassword: string) => {
  const hashedPassword = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: safeUserSelect,
  });
};

export const changeRole = (id: string, role: Role) =>
  prisma.user.update({ where: { id }, data: { role }, select: safeUserSelect });

export const deactivateUser = async (id: string) =>{
  const user  = await prisma.user.findFirst({
    where:{
      id
    }
  })
  const isActive = !user?.isActive

  return   prisma.user.update({ where: { id }, data: { isActive }, select: safeUserSelect });

}

type DashboardStatsInput = {
  totalAttendance: string;
  newRegistration: string;
  followUp: string;
  totalPatients: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  totalPayments: string;
};

export const upsertDashboardStats = (userId: string, input: DashboardStatsInput) =>
  prisma.dashboardStats.upsert({
    where: { userId },
    update: { ...input },
    create: { userId, ...input },
  });

export const getDashboardStats = (userId: string) =>
  prisma.dashboardStats.findUnique({ where: { userId } });
