import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, CampaignRole, ScopeType, SupportGroupCategory, VerificationStatus, CommitmentStatus, FieldReportType, IncidentType, IncidentSeverity, SituationStatus } from '../src/generated/client';
import { createPgAdapter } from '../src/client';
import { seedJigawaInecFromDirectory } from './seed-inec';
import { seedHadejiaCollationResults, seedStateLgaSummaries } from './seed-collation';
import * as bcrypt from 'bcrypt';

import { NIGERIAN_REGISTERED_PARTIES } from '../../shared/src/parties';

const TRACKED_PARTIES = NIGERIAN_REGISTERED_PARTIES;
const CLIENT_PARTY_CODE = 'APC';
const PARTY_CODES = TRACKED_PARTIES.map((party) => party.code);

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const { adapter, pool } = createPgAdapter(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Electromon database...');

  const states = [
    { name: 'Jigawa', code: 'JI' }
  ];

  for (const state of states) {
    await prisma.state.upsert({
      where: { code: state.code },
      update: {},
      create: state,
    });
  }

  const jigawa = await prisma.state.findUniqueOrThrow({ where: { code: 'JI' } });

  const districts = ['Jigawa North West', 'Jigawa North East', 'Jigawa South West', 'Jigawa South East'];
  const districtRecords = [];
  for (const name of districts) {
    const district = await prisma.senatorialDistrict.upsert({
      where: { name_stateId: { name, stateId: jigawa.id } },
      update: {},
      create: { name, stateId: jigawa.id },
    });
    districtRecords.push(district);
  }

  const jigawaLgas = [
    { name: 'Auyo', district: 'Jigawa North East' },
    { name: 'Babura', district: 'Jigawa North West' },
    { name: 'Biriniwa', district: 'Jigawa North East' },
    { name: 'Birnin Kudu', district: 'Jigawa South West' },
    { name: 'Buji', district: 'Jigawa South East' },
    { name: 'Dutse', district: 'Jigawa South West' },
    { name: 'Gagarawa', district: 'Jigawa North East' },
    { name: 'Garki', district: 'Jigawa South East' },
    { name: 'Gumel', district: 'Jigawa North West' },
    { name: 'Guri', district: 'Jigawa North East' },
    { name: 'Gwaram', district: 'Jigawa South East' },
    { name: 'Gwiwa', district: 'Jigawa North West' },
    { name: 'Hadejia', district: 'Jigawa North East' },
    { name: 'Jahun', district: 'Jigawa South West' },
    { name: 'Kafin Hausa', district: 'Jigawa North East' },
    { name: 'Kaugama', district: 'Jigawa North West' },
    { name: 'Kazaure', district: 'Jigawa North West' },
    { name: 'Kiri Kasama', district: 'Jigawa North East' },
    { name: 'Kiyawa', district: 'Jigawa South West' },
    { name: 'Maigatari', district: 'Jigawa North West' },
    { name: 'Malam Madori', district: 'Jigawa North East' },
    { name: 'Miga', district: 'Jigawa South West' },
    { name: 'Ringim', district: 'Jigawa South East' },
    { name: 'Roni', district: 'Jigawa North West' },
    { name: 'Sule Tankarkar', district: 'Jigawa North West' },
    { name: 'Taura', district: 'Jigawa South East' },
    { name: 'Yankwashi', district: 'Jigawa North West' },
  ];

  for (const lga of jigawaLgas) {
    const district = districtRecords.find((d) => d.name === lga.district);
    await prisma.lGA.upsert({
      where: { name_stateId: { name: lga.name, stateId: jigawa.id } },
      update: {},
      create: {
        name: lga.name,
        stateId: jigawa.id,
        senatorialDistrictId: district?.id,
      },
    });
  }

  const allLgas = await prisma.lGA.findMany({
    where: { stateId: jigawa.id },
    orderBy: { name: 'asc' },
  });

  const seedDataDir = resolve(__dirname, 'seed-data');
  const lgasByName = Object.fromEntries(allLgas.map((lga) => [lga.name, lga]));
  const jigawaInec = await seedJigawaInecFromDirectory(prisma, seedDataDir, lgasByName);

  const campaign = await prisma.campaign.upsert({
    where: { slug: 'jigawa-2027' },
    update: {
      clientPartyCode: CLIENT_PARTY_CODE,
      trackedParties: TRACKED_PARTIES,
    },
    create: {
      name: 'Jigawa State Campaign 2027',
      slug: 'jigawa-2027',
      stateId: jigawa.id,
      clientPartyCode: CLIENT_PARTY_CODE,
      trackedParties: TRACKED_PARTIES,
    },
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const director = await prisma.user.upsert({
    where: { email: 'director@electromon.ng' },
    update: {},
    create: {
      email: 'director@electromon.ng',
      phoneNumber: '+2348000000001',
      passwordHash,
      firstName: 'Campaign',
      lastName: 'Director',
      isActive: true,
    },
  });

  await prisma.campaignMembership.upsert({
    where: { userId_campaignId: { userId: director.id, campaignId: campaign.id } },
    update: {},
    create: {
      userId: director.id,
      campaignId: campaign.id,
      role: CampaignRole.CAMPAIGN_DIRECTOR,
      scopeType: ScopeType.CAMPAIGN,
      scopeId: campaign.id,
    },
  });

  const hadejia = lgasByName['Hadejia'];
  if (!hadejia) {
    throw new Error('Database missing Hadejia LGA');
  }

  const hadejiaInec = jigawaInec['Hadejia'];
  if (!hadejiaInec) {
    throw new Error('INEC seed missing Hadejia LGA');
  }

  const atafiWard = hadejiaInec.wardsByName['ATAFI'];
  const pu001 = hadejiaInec.pollingUnitsByCode['17-13-01-001'];
  const pu002 = hadejiaInec.pollingUnitsByCode['17-13-01-002'];

  if (!atafiWard || !pu001) {
    throw new Error('INEC seed missing ATAFI ward or 17-13-01-001 polling unit');
  }

  const ward = { id: atafiWard.id, name: atafiWard.name };

  await prisma.pollingUnit.update({
    where: { id: pu001.id },
    data: { strengthAssessment: 'STRONG' },
  });

  if (pu002) {
    await prisma.pollingUnit.update({
      where: { id: pu002.id },
      data: {
        strengthAssessment: 'SWING',
        status: 'NEEDS_ATTENTION',
        notes: 'High opposition activity reported during last election',
      },
    });
  }

  const collationUsers = [
    {
      email: 'pu.officer@electromon.ng',
      phoneNumber: '+2348000000002',
      firstName: 'PU',
      lastName: 'Officer',
      role: CampaignRole.POLLING_UNIT_OFFICER,
      scopeType: ScopeType.POLLING_UNIT,
      scopeId: pu001.id,
    },
    {
      email: 'ward.officer@electromon.ng',
      phoneNumber: '+2348000000003',
      firstName: 'Ward',
      lastName: 'Officer',
      role: CampaignRole.WARD_RA_OFFICER,
      scopeType: ScopeType.WARD,
      scopeId: atafiWard.id,
    },
    {
      email: 'lga.officer@electromon.ng',
      phoneNumber: '+2348000000004',
      firstName: 'LGA',
      lastName: 'Officer',
      role: CampaignRole.LGA_COLLATION_OFFICER,
      scopeType: ScopeType.LGA,
      scopeId: hadejia.id,
    },
    {
      email: 'state.officer@electromon.ng',
      phoneNumber: '+2348000000005',
      firstName: 'State',
      lastName: 'Officer',
      role: CampaignRole.STATE_COLLATION_OFFICER,
      scopeType: ScopeType.STATE,
      scopeId: jigawa.id,
    },
    {
      email: 'national.officer@electromon.ng',
      phoneNumber: '+2348000000006',
      firstName: 'National',
      lastName: 'Officer',
      role: CampaignRole.NATIONAL_COLLATION_OFFICER,
      scopeType: ScopeType.NATIONAL,
      scopeId: 'NGA',
    },
  ];

  const seededOfficers: Record<string, string> = {};

  for (const officer of collationUsers) {
    const user = await prisma.user.upsert({
      where: { email: officer.email },
      update: {},
      create: {
        email: officer.email,
        phoneNumber: officer.phoneNumber,
        passwordHash,
        firstName: officer.firstName,
        lastName: officer.lastName,
        isActive: true,
      },
    });

    await prisma.campaignMembership.upsert({
      where: { userId_campaignId: { userId: user.id, campaignId: campaign.id } },
      update: {
        role: officer.role,
        scopeType: officer.scopeType,
        scopeId: officer.scopeId,
      },
      create: {
        userId: user.id,
        campaignId: campaign.id,
        role: officer.role,
        scopeType: officer.scopeType,
        scopeId: officer.scopeId,
      },
    });

    seededOfficers[officer.email] = user.id;
  }

  console.log('Seeding collation results (APC vs PDP vs NNPP)...');
  const hadejiaStats = await seedHadejiaCollationResults(
    prisma,
    campaign.id,
    hadejia.id,
    PARTY_CODES,
    seededOfficers['pu.officer@electromon.ng'],
  );
  await seedStateLgaSummaries(prisma, campaign.id, jigawa.id, PARTY_CODES);
  console.log(
    `  Hadejia: ${hadejiaStats.seededPus} PUs, ${hadejiaStats.seededWards} wards with sample results`,
  );
  console.log(`  Campaign party: ${CLIENT_PARTY_CODE} · Tracking: ${PARTY_CODES.join(', ')}`);

  const dutse = await prisma.lGA.findFirstOrThrow({
    where: { name: 'Dutse', stateId: jigawa.id },
  });

  const sampleGroups = [
    {
      name: 'Hadejia Youth Forum',
      category: SupportGroupCategory.YOUTH,
      leaderName: 'Ibrahim Musa',
      leaderPhone: '+2348012345678',
      leaderEmail: 'ibrahim@example.com',
      memberCount: 120,
      lgaId: hadejia.id,
      areaOfOperation: 'Hadejia town and surrounds',
      verificationStatus: VerificationStatus.ACTIVE,
    },
    {
      name: 'Dutse Women Alliance',
      category: SupportGroupCategory.WOMEN,
      leaderName: 'Fatima Abdullahi',
      leaderPhone: '+2348098765432',
      memberCount: 85,
      lgaId: dutse.id,
      areaOfOperation: 'Dutse LGA',
      verificationStatus: VerificationStatus.VERIFIED,
    },
    {
      name: 'Jigawa Farmers Cooperative',
      category: SupportGroupCategory.FARMERS,
      leaderName: 'Usman Garba',
      leaderPhone: '+2348076543210',
      memberCount: 200,
      areaOfOperation: 'Statewide',
      verificationStatus: VerificationStatus.PENDING,
    },
  ];

  for (const group of sampleGroups) {
    const existing = await prisma.supportGroup.findFirst({
      where: { campaignId: campaign.id, name: group.name },
    });
    if (!existing) {
      await prisma.supportGroup.create({
        data: { campaignId: campaign.id, ...group },
      });
    }
  }

  const youthForum = await prisma.supportGroup.findFirstOrThrow({
    where: { campaignId: campaign.id, name: 'Hadejia Youth Forum' },
  });
  const womenAlliance = await prisma.supportGroup.findFirstOrThrow({
    where: { campaignId: campaign.id, name: 'Dutse Women Alliance' },
  });

  const sampleCommitments = [
    {
      supportGroupId: youthForum.id,
      title: 'Mobilize 500 youth voters in Hadejia',
      description: 'Door-to-door outreach before INEC registration deadline',
      targetValue: 500,
      currentValue: 120,
      deadline: new Date('2026-12-31'),
      status: CommitmentStatus.ACTIVE,
    },
    {
      supportGroupId: womenAlliance.id,
      title: 'Organize 20 ward-level women rallies',
      description: 'Coordinate rallies across Dutse LGA wards',
      targetValue: 20,
      currentValue: 8,
      deadline: new Date('2026-10-15'),
      status: CommitmentStatus.ACTIVE,
    },
    {
      supportGroupId: youthForum.id,
      title: 'Register 1,000 new party members',
      targetValue: 1000,
      currentValue: 0,
      deadline: new Date('2027-01-31'),
      status: CommitmentStatus.DRAFT,
    },
  ];

  for (const commitment of sampleCommitments) {
    const existing = await prisma.commitment.findFirst({
      where: { campaignId: campaign.id, title: commitment.title },
    });
    if (!existing) {
      await prisma.commitment.create({
        data: { campaignId: campaign.id, ...commitment },
      });
    }
  }

  const sampleVolunteers = [
    {
      firstName: 'Amina',
      lastName: 'Yusuf',
      phoneNumber: '+2348011111001',
      email: 'amina.yusuf@example.com',
      wardId: ward.id,
      role: 'CANVASSER',
      performanceScore: 72,
      isVerified: true,
    },
    {
      firstName: 'Musa',
      lastName: 'Bello',
      phoneNumber: '+2348011111002',
      wardId: ward.id,
      role: 'POLLING_AGENT',
      performanceScore: 45,
      isVerified: false,
    },
    {
      firstName: 'Halima',
      lastName: 'Danladi',
      phoneNumber: '+2348011111003',
      email: 'halima@example.com',
      role: 'MOBILIZER',
      performanceScore: 88,
      isVerified: true,
    },
  ];

  for (const volunteer of sampleVolunteers) {
    const existing = await prisma.volunteer.findFirst({
      where: { campaignId: campaign.id, phoneNumber: volunteer.phoneNumber },
    });
    if (!existing) {
      await prisma.volunteer.create({
        data: { campaignId: campaign.id, ...volunteer },
      });
    }
  }

  const pollingAgent = await prisma.volunteer.findFirst({
    where: { campaignId: campaign.id, phoneNumber: '+2348011111002' },
  });
  if (pollingAgent) {
    await prisma.pollingUnit.update({
      where: { id: pu001.id },
      data: { assignedAgentId: pollingAgent.id },
    });
  }

  if (pu001 && pu002) {
    const situationSamples = [
      {
        pollingUnitId: pu001.id,
        reportedById: director.id,
        status: SituationStatus.REPORTING,
        notes: 'Voting underway. Good turnout observed.',
        isUrgent: false,
      },
      {
        pollingUnitId: pu002.id,
        reportedById: director.id,
        status: SituationStatus.INCIDENT,
        notes: 'Materials arrived late. Situation being monitored.',
        isUrgent: true,
      },
      {
        pollingUnitId: pu001.id,
        reportedById: director.id,
        status: SituationStatus.OPEN,
        notes: 'PU opened on time. Agents in position.',
        isUrgent: false,
      },
    ];

    for (const sample of situationSamples) {
      const existing = await prisma.situationUpdate.findFirst({
        where: {
          pollingUnitId: sample.pollingUnitId,
          notes: sample.notes,
        },
      });
      if (!existing) {
        await prisma.situationUpdate.create({ data: sample });
      }
    }
  }

  const fieldReportSamples = [
    {
      campaignId: campaign.id,
      reportedById: director.id,
      type: FieldReportType.CAMPAIGN_PROGRESS,
      title: 'Strong turnout in ATAFI ward',
      description: 'Early morning reports indicate higher than expected voter turnout at ATAFI/RAMIN ATAFI polling unit.',
      wardId: ward.id,
      pollingUnitId: pu001?.id,
      isUrgent: false,
    },
    {
      campaignId: campaign.id,
      reportedById: director.id,
      type: FieldReportType.INCIDENT,
      incidentType: IncidentType.UNAUTHORIZED_PERSONNEL,
      incidentSeverity: IncidentSeverity.HIGH,
      title: 'Opposition supporters near 17-13-01-002',
      description: 'Group of unidentified persons gathering 200m from KASGAYAMA polling unit. Local coordinators notified.',
      wardId: ward.id,
      pollingUnitId: pu002?.id,
      isUrgent: true,
    },
  ];

  for (const report of fieldReportSamples) {
    const existing = await prisma.fieldReport.findFirst({
      where: { campaignId: campaign.id, title: report.title },
    });
    if (!existing) {
      await prisma.fieldReport.create({
        data: { ...report, photoUrls: [] },
      });
    }
  }

  console.log('Seed complete.');
  console.log('  Campaign:', campaign.name);
  console.log('  Password for all accounts: ChangeMe123!');
  console.log('');
  console.log('  Collation hierarchy accounts:');
  console.log('    1. PU Officer:        pu.officer@electromon.ng       (17-13-01-001 ATAFI/RAMIN ATAFI)');
  console.log('    2. Ward/RA Officer:   ward.officer@electromon.ng     (ATAFI ward)');
  console.log('    3. LGA Officer:       lga.officer@electromon.ng      (Hadejia LGA — real INEC wards/PUs)');
  console.log('    4. State Officer:     state.officer@electromon.ng    (Jigawa State)');
  console.log('    5. National Officer:  national.officer@electromon.ng (Abuja)');
  console.log('');
  console.log('  Admin: director@electromon.ng');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
