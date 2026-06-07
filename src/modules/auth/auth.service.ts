import prisma from '../../config/database';
import { comparePassword } from '../../utils/bcrypt';
import { signToken } from '../../utils/jwt';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) return null;

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return null;

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  const { password: _pw, ...safeUser } = user;
  return { accessToken: token, user: safeUser };
};

export const getCurrentUser = (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId , 
      
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      dashboardStats: true
    },
    
  });
