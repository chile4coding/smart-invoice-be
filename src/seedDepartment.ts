import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface RawDepartment {
  id: string | number;
  name: string;
  hcode: string;
  dtype: string;
  status?: number | string;
  dept_group?: string | null;
  recno?: string | number | null;
}

interface RawFeeItem {
  billname: string;
  billcost: number;
  status: number;
  nf_price: number;
  hmo_fees: string;
  sno: number;
  id: string;
}

interface BillsOutput {
  unit: string;
  items: RawFeeItem[];
}

export async function seedDepartment(): Promise<void> {
  const raw = fs.readFileSync(
    path.join(__dirname, '../../department.json'),
    'utf-8'
  );
  const { status: departments }: { status: RawDepartment[] } = JSON.parse(raw);

  console.log(`Seeding ${departments.length} departments...`);

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        externalId: String(dept.id),
        hcode: dept.hcode,
        dtype: dept.dtype,
        isActive: dept.status !== undefined ? Number(dept.status) === 1 : true,
        deptGroup: dept.dept_group ?? null,
        recno: dept.recno !== undefined && dept.recno !== null ? String(dept.recno) : null,
      },
      create: {
        externalId: String(dept.id),
        name: dept.name,
        hcode: dept.hcode,
        dtype: dept.dtype,
        isActive: dept.status !== undefined ? Number(dept.status) === 1 : true,
        deptGroup: dept.dept_group ?? null,
        recno: dept.recno !== undefined && dept.recno !== null ? String(dept.recno) : null,
      },
    });
  }

  console.log('Departments seeded successfully.');
}

export async function seedUnit(): Promise<void> {
  const outputDir = path.join(__dirname, '../../bills_output');

  if (!fs.existsSync(outputDir)) {
    console.warn(`bills_output directory not found at ${outputDir}. Run fetchBills.js first.`);
    return;
  }

  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith('.json'));
  console.log(`Seeding fees from ${files.length} unit files...`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(outputDir, file), 'utf-8');
    const { unit, items }: BillsOutput = JSON.parse(raw);

    const department = await prisma.department.findUnique({ where: { name: unit } });

    if (!department) {
      console.warn(`  Department not found for unit "${unit}" — skipping. Run seedDepartment() first.`);
      continue;
    }

    console.log(`  Seeding ${items.length} fees for "${unit}"...`);

    for (const item of items) {
      await prisma.departmentFee.upsert({
        where: { externalId: item.id },
        update: {
          billname: item.billname,
          billcost: item.billcost,
          status: item.status,
          nfPrice: item.nf_price,
          hmoFees: item.hmo_fees || null,
          sno: item.sno,
        },
        create: {
          billname: item.billname,
          billcost: item.billcost,
          status: item.status,
          nfPrice: item.nf_price,
          hmoFees: item.hmo_fees || null,
          sno: item.sno,
          externalId: item.id,
          departmentId: department.id,
        },
      });
    }
  }

  console.log('Department fees seeded successfully.');
}

async function main(): Promise<void> {
  await seedDepartment();
  await seedUnit();
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
