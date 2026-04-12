/**
 * server/routers/ngo.ts
 * tRPC procedures: ngo.search, ngo.register
 *
 * Uses the raw-SQL repository for PostGIS geo queries (ST_DistanceSphere),
 * consistent with AGENTS.md: raw SQL only for PostGIS / performance-critical paths.
 * 
 * NGO Registration handles comprehensive document verification and KYC workflow.
 */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { findNearbyNGOs } from '@/lib/repositories/ngo';
import { prisma } from '@/lib/prisma';

// Validation schema for NGO registration form
const ngoRegisterSchema = z.object({
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  website: z.string().url('Invalid website URL').optional().nullable(),
  missionArea: z.string().min(3, 'Mission area is required'),
});

// Document type definitions
const MANDATORY_DOCUMENTS = [
  'registration_certificate',
  'pan_card',
  'address_proof',
  'bank_account',
  '12a_certificate',
];

const OPTIONAL_DOCUMENTS = [
  'darpan_id',
  'kyc_members',
  '80g_certificate',
  'fcra_certificate',
  'audited_financials',
  'annual_report',
  'non_blacklisting',
];

export const ngoRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        lat:         z.number().min(-90).max(90).nullable().optional(),
        lng:         z.number().min(-180).max(180).nullable().optional(),
        radiusKm:    z.number().min(1).max(500).default(50),
        category:    z.string().default('All Causes'),
        searchQuery: z.string().default(''),
      })
    )
    .query(async ({ input }) => {
      const ngos = await findNearbyNGOs({
        lat: input.lat,
        lng: input.lng,
        radiusKm: input.radiusKm,
        category: input.category,
        searchQuery: input.searchQuery,
      });
      return ngos;
    }),

  /**
   * Register a new NGO with form data and document uploads.
   * 
   * Flow:
   * 1. Validate form input
   * 2. Check if email already exists
   * 3. Create NGO record with verificationStatus = 'pending'
   * 4. Prepare for document uploads (returns upload URLs or instructions)
   * 5. On next step, documents are uploaded and verification starts
   * 
   * Note: Actual file uploads are handled separately (S3/Supabase Storage)
   *       This procedure just manages the NGO and document metadata.
   */
  register: publicProcedure
    .input(ngoRegisterSchema)
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existingNGO = await prisma.nGO.findUnique({
        where: { email: input.email },
      });

      if (existingNGO) {
        throw new Error('Email already registered. Please use a different email or login.');
      }

      // Check if organization name has suspicious patterns
      const knownIssues: string[] = [];
      if (input.organizationName.length > 200) {
        knownIssues.push('Organization name is unusually long');
      }

      // Create NGO record
      const ngo = await prisma.nGO.create({
        data: {
          organizationName: input.organizationName,
          registrationNumber: input.registrationNumber,
          email: input.email,
          password: input.password, // TODO: Hash this properly with bcrypt
          website: input.website || null,
          missionArea: input.missionArea,
          verificationStatus: 'pending',
          knownIssues: knownIssues.length > 0 ? knownIssues.join('; ') : null,
        },
      });

      return {
        ngoId: ngo.id,
        email: ngo.email,
        organizationName: ngo.organizationName,
        verificationStatus: 'pending',
        mandatoryDocuments: MANDATORY_DOCUMENTS,
        optionalDocuments: OPTIONAL_DOCUMENTS,
        message: 'Registration form submitted successfully. Please upload all mandatory documents for verification.',
      };
    }),

  /**
   * Get NGO registration requirements and validation rules.
   * Used by frontend to display document checklist.
   */
  getDocumentRequirements: publicProcedure.query(() => {
    return {
      mandatory: MANDATORY_DOCUMENTS.map(doc => ({
        type: doc,
        label: formatDocumentLabel(doc),
        description: getDocumentDescription(doc),
        required: true,
        fileTypes: ['PDF'],
        maxSizeMB: 10,
      })),
      optional: OPTIONAL_DOCUMENTS.map(doc => ({
        type: doc,
        label: formatDocumentLabel(doc),
        description: getDocumentDescription(doc),
        required: false,
        fileTypes: ['PDF'],
        maxSizeMB: 10,
      })),
      validationRules: {
        organizationNameMustMatch: 'Organization name on registration certificate must match form input',
        panCardNameMustMatch: 'PAN card name must match registration certificate',
        addressProofMustBeRecent: 'Address proof must be dated within last 6 months',
        bankAccountMustBeSigned: 'Bank account proof must have account holder signature',
        allDocumentsMustBePDF: 'All documents must be in PDF format',
        maxFileSizeMB: 10,
        minResolutionPPI: 150,
      },
    };
  }),

  /**
   * Verify document match during registration.
   * Checks if organization names across documents are consistent.
   */
  verifyDocumentMatch: publicProcedure
    .input(
      z.object({
        ngoId: z.string(),
        extractedOrgNames: z.record(z.string(), z.string().nullable()), // { docType: orgName }
      })
    )
    .mutation(async ({ input }) => {
      const ngo = await prisma.nGO.findUnique({
        where: { id: input.ngoId },
      });

      if (!ngo) {
        throw new Error('NGO record not found');
      }

      const issues: string[] = [];
      const formName = ngo.organizationName.toLowerCase().trim();
      const extractedNames = Object.entries(input.extractedOrgNames)
        .filter(([, name]) => name !== null)
        .map(([docType, name]) => ({
          docType,
          extractedName: (name as string).toLowerCase().trim(),
        }));

      // Check if all extracted names match the form name
      for (const { docType, extractedName } of extractedNames) {
        if (extractedName !== formName) {
          issues.push(
            `Name mismatch in ${formatDocumentLabel(docType)}: Expected "${formName}", found "${extractedName}"`
          );
        }
      }

      // Update NGO with any issues found
      if (issues.length > 0) {
        await prisma.nGO.update({
          where: { id: input.ngoId },
          data: {
            knownIssues: issues.join('; '),
            verificationStatus: 'pending',
          },
        });
      }

      return {
        isMatched: issues.length === 0,
        issues,
        ngoId: input.ngoId,
      };
    }),

  /**
   * Mark a document as uploaded and ready to be verified by admins.
   */
  submitDocument: publicProcedure
    .input(
      z.object({
        ngoId: z.string(),
        documentType: z.string(),
        fileUrl: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const ngo = await prisma.nGO.findUnique({
        where: { id: input.ngoId },
      });

      if (!ngo) {
        throw new Error('NGO record not found');
      }

      const doc = await prisma.nGOVerificationDocument.create({
        data: {
          ngoId: input.ngoId,
          documentType: input.documentType,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          status: 'pending',
        },
      });

      // Check if all mandatory documents have been submitted
      const submittedDocs = await prisma.nGOVerificationDocument.findMany({
        where: { ngoId: input.ngoId },
        select: { documentType: true },
      });

      const submittedTypes = new Set(submittedDocs.map(d => d.documentType));
      const allMandatorySubmitted = MANDATORY_DOCUMENTS.every(doc => submittedTypes.has(doc));

      return {
        document: doc,
        allMandatoryDocumentsSubmitted: allMandatorySubmitted,
        remainingMandatory: MANDATORY_DOCUMENTS.filter(doc => !submittedTypes.has(doc)),
      };
    }),

  /**
   * Get all documents submitted by an NGO (for admin dashboard).
   */
  getSubmittedDocuments: publicProcedure
    .input(z.object({ ngoId: z.string() }))
    .query(async ({ input }) => {
      const docs = await prisma.nGOVerificationDocument.findMany({
        where: { ngoId: input.ngoId },
        orderBy: { uploadedAt: 'desc' },
      });

      return docs.map(doc => ({
        ...doc,
        label: formatDocumentLabel(doc.documentType),
        statusBadge: getStatusBadge(doc.status),
      }));
    }),
});

