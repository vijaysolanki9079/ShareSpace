'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileText,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FormData {
  organizationName: string;
  registrationNumber: string;
  email: string;
  password: string;
  website: string;
  categories: string[];
}

interface FormErrors {
  organizationName?: string;
  registrationNumber?: string;
  email?: string;
  password?: string;
  website?: string;
  categories?: string;
}

interface DocumentUpload {
  type: string;
  file: File | null;
  label: string;
  required: boolean;
  uploaded: boolean;
}

const MANDATORY_DOCUMENTS = [
  { type: 'registration_certificate', label: 'Registration Certificate', required: true },
  { type: 'pan_card', label: 'PAN Card of the NGO', required: true },
  { type: 'address_proof', label: 'Address Proof (Electricity Bill / Rent)', required: true },
  { type: 'bank_account', label: 'Bank Account Details (Cancelled Cheque)', required: true },
  { type: '12a_certificate', label: '12A Certificate', required: true },
];

const OPTIONAL_DOCUMENTS = [
  { type: 'darpan_id', label: 'NGO Darpan ID', required: false },
  { type: 'kyc_members', label: 'KYC of Key Members', required: false },
  { type: '80g_certificate', label: '80G Certificate', required: false },
  { type: 'fcra_certificate', label: 'FCRA Certificate', required: false },
  { type: 'audited_financials', label: 'Audited Financial Statements', required: false },
  { type: 'annual_report', label: 'Annual Reports', required: false },
  { type: 'non_blacklisting', label: 'Non-Blacklisting Declaration', required: false },
];

const MISSION_AREAS = [
  'Education',
  'Healthcare',
  'Food Insecurity',
  'Homelessness',
  'Animal Welfare',
  'Disaster Relief',
  'Environmental Conservation',
  'Women Empowerment',
  'Child Welfare',
  'Elderly Care',
  'Other',
];

