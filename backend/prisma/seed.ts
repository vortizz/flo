import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import axios from 'axios'
import { CATEGORIES, CATEGORY_MAPPINGS } from './seed-data'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function getBasiqToken() {
  const response = await axios.post(
    `${process.env.BASIQ_BASE_URL}/token`,
    'scope=SERVER_ACCESS',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${process.env.BASIQ_API_KEY}`,
        'basiq-version': '3.0',
      },
    },
  )
  return response.data.access_token
}

async function main() {
  // ─── Categories ───────────────────────────────────────────────────────────
  console.log('Seeding categories...')

  for (const category of CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name, type: category.type },
    })

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { color: category.color, icon: category.icon },
      })
    } else {
      await prisma.category.create({
        data: { ...category, userId: null },
      })
    }
  }

  console.log('✅ Categories seeded successfully')

  // ─── Category Mappings ────────────────────────────────────────────────────
  console.log('Seeding category mappings...')

  for (const mapping of CATEGORY_MAPPINGS) {
    const category = await prisma.category.findFirst({
      where: { userId: null, name: mapping.categoryName, type: mapping.type },
    })

    if (!category) {
      console.warn(
        `Category not found: ${mapping.categoryName} (${mapping.type})`,
      )
      continue
    }

    const existing = await prisma.categoryMapping.findFirst({
      where: { basiqLabel: mapping.basiqLabel, categoryId: category.id },
    })

    if (!existing) {
      await prisma.categoryMapping.create({
        data: { basiqLabel: mapping.basiqLabel, categoryId: category.id },
      })
    }
  }

  console.log('✅ Category mappings seeded successfully')

  // ─── Institutions ─────────────────────────────────────────────────────────
  console.log('Seeding institutions...')

  const token = await getBasiqToken()

  const response = await axios.get(
    `${process.env.BASIQ_BASE_URL}/institutions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'basiq-version': '3.0',
      },
    },
  )

  const institutions = response.data.data.filter(
    (i: { country: string }) => i.country === 'Australia',
  )

  console.log(`Found ${institutions.length} Australian institutions`)

  const POPULAR_INSTITUTION_NAMES = ['CBA', 'ANZ', 'Westpac', 'NAB', 'Amex']

  for (const institution of institutions) {
    await prisma.institution.upsert({
      where: { id: institution.id },
      update: {
        name: institution.name,
        shortName: institution.shortName,
        institutionType: institution.institutionType,
        logoUrl: institution.logo?.links?.square || null,
        isActive: true,
        isPopular: POPULAR_INSTITUTION_NAMES.some(
          n => institution.shortName === n,
        ),
      },
      create: {
        id: institution.id,
        name: institution.name,
        shortName: institution.shortName,
        institutionType: institution.institutionType,
        country: institution.country,
        logoUrl: institution.logo?.links?.square || null,
        isActive: true,
        isPopular: POPULAR_INSTITUTION_NAMES.some(
          n => institution.shortName === n,
        ),
      },
    })
  }

  console.log('✅ Institutions seeded successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
