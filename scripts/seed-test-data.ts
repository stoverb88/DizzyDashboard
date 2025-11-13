// Test Data Seeder
// Creates test users and invitation codes for testing authentication

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...\n')

  // Create test medical professional
  const testDoctor = await prisma.user.upsert({
    where: { email: 'doctor@test.com' },
    update: {},
    create: {
      email: 'doctor@test.com',
      password: await bcrypt.hash('Test1234!', 12),
      name: 'Dr. Test User',
      role: 'MEDICAL_PROFESSIONAL',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created test medical professional:')
  console.log('   Email: doctor@test.com')
  console.log('   Password: Test1234!')
  console.log('   ID:', testDoctor.id)
  console.log()

  // Create test patient invitation codes
  const patientCode1 = await prisma.patientInvite.upsert({
    where: { code: '123456' },
    update: {},
    create: {
      code: '123456',
      createdBy: testDoctor.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUses: 1,
      note: 'Test patient code 1',
    },
  })
  console.log('✅ Created test patient code:')
  console.log('   Code: 123456')
  console.log('   Expires:', patientCode1.expiresAt.toLocaleDateString())
  console.log()

  const patientCode2 = await prisma.patientInvite.upsert({
    where: { code: '654321' },
    update: {},
    create: {
      code: '654321',
      createdBy: testDoctor.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUses: 1,
      note: 'Test patient code 2',
    },
  })
  console.log('✅ Created test patient code:')
  console.log('   Code: 654321')
  console.log('   Expires:', patientCode2.expiresAt.toLocaleDateString())
  console.log()

  // Create test medical professional invitation
  const medicalInvite = await prisma.medicalInvite.upsert({
    where: { email: 'newdoctor@test.com' },
    update: {},
    create: {
      email: 'newdoctor@test.com',
      token: 'test-invite-token-' + Math.random().toString(36).substring(7),
      createdBy: testDoctor.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })
  console.log('✅ Created test medical professional invitation:')
  console.log('   Email: newdoctor@test.com')
  console.log('   Token:', medicalInvite.token)
  console.log('   Invite URL: http://localhost:3001/register/medical?token=' + medicalInvite.token)
  console.log('   Expires:', medicalInvite.expiresAt.toLocaleDateString())
  console.log()

  console.log('✨ Seeding complete!\n')
  console.log('📝 Test Instructions:')
  console.log('1. Medical Professional Login:')
  console.log('   - Go to http://localhost:3001/login')
  console.log('   - Select "Medical Professional"')
  console.log('   - Email: doctor@test.com')
  console.log('   - Password: Test1234!')
  console.log()
  console.log('2. Patient Login:')
  console.log('   - Go to http://localhost:3001/login')
  console.log('   - Select "Patient"')
  console.log('   - Enter code: 123456 or 654321')
  console.log()
  console.log('3. View data in Prisma Studio:')
  console.log('   - http://localhost:5555')
  console.log()
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
