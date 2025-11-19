import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../../components/feature/Header';
import { supabase } from '../../lib/supabase';

interface KycDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export default function AccountSettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('account');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  
  // KYC states
  const [kycDocuments, setKycDocuments] = useState<Record<string, KycDocument>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [kycError, setKycError] = useState('');
  const [kycSuccess, setKycSuccess] = useState('');

  const tabs = [
    { id: 'account', label: 'Account settings', icon: 'ri-user-line' },
    { id: 'kyc', label: 'KYC Verification', icon: 'ri-shield-check-line' },
    { id: 'password', label: 'Password', icon: 'ri-lock-line' },
    { id: '2fa', label: '2FA Auth', icon: 'ri-shield-line' },
  ];

  // Load KYC documents when KYC tab is active
  useEffect(() => {
    if (user && activeTab === 'kyc') {
      loadKycDocuments();
    }
  }, [user, activeTab]);

  const loadKycDocuments = async () => {
    try {
      const { data: documents, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      // Organize by document type (keep only the latest of each type)
      const docsMap: Record<string, KycDocument> = {};
      documents?.forEach((doc) => {
        if (!docsMap[doc.document_type]) {
          docsMap[doc.document_type] = doc;
        }
      });
      
      setKycDocuments(docsMap);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileUpload = async (documentType: string, file: File | null) => {
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Starting upload for:', documentType, 'File:', file.name);

    // Clear previous messages
    setKycError('');
    setKycSuccess('');
    setUploadingDoc(documentType);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload JPG, PNG, or PDF files only');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw new Error('Please log in to upload documents');
      }

      console.log('Uploading to storage...');

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      console.log('Saving to database...');

      // Check if document already exists
      const { data: existingDoc, error: checkError } = await supabase
        .from('kyc_documents')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('document_type', documentType)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing document:', checkError);
        throw new Error('Failed to check existing documents');
      }

      let dbError;

      if (existingDoc) {
        // Update existing document
        const { error: updateError } = await supabase
          .from('kyc_documents')
          .update({
            file_name: file.name,
            file_path: fileName,
            file_url: publicUrl,
            status: 'pending',
            admin_notes: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDoc.id);

        dbError = updateError;
      } else {
        // Insert new document
        const { error: insertError } = await supabase
          .from('kyc_documents')
          .insert({
            user_id: currentUser.id,
            document_type: documentType,
            file_name: file.name,
            file_path: fileName,
            file_url: publicUrl,
            status: 'pending',
          });

        dbError = insertError;
      }

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message || 'Failed to save document record');
      }

      console.log('Upload complete!');

      // Show success message
      setKycSuccess('Document uploaded successfully! It will be reviewed shortly.');
      setTimeout(() => setKycSuccess(''), 5000);

      // Reload documents
      await loadKycDocuments();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document. Please try again.';
      console.error('Upload error:', errorMessage);
      setKycError(errorMessage);
      setTimeout(() => setKycError(''), 5000);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setUsernameError('Username must be 3-20 characters long');
      return;
    }

    setIsSavingUsername(true);
    setUsernameError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: username.trim() }
      });

      if (updateError) {
        setUsernameError('Failed to update username');
        return;
      }

      await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user?.id);

      setIsEditingUsername(false);
    } catch (error) {
      setUsernameError('An error occurred. Please try again.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: string }> = {
      pending: { 
        color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700', 
        text: 'Pending Review',
        icon: 'ri-time-line'
      },
      approved: { 
        color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700', 
        text: 'Approved',
        icon: 'ri-checkbox-circle-fill'
      },
      rejected: { 
        color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700', 
        text: 'Rejected',
        icon: 'ri-close-circle-fill'
      }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <i className={badge.icon}></i>
        {badge.text}
      </span>
    );
  };

  const getVerificationLevel = () => {
    const docTypes = ['government_id', 'proof_of_address', 'selfie'];
    const approvedCount = docTypes.filter(type => kycDocuments[type]?.status === 'approved').length;
    
    if (approvedCount === 3) return { level: 3, text: 'Fully Verified', color: 'text-green-600 dark:text-green-400' };
    if (approvedCount >= 1) return { level: 2, text: 'Partially Verified', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 1, text: 'Unverified', color: 'text-gray-600 dark:text-gray-400' };
  };

  const renderKycTab = () => {
    const verificationLevel = getVerificationLevel();
    
    const documentSections = [
      {
        type: 'government_id',
        title: 'Government-Issued ID',
        description: 'Upload a clear photo of your passport, driver\'s license, or national ID card',
        icon: 'ri-id-card-line',
        iconBg: 'bg-blue-100 dark:bg-blue-900',
        iconColor: 'text-blue-600 dark:text-blue-400',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        buttonLoadingColor: 'bg-blue-400',
        accept: 'image/jpeg,image/jpg,image/png,application/pdf'
      },
      {
        type: 'selfie',
        title: 'Selfie with ID',
        description: 'Take a clear selfie holding your ID next to your face',
        icon: 'ri-camera-line',
        iconBg: 'bg-purple-100 dark:bg-purple-900',
        iconColor: 'text-purple-600 dark:text-purple-400',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        buttonLoadingColor: 'bg-purple-400',
        accept: 'image/jpeg,image/jpg,image/png'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Verification Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                <i className="ri-shield-check-line text-3xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Status</h3>
                <p className={`text-sm font-medium mt-1 ${verificationLevel.color}`}>{verificationLevel.text}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">Level {verificationLevel.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">of 3</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-blue-600 dark:text-blue-400 text-lg"></i>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Why verify your identity?</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Complete KYC verification to unlock higher transaction limits, enhanced security features, and full platform access.
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {kycSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Success!</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">{kycSuccess}</p>
              </div>
              <button
                onClick={() => setKycSuccess('')}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {kycError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Upload Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{kycError}</p>
              </div>
              <button
                onClick={() => setKycError('')}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {/* Document Upload Sections */}
        <div className="space-y-4">
          {documentSections.map((section) => {
            const doc = kycDocuments[section.type];
            const isUploading = uploadingDoc === section.type;
            const canUpload = !doc || doc.status === 'rejected';

            return (
              <div key={section.type} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 ${section.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <i className={`${section.icon} ${section.iconColor} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{section.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.description}</p>
                      
                      {doc && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            {getStatusBadge(doc.status)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Uploaded {new Date(doc.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <i className="ri-file-line text-gray-500 dark:text-gray-400"></i>
                              <span className="font-medium truncate">{doc.file_name}</span>
                            </p>
                          </div>
                          {doc.admin_notes && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                                <i className="ri-message-3-line text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></i>
                                <span>
                                  <strong className="font-semibold">Admin Notes:</strong>
                                  <span className="block mt-1">{doc.admin_notes}</span>
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      id={`file-input-${section.type}`}
                      accept={section.accept}
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        console.log('File selected:', selectedFile?.name);
                        if (selectedFile) {
                          handleFileUpload(section.type, selectedFile);
                        }
                        // Reset input value to allow re-uploading the same file
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        console.log('Upload button clicked for:', section.type);
                        const fileInput = document.getElementById(`file-input-${section.type}`) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap shadow-md cursor-pointer ${
                        isUploading
                          ? section.buttonLoadingColor + ' cursor-not-allowed shadow-none'
                          : canUpload
                          ? section.buttonColor + ' text-white hover:shadow-lg'
                          : 'bg-gray-700 text-white hover:bg-gray-800 hover:shadow-lg'
                      }`}
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <i className="ri-loader-4-line animate-spin text-lg"></i>
                          Uploading...
                        </span>
                      ) : canUpload ? (
                        <span className="flex items-center gap-2">
                          <i className="ri-upload-2-line text-lg"></i>
                          Upload
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <i className="ri-upload-2-line text-lg"></i>
                          Replace
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidelines */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-file-list-3-line text-gray-700 dark:text-gray-300 text-lg"></i>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-base mt-2">Document Guidelines</h4>
          </div>
          <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400 ml-1">
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-circle-fill text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>All documents must be <strong className="text-gray-900 dark:text-white">clear and readable</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-circle-fill text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Accepted formats: <strong className="text-gray-900 dark:text-white">JPG, PNG, PDF</strong> (max 5MB)</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-circle-fill text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Documents must <strong className="text-gray-900 dark:text-white">not be expired</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-circle-fill text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>All <strong className="text-gray-900 dark:text-white">corners of the document</strong> must be visible</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-checkbox-circle-fill text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Review typically takes <strong className="text-gray-900 dark:text-white">1-3 business days</strong></span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Full Name</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your display name on the platform</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.user_metadata?.full_name || 'Not set'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-at-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Username</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your unique username for the platform</p>
                </div>
              </div>
              {isEditingUsername ? (
                <div className="flex items-center space-x-3">
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Enter username"
                      disabled={isSavingUsername}
                    />
                    {usernameError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{usernameError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveUsername}
                    disabled={isSavingUsername}
                    className="text-green-600 hover:text-green-700 text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingUsername ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setUsername(user?.user_metadata?.username || '');
                      setUsernameError('');
                      setIsEditingUsername(false);
                    }}
                    disabled={isSavingUsername}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user?.user_metadata?.username || 'Not set'}</span>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-mail-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your current active email address</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email || 'Not available'}</span>
              </div>
            </div>
          </div>
        );

      case 'kyc':
        return renderKycTab();

      case 'password':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-yellow-600 dark:text-yellow-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Password Security</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm your new password"
                />
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer">
                Update Password
              </button>
            </div>
          </div>
        );

      case '2fa':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-shield-check-line text-green-600 dark:text-green-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Enhanced Security</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Two-factor authentication adds an extra layer of security to your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="ri-qr-code-line text-green-600 dark:text-green-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use Google Authenticator or similar</p>
                  </div>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <i className="ri-mail-line text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Authentication</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive codes via email</p>
                  </div>
                </div>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security settings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <i className={`${tab.icon} text-lg`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}