/**
 * Helper function to format document type to readable label
 */
function formatDocumentLabel(type: string): string {
  const labels: Record<string, string> = {
    registration_certificate: 'Registration Certificate (Trust Deed / Society / Section 8)',
    pan_card: 'PAN Card of the NGO',
    darpan_id: 'NGO Darpan ID',
    address_proof: 'Address Proof (Electricity Bill / Rent Agreement)',
    bank_account: 'Bank Account Details (Cancelled Cheque / Bank Statement)',
    kyc_members: 'KYC of Key Members (Aadhaar + PAN of Trustees)',
    '12a_certificate': '12A Certificate',
    '80g_certificate': '80G Certificate',
    fcra_certificate: 'FCRA Registration Certificate',
    audited_financials: 'Audited Financial Statements',
    annual_report: 'Annual Reports and Project Reports',
    non_blacklisting: 'Declaration of Non-Blacklisting (Signed)',
  };
  return labels[type] || type;
}

/**
 * Helper function to get document description
 */
function getDocumentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    registration_certificate:
      'Official trust deed, society registration, or Section 8 certificate from government',
    pan_card: 'PAN number and certificate of the NGO organization',
    darpan_id: 'NGO Darpan portal ID (if available)',
    address_proof: 'Recent utility bill or rental agreement showing registered office address',
    bank_account: 'Cancelled cheque or bank statement with account details',
    kyc_members: 'Aadhaar and PAN cards of key trustees/managing committee members',
    '12a_certificate': 'Income Tax exemption certificate under Section 12A',
    '80g_certificate': 'Income Tax exemption certificate under Section 80G',
    fcra_certificate: 'FCRA registration certificate (if accepting foreign donations)',
    audited_financials: 'Latest audited balance sheet and income/expenditure statement',
    annual_report: 'Previous year annual and project reports',
    non_blacklisting: 'Signed declaration confirming no blacklisting by government agencies',
  };
  return descriptions[type] || '';
}

/**
 * Helper function to get status badge color
 */
function getStatusBadge(status: string): { color: string; text: string } {
  const badges: Record<string, { color: string; text: string }> = {
    pending: { color: 'yellow', text: 'Under Review' },
    verified: { color: 'green', text: 'Verified' },
    rejected: { color: 'red', text: 'Rejected' },
  };
  return badges[status] || { color: 'gray', text: 'Unknown' };
}
