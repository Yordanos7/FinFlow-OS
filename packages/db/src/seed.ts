import { PrismaClient } from '../prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../../apps/server/.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'ai_config' },
    update: {},
    create: {
      key: 'ai_config',
      value: {
        provider: 'google',
        model: 'gemini-2.0-flash-exp',
        enabled: true
      },
      category: 'ai'
    }
  });

  // 2. Create Demo Company
  const company = await prisma.company.upsert({
    where: { slug: 'demo-corp' },
    update: {},
    create: {
      name: 'Demo Corporation',
      slug: 'demo-corp',
      industry: 'Technology',
      size: 'medium',
      country: 'Ethiopia',
      city: 'Addis Ababa',
      settings: {
        currency: 'ETB',
        fiscalYearStart: '07-08' // Hamle 1
      }
    }
  });

  console.log('🏢 Created company:', company.name);

  // 3. Create Departments
  const financeDept = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Finance',
      budget: 1000000
    }
  });
  console.log('💰 Created department:', financeDept.name);

  // 4. Create Admin User
  const adminEmail = 'admin@finflow.os';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'FinFlow Admin',
      password: 'hashed_password_here', // In prod, use bcrypt
      emailVerified: true,
      companyMemberships: {
        create: {
          companyId: company.id,
          role: 'super_admin',
          status: 'active'
        }
      }
    }
  });

  console.log('👤 Created user:', admin.name);

  // 5. Create AI Models
  await prisma.aIModel.upsert({
    where: { name: 'Gemini Flash' },
    update: {},
    create: {
      name: 'Gemini Flash',
      type: 'chat',
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      isActive: true
    }
  });

  console.log('🤖 Created AI models');
  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
