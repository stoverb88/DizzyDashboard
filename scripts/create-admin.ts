// Create Admin User Script
// Creates an admin user for accessing the /admin portal

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface Args {
  email?: string
  password?: string
  name?: string
  force?: boolean
}

function parseArgs(): Args {
  const args: Args = {}
  const argv = process.argv.slice(2)

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--email' && i + 1 < argv.length) {
      args.email = argv[++i]
    } else if (arg === '--password' && i + 1 < argv.length) {
      args.password = argv[++i]
    } else if (arg === '--name' && i + 1 < argv.length) {
      args.name = argv[++i]
    } else if (arg === '--force') {
      args.force = true
    }
  }

  return args
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  return { valid: true }
}

async function main() {
  console.log('🔧 Admin User Creation Script\n')

  const args = parseArgs()

  // Validate required arguments
  if (!args.email) {
    console.error('❌ Error: --email is required')
    console.log('\nUsage: npm run db:create-admin -- --email admin@example.com --password YourPassword123 [--name "Admin Name"] [--force]')
    process.exit(1)
  }

  if (!args.password) {
    console.error('❌ Error: --password is required')
    console.log('\nUsage: npm run db:create-admin -- --email admin@example.com --password YourPassword123 [--name "Admin Name"] [--force]')
    process.exit(1)
  }

  // Validate email format
  if (!validateEmail(args.email)) {
    console.error('❌ Error: Invalid email format')
    process.exit(1)
  }

  // Validate password strength
  const passwordValidation = validatePassword(args.password)
  if (!passwordValidation.valid) {
    console.error(`❌ Error: ${passwordValidation.message}`)
    process.exit(1)
  }

  const emailLower = args.email.toLowerCase()

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  })

  if (existingUser && !args.force) {
    console.error(`❌ Error: User with email "${emailLower}" already exists`)
    console.log('   Use --force flag to overwrite the existing user')
    process.exit(1)
  }

  // Hash password
  console.log('🔐 Hashing password...')
  const hashedPassword = await bcrypt.hash(args.password, 12)

  // Create or update admin user
  try {
    let admin

    if (args.force && existingUser) {
      console.log(`⚠️  Updating existing user "${emailLower}" to admin...`)
      admin = await prisma.user.update({
        where: { email: emailLower },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: args.name || existingUser.name,
        },
      })
    } else {
      console.log('👤 Creating admin user...')
      admin = await prisma.user.create({
        data: {
          email: emailLower,
          password: hashedPassword,
          role: 'ADMIN',
          name: args.name || null,
        },
      })
    }

    console.log('\n✅ Admin user created successfully!\n')
    console.log('📋 Admin Details:')
    console.log(`   ID:    ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name:  ${admin.name || '(none)'}`)
    console.log(`   Role:  ${admin.role}`)
    console.log('\n🚀 Next Steps:')
    console.log('   1. Navigate to https://localhost:3000/login')
    console.log('   2. Login with your admin credentials')
    console.log('   3. Access the admin panel at https://localhost:3000/admin')
    console.log('')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
