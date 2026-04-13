import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

const updatedUser = `model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  fullName  String
  bio       String?
  location  String?
  image     String?
  publicKey String?
  encryptedPrivateKey String?
  keyDerivationSalt String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  donationsDonated Donation[] @relation("DonationDonor")
  requestsMade     Request[]  @relation("RequestRequester")
  
  // Chat relations
  conversationsAsUser1 Conversation[] @relation("User1Conv")
  conversationsAsUser2 Conversation[] @relation("User2Conv")

  @@index([email])
}`;
schema = schema.replace(/model User \{[\s\S]*?@@index\(\[email\]\)\n\}/, updatedUser);

const updatedNGO = `model NGO {
  id                    String     @id @default(cuid())
  email                 String     @unique
  password              String
  organizationName      String
  registrationNumber    String
  website               String?
  missionArea           String
  verificationDocument  String?
  isVerified            Boolean    @default(false)
  verificationStatus    String     @default("pending") // pending, approved, rejected
  rejectionReason       String?
  bio                   String?
  image                 String?
  knownIssues           String?    // e.g., "Name mismatch in PAN Card", concatenated issues
  latitude              Float?
  longitude             Float?
  locationName          String?
  
  // MFA Fields
  mfaSetupComplete      Boolean    @default(false)
  mfaMethod             String?    // 'authenticator' | 'webauthn'
  mfaSecret             String?    // Encrypted TOTP secret
  mfaBackupCodes        String[]   @default([]) // Hashed backup codes (JSON)
  mfaSetupCompletedAt   DateTime?
  isFirstLogin          Boolean    @default(true)
  lastLoginAt           DateTime?
  mfaFailedAttempts     Int        @default(0)
  mfaLockedUntil        DateTime?
  
  // E2EE Chat Fields
  publicKey             String?
  encryptedPrivateKey   String?
  keyDerivationSalt     String?

  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt

  donationsReceived     Donation[]
  eventDrives           EventDrive[]
  verificationDocs      NGOVerificationDocument[]
  mfaAuditLogs          MFAAuditLog[]
  
  // Chat relations
  conversationsAsNgo1   Conversation[] @relation("NGO1Conv")
  conversationsAsNgo2   Conversation[] @relation("NGO2Conv")

  @@index([email])
  @@index([isVerified])
  @@index([verificationStatus])
}`;
schema = schema.replace(/model NGO \{[\s\S]*?@@index\(\[verificationStatus\]\)\n\}/, updatedNGO);

const updatedMessage = `model Conversation {
  id        String   @id @default(cuid())
  
  // Participants (Flexible to allow User-User, User-NGO, or NGO-NGO)
  user1Id   String?
  user1     User?    @relation("User1Conv", fields: [user1Id], references: [id], onDelete: Cascade)
  user2Id   String?
  user2     User?    @relation("User2Conv", fields: [user2Id], references: [id], onDelete: Cascade)
  
  ngo1Id    String?
  ngo1      NGO?     @relation("NGO1Conv", fields: [ngo1Id], references: [id], onDelete: Cascade)
  ngo2Id    String?
  ngo2      NGO?     @relation("NGO2Conv", fields: [ngo2Id], references: [id], onDelete: Cascade)
  
  messages  Message[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([user1Id])
  @@index([user2Id])
  @@index([ngo1Id])
  @@index([ngo2Id])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId       String
  senderType     String       // 'USER' or 'NGO'
  
  content        String       // Encrypted cipher text
  
  createdAt      DateTime     @default(now())

  @@index([conversationId])
  @@index([senderId])
}`;
schema = schema.replace(/model Message \{[\s\S]*?@@index\(\[receiverId\]\)\n\}/, updatedMessage);

fs.writeFileSync(schemaPath, schema);