export default function RegisterNGOForm() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'documents' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    registrationNumber: '',
    email: '',
    password: '',
    website: '',
    categories: [],
  });

  // Document state
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    ...MANDATORY_DOCUMENTS.map(doc => ({
      ...doc,
      file: null,
      uploaded: false,
    })),
    ...OPTIONAL_DOCUMENTS.map(doc => ({
      ...doc,
      file: null,
      uploaded: false,
    })),
  ]);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.trim().length < 3) {
      newErrors.organizationName = 'Organization name must be at least 3 characters';
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number (PAN) is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.registrationNumber.trim())) {
      newErrors.registrationNumber = 'Invalid PAN format. Use format: AAAAA####A (e.g., ABCDE1234F)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Document validation
  const validateDocuments = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const mandatoryDocs = documents.filter(d => d.required);

    for (const doc of mandatoryDocs) {
      if (!doc.file) {
        newErrors[doc.type] = 'This document is required';
      } else if (doc.file.size > 2 * 1024 * 1024) {
        newErrors[doc.type] = 'File must be less than 2MB';
      } else if (doc.file.type !== 'application/pdf') {
        newErrors[doc.type] = 'Only PDF files are allowed';
      }
    }

    setDocumentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [documents]);

  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' } as FormErrors));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => {
      const alreadySelected = prev.categories.includes(category);
      return {
        ...prev,
        categories: alreadySelected
          ? prev.categories.filter(item => item !== category)
          : [...prev.categories, category],
      };
    });
    setFormErrors(prev => ({ ...prev, categories: '' }));
  };

  // Handle document upload
  const handleDocumentUpload = (documentType: string, file: File | null) => {
    // Reset error
    setDocumentErrors(prev => ({ ...prev, [documentType]: '' }));

    if (!file) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.type === documentType
            ? { ...doc, file: null, uploaded: false }
            : doc
        )
      );
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Only PDF files are allowed';
      setDocumentErrors(prev => ({
        ...prev,
        [documentType]: errorMsg
      }));
      toast.error(errorMsg);
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File size exceeds 2MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      setDocumentErrors(prev => ({
        ...prev,
        [documentType]: errorMsg
      }));
      toast.error(errorMsg);
      return;
    }

    // File is valid, update the document
    setDocuments(prev =>
      prev.map(doc =>
        doc.type === documentType
          ? { ...doc, file, uploaded: true }
          : doc
      )
    );
    toast.success(`${file.name} uploaded successfully`);
  };

  // Handle form submission (Step 1)
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Here you would call the tRPC register mutation
      // For now, just move to documents step
      // const response = await trpc.ngo.register.mutate(formData);
      
      setStep('documents');
      toast.success('Form submitted! Now upload your documents.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle document submission (Step 2)
  const handleDocumentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateDocuments()) {
      toast.error('Please upload all mandatory documents');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Here you would upload documents to Supabase/S3 and call submitDocument
      // For now, just move to success
      setStep('success');
      toast.success('Registration completed! Verification in progress.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Document upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mandatoryCount = documents.filter(d => d.required && d.file).length;
  const mandatoryTotal = documents.filter(d => d.required).length;
  const progressPercent = mandatoryTotal > 0 ? Math.round((mandatoryCount / mandatoryTotal) * 100) : 0;

  // Add smooth scrolling to document and adjust width split
  // MUST be before early returns to maintain consistent hook count
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Adjust left side width for lg screens
    const leftSide = document.querySelector('[data-left-register]') as HTMLElement;
    const handleResize = () => {
      if (leftSide) {
        if (window.innerWidth >= 1024) {
          leftSide.style.width = 'calc(50% + 60px)';
        } else {
          leftSide.style.width = '100%';
        }
      }
    };
    
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white font-sans text-gray-900 flex flex-col lg:flex-row"
    >
      {/* Left Side: Form or Documents - Scrollable with fixed footer */}
      <div className="w-full flex flex-col bg-white lg:relative" data-left-register style={{ width: '100%' }}>
        {/* Scrollable Content */}
        <div className="flex-1 lg:h-screen lg:overflow-y-auto p-6 lg:p-10" style={{ scrollBehavior: 'smooth' }}>
          <div className="max-w-2xl mx-auto w-full">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                if (step === 'documents') {
                  setStep('form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  router.push('/');
                }
              }}
              className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              {step === 'documents' ? 'Back to Form' : 'Back'}
            </motion.button>
            {/* Step Indicators - Hidden on Success Page */}
            {step !== 'success' && (
              <div className="flex gap-2 mb-6">
                <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                <div
                  className={`h-1 flex-1 rounded-full ${
                    step !== 'form'
                      ? 'bg-emerald-600'
                      : 'bg-gray-200'
                  }`}
                />
                <div className={`h-1 flex-1 rounded-full ${(step as string) === 'success' ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              </div>
            )}

            {/* Form Step */}
            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
                  Partner with ShareSpace
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  Join 1,200+ verified NGOs connecting with donors in your area. Start receiving items today.
                </p>

                {error && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <div className="flex gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-8">
                  {/* Organization Details Section */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-500">
                      Organization Details
                    </h2>
                    
                    {/* Organization Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Organization Name *</label>
                      <input
                        type="text"
                        name="organizationName"
                        placeholder="e.g. City Food Bank"
                        value={formData.organizationName}
                        onChange={handleFormChange}
                        className={`w-full h-10 px-3 text-base bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                          formErrors.organizationName ? 'border-red-400' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      {formErrors.organizationName && (
                        <p className="text-sm text-red-600 mt-2">{formErrors.organizationName}</p>
                      )}
                    </div>

                    {/* Registration Number & Website */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Registration Number *</label>
                        <input
                          type="text"
                          name="registrationNumber"
                          placeholder="Official Reg #"
                          value={formData.registrationNumber}
                          onChange={handleFormChange}
                          className={`w-full h-10 px-3 text-base bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                            formErrors.registrationNumber ? 'border-red-400' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        {formErrors.registrationNumber && (
                          <p className="text-sm text-red-600 mt-2">{formErrors.registrationNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Website (Optional)</label>
                        <input
                          type="url"
                          name="website"
                          placeholder="https://"
                          value={formData.website}
                          onChange={handleFormChange}
                          className={`w-full h-10 px-3 text-base bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                            formErrors.website ? 'border-red-400' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        {formErrors.website && (
                          <p className="text-sm text-red-600 mt-2">{formErrors.website}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Security Section */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-500">
                      Contact & Security
                    </h2>
                    
                    {/* Email */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Work Email *</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="contact@organization.org"
                        value={formData.email}
                        onChange={handleFormChange}
                        className={`w-full h-10 px-3 text-base bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                          formErrors.email ? 'border-red-400' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-600 mt-2">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Create Password *</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleFormChange}
                        className={`w-full h-10 px-3 text-base bg-white border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                          formErrors.password ? 'border-red-400' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      {formErrors.password && (
                        <p className="text-sm text-red-600 mt-2">{formErrors.password}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">Minimum 8 characters recommended</p>
                    </div>
                  </div>

                  {/* Organization Focus Section */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-500">
                      Organization Focus
                    </h2>
                    
                    {/* Categories */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Organization Categories *</label>
                      <div className="flex flex-wrap gap-2">
                        {MISSION_AREAS.map(area => {
                          const isSelected = formData.categories.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => toggleCategory(area)}
                              disabled={loading}
                              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
                              }`}
                            >
                              {area}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.categories && (
                        <p className="text-sm text-red-600 mt-2">{formErrors.categories}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-base text-white font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Continue to Document Upload'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                      By registering, you agree to our <a href="#" className="text-emerald-600 hover:underline">Partner Terms</a>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Documents Step */}
            {step === 'documents' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-bold mb-3 text-gray-900">Upload Verification Documents</h1>
                <p className="text-sm text-gray-600 mb-8">
                  All documents must be in PDF format and under 2MB. Required documents marked with *.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">
                    <div className="flex gap-3">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-800">
                      Documents Uploaded
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {mandatoryCount}/{mandatoryTotal} mandatory
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <form onSubmit={handleDocumentSubmit} className="space-y-8">
                  {/* Mandatory Documents */}
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-blue-600" />
                      Required Documents
                    </h3>
                    <div className="space-y-3">
                      {documents
                        .filter(d => d.required)
                        .map(doc => (
                          <DocumentUploadField
                            key={doc.type}
                            document={doc}
                            error={documentErrors[doc.type]}
                            onUpload={file => handleDocumentUpload(doc.type, file)}
                            disabled={loading}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Optional Documents */}
                  <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Optional Documents</h3>
                    <div className="space-y-3">
                      {documents
                        .filter(d => !d.required)
                        .map(doc => (
                          <DocumentUploadField
                            key={doc.type}
                            document={doc}
                            error={documentErrors[doc.type]}
                            onUpload={file => handleDocumentUpload(doc.type, file)}
                            disabled={loading}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading || mandatoryCount < mandatoryTotal}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-base text-white font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Uploading Documents...' : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Registration Submitted!</h1>
                <p className="text-base text-gray-600 mb-4 text-center max-w-md">
                  Your NGO registration and documents have been submitted successfully.
                </p>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
                  Our verification team will review your documents within 24-48 hours. You will receive an email
                  notification with the status.
                </p>
                <div className="flex gap-3 w-full max-w-md">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 h-10 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Home
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Visual & Benefits - Fixed */}
        <div 
          className="hidden lg:flex lg:fixed lg:right-0 lg:top-0 lg:h-screen bg-[#022c22] relative overflow-hidden items-center justify-center z-40"
          style={{ width: 'calc(50% - 60px)' }}
        >
          {/* Background */}
          <div className="absolute inset-0 opacity-80 mt-20">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
              alt="Volunteer Support"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/80 to-transparent"></div>

          <div className="relative p-8 lg:p-15 max-w-sm text-white mt-35">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl lg:text-4xl font-bold mb-6">Why Partner With Us?</h2>

              <div className="space-y-4">
                {[
                  { icon: '✓', title: 'Verified Donors', desc: 'Connect with real, verified donors' },
                  { icon: '🔒', title: 'Secure Platform', desc: 'Enterprise-grade security for your data' },
                  { icon: '📊', title: 'Dashboard', desc: 'Track donations in real-time' },
                  { icon: '🌍', title: 'Geographic Reach', desc: 'Get discovered by donors nearby' },
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex gap-3"
                  >
                    <span className="text-xl flex-shrink-0">{benefit.icon}</span>
                    <div>
                      <h4 className="font-semibold text-base mb-0.5">{benefit.title}</h4>
                      <p className="text-sm text-gray-300">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Documents are reviewed within 24-48 hours. Our verification team ensures all NGOs meet our quality standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
    </motion.div>
  );
}

/**
 * Format bytes to human-readable file size (KB/MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * Sub-component for individual document upload
 */
function DocumentUploadField({
  document: doc,
  error,
  onUpload,
  disabled,
}: {
  document: DocumentUpload;
  error?: string;
  onUpload: (file: File | null) => void;
  disabled: boolean;
}) {
  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type before upload
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      // Validate file size before upload
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File size exceeds 2MB limit`);
        return;
      }
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-800 flex items-center gap-1">
        {doc.label}
        {doc.required && <span className="text-red-600">*</span>}
      </label>

      {doc.file ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between p-4 bg-emerald-50 border-2 border-emerald-400 rounded-lg shadow-md"
        >
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-900 truncate">{doc.file.name}</p>
              <p className="text-xs text-emerald-700">{formatFileSize(doc.file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpload(null)}
            className="ml-2 p-2 hover:bg-emerald-200 rounded-lg transition-colors flex-shrink-0"
            disabled={disabled}
            title="Remove file"
          >
            <X size={16} className="text-emerald-700" />
          </button>
        </motion.div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            error
              ? 'border-red-400 bg-red-50 hover:bg-red-100'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDragDrop}
          onClick={() => {
            const input = document.getElementById(`file-input-${doc.type}`) as HTMLInputElement;
            input?.click();
          }}
        >
          <input
            id={`file-input-${doc.type}`}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={e => onUpload(e.target.files?.[0] || null)}
            disabled={disabled}
          />
          <UploadCloud
            className={`mx-auto mb-2 transition-colors ${
              error ? 'text-red-500' : 'text-gray-500'
            }`}
            size={24}
          />
          <p className={`text-sm font-semibold ${error ? 'text-red-700' : 'text-gray-700'}`}>
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-gray-600 mt-1">PDF only (Max 2MB)</p>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded"
        >
          <AlertCircle size={14} />
          {error}
        </motion.p>
      )}
    </div>
  );
}
