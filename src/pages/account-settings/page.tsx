

import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../../components/feature/Header';
import { supabase } from '../../lib/supabase';

export default function AccountSettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('account');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  
  // KYC states
  const [kycDocuments, setKycDocuments] = useState<any>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [kycError, setKycError] = useState('');
  const [kycSuccess, setKycSuccess] = useState('');

  const tabs = [
    { id: 'account', label: 'Account settings', icon: 'ri-user-line' },
    { id: 'kyc', label: 'KYC Verification', icon: 'ri-shield-check-line' },
    { id: 'password', label: 'Password', icon: 'ri-lock-line' },
    { id: '2fa', label: '2FA Auth', icon: 'ri-shield-line' },
  ];

  // Load KYC documents
  useEffect(() => {
    if (user && activeTab === 'kyc') {
      loadKycDocuments();
    }
  }, [user, activeTab]);

  const loadKycDocuments = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Query documents directly from Supabase
      const { data: documents, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      // Organize documents by type
      const docs: any = {};
      documents?.forEach((doc: any) => {
        docs[doc.document_type] = doc;
      });
      setKycDocuments(docs);
    } catch (error) {
      console.error('Error loading KYC documents:', error);
    }
  };

  const handleFileUpload = async (documentType: string, file: File | null) => {
    if (!file) {
      setKycError('Please select a file to upload');
      setTimeout(() => setKycError(''), 5000);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setKycError('Please upload a valid image (JPG, PNG) or PDF file');
      setTimeout(() => setKycError(''), 5000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setKycError('File size must be less than 5MB');
      setTimeout(() => setKycError(''), 5000);
      return;
    }

    setUploadingDoc(documentType);
    setKycError('');
    setKycSuccess('');

    try {
      console.log('Starting upload for:', documentType, 'File:', file.name);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to upload documents');
      }

      console.log('Session found, creating FormData...');

      // Create FormData for Edge Function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      console.log('Calling Edge Function...');

      // Call Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/kyc-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok || !result.success) {
        const errorMessage = result.error || 'Failed to upload document';
        console.error('Upload failed:', errorMessage);
        setKycError(errorMessage);
        setTimeout(() => setKycError(''), 5000);
        return;
      }

      console.log('Upload successful!');
      setKycSuccess(result.message || 'Document uploaded successfully! It will be reviewed shortly.');
      setTimeout(() => setKycSuccess(''), 5000);
      
      // Reload documents after successful upload
      await loadKycDocuments();

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload document. Please try again.';
      setKycError(errorMessage);
      setTimeout(() => setKycError(''), 5000);
    } finally {
      // Always reset uploading state
      console.log('Resetting upload state');
      setUploadingDoc(null);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }

    // Validate username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return;
    }

    setIsSavingUsername(true);
    setUsernameError('');

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: username.trim() }
      });

      if (updateError) {
        setUsernameError('Failed to update username. Please try again.');
        console.error('Error updating username:', updateError);
        return;
      }

      // Also update in profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user?.id);

      if (profileError) {
        console.error('Error updating profile username:', profileError);
      }

      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error saving username:', error);
      setUsernameError('An error occurred. Please try again.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCancelEditUsername = () => {
    setUsername(user?.user_metadata?.username || '');
    setUsernameError('');
    setIsEditingUsername(false);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200', text: 'Pending Review' },
      approved: { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', text: 'Approved' },
      rejected: { color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.text}</span>;
  };

  const getVerificationLevel = () => {
    const docTypes = ['government_id', 'proof_of_address', 'selfie'];
    const approvedDocs = docTypes.filter(type => kycDocuments[type]?.status === 'approved');
    
    if (approvedDocs.length === 3) return { level: 3, text: 'Fully Verified', color: 'text-green-600 dark:text-green-400' };
    if (approvedDocs.length >= 1) return { level: 2, text: 'Partially Verified', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 1, text: 'Unverified', color: 'text-gray-600 dark:text-gray-400' };
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
                    onClick={handleCancelEditUsername}
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
        const verificationLevel = getVerificationLevel();
        return (
          <div className="space-y-6">
            {/* Verification Status Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                    <i className="ri-shield-check-line text-3xl text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Status</h3>
                    <p className={`text-sm font-medium ${verificationLevel.color}`}>{verificationLevel.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">Level {verificationLevel.level}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">of 3</div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-blue-600 dark:text-blue-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Why verify your identity?</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Complete KYC verification to unlock higher transaction limits, enhanced security features, and full platform access. All documents are securely stored and manually reviewed.
                  </p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {kycSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 text-lg"></i>
                  <p className="text-sm text-green-700 dark:text-green-300">{kycSuccess}</p>
                </div>
              </div>
            )}

            {kycError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-lg"></i>
                  <p className="text-sm text-red-700 dark:text-red-300">{kycError}</p>
                </div>
              </div>
            )}

            {/* Document Upload Sections */}
            <div className="space-y-4">
              {/* Government ID */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <i className="ri-id-card-line text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Government-Issued ID</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Upload a clear photo of your passport, driver's license, or national ID card
                      </p>
                      {kycDocuments.government_id && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {kycDocuments.government_id.file_name}
                          </span>
                          {getStatusBadge(kycDocuments.government_id.status)}
                        </div>
                      )}
                      {kycDocuments.government_id?.admin_notes && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Note: {kycDocuments.government_id.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {!kycDocuments.government_id || kycDocuments.government_id.status === 'rejected' ? (
                    <label className={`${uploadingDoc === 'government_id' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}>
                      {uploadingDoc === 'government_id' ? (
                        <span className="flex items-center space-x-2">
                          <i className="ri-loader-4-line animate-spin"></i>
                          <span>Uploading...</span>
                        </span>
                      ) : (
                        'Upload'
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={uploadingDoc === 'government_id'}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log('File selected:', file?.name);
                          if (file) {
                            handleFileUpload('government_id', file);
                          }
                          // Reset input value to allow re-uploading the same file
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              {/* Proof of Address */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <i className="ri-home-line text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Proof of Address</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Upload a recent utility bill, bank statement, or government letter (not older than 6 months)
                      </p>
                      {kycDocuments.proof_of_address && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {kycDocuments.proof_of_address.file_name}
                          </span>
                          {getStatusBadge(kycDocuments.proof_of_address.status)}
                        </div>
                      )}
                      {kycDocuments.proof_of_address?.admin_notes && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Note: {kycDocuments.proof_of_address.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {!kycDocuments.proof_of_address || kycDocuments.proof_of_address.status === 'rejected' ? (
                    <label className={`${uploadingDoc === 'proof_of_address' ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}>
                      {uploadingDoc === 'proof_of_address' ? (
                        <span className="flex items-center space-x-2">
                          <i className="ri-loader-4-line animate-spin"></i>
                          <span>Uploading...</span>
                        </span>
                      ) : (
                        'Upload'
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={uploadingDoc === 'proof_of_address'}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log('File selected:', file?.name);
                          if (file) {
                            handleFileUpload('proof_of_address', file);
                          }
                          // Reset input value to allow re-uploading the same file
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              {/* Selfie Verification */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <i className="ri-camera-line text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Selfie with ID</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Take a clear selfie holding your ID next to your face
                      </p>
                      {kycDocuments.selfie && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {kycDocuments.selfie.file_name}
                          </span>
                          {getStatusBadge(kycDocuments.selfie.status)}
                        </div>
                      )}
                      {kycDocuments.selfie?.admin_notes && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Note: {kycDocuments.selfie.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {!kycDocuments.selfie || kycDocuments.selfie.status === 'rejected' ? (
                    <label className={`${uploadingDoc === 'selfie' ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}>
                      {uploadingDoc === 'selfie' ? (
                        <span className="flex items-center space-x-2">
                          <i className="ri-loader-4-line animate-spin"></i>
                          <span>Uploading...</span>
                        </span>
                      ) : (
                        'Upload'
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingDoc === 'selfie'}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          console.log('File selected:', file?.name);
                          if (file) {
                            handleFileUpload('selfie', file);
                          }
                          // Reset input value to allow re-uploading the same file
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Document Guidelines</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5"></i>
                  <span>All documents must be clear and readable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5"></i>
                  <span>Accepted formats: JPG, PNG, PDF (max 5MB)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5"></i>
                  <span>Documents must not be expired</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5"></i>
                  <span>All corners of the document must be visible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-line text-green-600 dark:text-green-400 mt-0.5"></i>
                  <span>Review typically takes 1-3 business days</span>
                </li>
              </ul>
            </div>
          </div>
        );

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

