import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface KYCDocument {
  id: string;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  uploaded_at: string;
  admin_notes?: string;
}

export default function KYCVerification() {
  const { user } = useAuthContext();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // File input refs for each document type
  const govIdInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadKycDocuments();
  }, [user]);

  const loadKycDocuments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = (data || []).map(doc => ({
        ...doc,
        uploaded_at: doc.created_at
      }));
      
      setDocuments(mappedData);
    } catch (err: any) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (documentType: string) => {
    if (documentType === 'government_id' && govIdInputRef.current) {
      govIdInputRef.current.click();
    } else if (documentType === 'selfie_with_id' && selfieInputRef.current) {
      selfieInputRef.current.click();
    }
  };

  const handleFileSelect = (documentType: string) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      
      if (!file) return;
      
      event.target.value = '';
      await uploadDocument(documentType, file);
    };
  };

  const uploadDocument = async (documentType: string, file: File) => {
    if (!user) {
      setError('Please log in to upload documents');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPG, PNG, or PDF files only');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setUploadingDoc(documentType);
    setError('');
    setSuccess('');

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${documentType}_${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // First, check if bucket exists and create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'kyc-documents');
      
      if (!bucketExists) {
        console.log('KYC bucket does not exist, documents will be stored when admin creates bucket');
      }

      // Upload to Supabase Storage with retry logic
      let uploadAttempts = 0;
      let uploadSuccess = false;
      let publicUrl = '';

      while (uploadAttempts < 3 && !uploadSuccess) {
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            uploadAttempts++;
            if (uploadAttempts >= 3) {
              throw new Error(`Upload failed after 3 attempts: ${uploadError.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }

          // Get public URL
          const { data: { publicUrl: url } } = supabase.storage
            .from('kyc-documents')
            .getPublicUrl(filePath);

          publicUrl = url;
          uploadSuccess = true;
        } catch (retryError) {
          uploadAttempts++;
          if (uploadAttempts >= 3) {
            throw retryError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!uploadSuccess) {
        throw new Error('Failed to upload file after multiple attempts');
      }

      // Check if document already exists
      const { data: existingDoc } = await supabase
        .from('kyc_documents')
        .select('id')
        .eq('user_id', user.id)
        .eq('document_type', documentType)
        .maybeSingle();

      if (existingDoc) {
        // Update existing document
        const { error: updateError } = await supabase
          .from('kyc_documents')
          .update({
            file_url: publicUrl,
            file_name: fileName,
            file_path: filePath,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id);

        if (updateError) throw new Error(`Failed to update document: ${updateError.message}`);
      } else {
        // Insert new document
        const { error: insertError } = await supabase
          .from('kyc_documents')
          .insert({
            user_id: user.id,
            document_type: documentType,
            file_url: publicUrl,
            file_name: fileName,
            file_path: filePath,
            status: 'pending'
          });

        if (insertError) throw new Error(`Failed to save document: ${insertError.message}`);
      }

      setSuccess('Document uploaded successfully! Your verification is now pending review.');
      setTimeout(() => setSuccess(''), 5000);

      // Reload documents
      await loadKycDocuments();

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = documents.find(d => d.document_type === docType);
    return doc?.status || 'not_uploaded';
  };

  const getDocumentInfo = (docType: string) => {
    return documents.find(d => d.document_type === docType);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
          <i className="ri-time-line"></i>
          Pending Review
        </span>
      ),
      approved: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
          <i className="ri-checkbox-circle-line"></i>
          Approved
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
          <i className="ri-close-circle-line"></i>
          Rejected
        </span>
      ),
      not_uploaded: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
          <i className="ri-file-upload-line"></i>
          Not Uploaded
        </span>
      )
    };
    return badges[status as keyof typeof badges] || badges.not_uploaded;
  };

  const documentTypes = [
    {
      type: 'government_id',
      title: 'Government ID',
      description: 'Upload a clear photo of your passport, driver\'s license, or national ID card',
      icon: 'ri-id-card-line',
      inputRef: govIdInputRef
    },
    {
      type: 'selfie_with_id',
      title: 'Selfie with ID',
      description: 'Take a selfie while holding your government ID next to your face',
      icon: 'ri-user-smile-line',
      inputRef: selfieInputRef
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5"></i>
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 text-xl flex-shrink-0 mt-0.5"></i>
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-blue-600 dark:text-blue-400 text-xl flex-shrink-0 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              KYC Verification Required
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              To comply with regulations and ensure account security, please upload the following documents. 
              All documents will be reviewed within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className="grid gap-6">
        {documentTypes.map((docType) => {
          const status = getDocumentStatus(docType.type);
          const docInfo = getDocumentInfo(docType.type);
          const isUploading = uploadingDoc === docType.type;

          return (
            <div
              key={docType.type}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${docType.icon} text-blue-600 dark:text-blue-400 text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {docType.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {docType.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>

              {/* Admin Notes for Rejected Documents */}
              {status === 'rejected' && docInfo?.admin_notes && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {docInfo.admin_notes}
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  ref={docType.inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileSelect(docType.type)}
                  className="hidden"
                />
                <button
                  onClick={() => handleUploadClick(docType.type)}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <i className="ri-loader-4-line text-lg animate-spin"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-2-line text-lg"></i>
                      {status === 'not_uploaded' ? 'Upload' : 'Replace'}
                    </>
                  )}
                </button>

                {docInfo && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Uploaded {new Date(docInfo.uploaded_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* File Requirements */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <i className="ri-information-line mr-1"></i>
                  Accepted formats: JPG, PNG, PDF • Maximum size: 5MB
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidelines */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <i className="ri-shield-check-line text-blue-600 dark:text-blue-400"></i>
          Document Guidelines
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
            <span>Ensure all documents are clear, legible, and not blurry</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
            <span>All four corners of the document must be visible</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
            <span>Documents must be valid and not expired</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
            <span>For selfies, ensure your face and ID are clearly visible</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
