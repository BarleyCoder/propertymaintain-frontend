import { useState, useEffect } from 'react';
import useAuth from '../../context/useAuth';
import TechnicianSidebar from '../../components/TechnicianSidebar';
import API from '../../utils/axios';

const specializationsList = ['plumbing', 'electrical', 'carpentry', 'roofing', 'painting', 'hvac', 'masonry', 'appliance_repair', 'other'];

const TechnicianProfileSetup = () => {
    const { user } = useAuth();
    const [primarySpecialization, setPrimarySpecialization] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [certifications, setCertifications] = useState('');
    const [bio, setBio] = useState('');
    const [serviceLocation, setServiceLocation] = useState('');
    const [serviceRadius, setServiceRadius] = useState('');
    const [preferredWorkingHours, setPreferredWorkingHours] = useState('');
    const [emergencyAfterHours, setEmergencyAfterHours] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [qualifications, setQualifications] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState('draft');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    
    // Upload states
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingQualification, setUploadingQualification] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const requiredChecks = [
        user?.full_name,
        phoneNumber,
        primarySpecialization,
        yearsOfExperience !== '' && Number(yearsOfExperience) >= 0,
        bio && bio.trim().length > 0,
        serviceLocation && serviceLocation.trim().length > 0,
        certifications && certifications.trim().length > 0,
        profilePhoto && profilePhoto.trim().length > 0,
        qualifications && qualifications.length > 0,
        isAvailable !== undefined
    ];

    const completionPercentage = Math.round((requiredChecks.filter(Boolean).length / requiredChecks.length) * 100);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await API.get('/api/technician/profile');
                const profile = res.data.profile;
                setPrimarySpecialization(profile.primarySpecialization || '');
                setSpecializations(profile.specializations || []);
                setYearsOfExperience(profile.yearsOfExperience || '');
                setCertifications((profile.certifications || []).join(', '));
                setBio(profile.bio || '');
                setServiceLocation(profile.serviceLocation || '');
                setServiceRadius(profile.serviceRadius || '');
                setPreferredWorkingHours(profile.preferredWorkingHours || '');
                setEmergencyAfterHours(Boolean(profile.emergencyAfterHours));
                setPhoneNumber(profile.phoneNumber || user?.phone_number || '');
                setProfilePhoto(profile.profilePhoto || '');
                setQualifications(profile.qualificationDocuments || []);
                setVerificationStatus(profile.verificationStatus || 'draft');
                setVerificationNotes(profile.verificationNotes || '');
                setIsAvailable(profile.isAvailable !== undefined ? profile.isAvailable : true);
            } catch (err) {
                if (err.response?.status && err.response.status !== 404) {
                    setError('Error fetching profile');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.phone_number]);

    const toggleSpecialization = (spec) => {
        setSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
    };

    const handleUploadProfilePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid image format. Please upload JPG, PNG, or WEBP.');
            return;
        }
        
        // Validate file size (20 MB)
        if (file.size > 20 * 1024 * 1024) {
            setError('Image size must not exceed 20 MB.');
            return;
        }

        setUploadingPhoto(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('photo', file);
            
            const res = await API.post('/api/technician/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setProfilePhoto(res.data.profilePhoto);
            setSuccess('Profile photo uploaded successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading profile photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleUploadQualification = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const title = prompt('Enter qualification title (e.g., HND Computer Engineering):');
        if (!title) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid document format. Please upload JPG, PNG, or PDF.');
            return;
        }
        
        // Validate file size (20 MB)
        if (file.size > 20 * 1024 * 1024) {
            setError('Document size must not exceed 20 MB.');
            return;
        }

        setUploadingQualification(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('title', title);
            
            const res = await API.post('/api/technician/profile/upload-qualification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setQualifications(res.data.profile.qualificationDocuments || []);
            setSuccess('Qualification document uploaded successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading qualification document');
        } finally {
            setUploadingQualification(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                primarySpecialization,
                specializations,
                yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
                certifications: certifications ? certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
                bio,
                serviceLocation,
                serviceRadius: serviceRadius ? Number(serviceRadius) : 0,
                preferredWorkingHours,
                emergencyAfterHours,
                profilePhoto,
                phoneNumber,
                qualificationDocuments: qualifications,
                isAvailable
            };
            await API.put('/api/technician/profile', payload);
            setSuccess('Profile saved successfully.');
            const refreshed = await API.get('/api/technician/profile');
            const profile = refreshed.data.profile;
            setVerificationStatus(profile.verificationStatus || 'draft');
            setVerificationNotes(profile.verificationNotes || '');
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) setError('You must be logged in');
            else setError(err.response?.data?.message || 'Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForVerification = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await handleSave();
            const res = await API.post('/api/technician/profile/submit-verification');
            setVerificationStatus(res.data.profile?.verificationStatus || 'pending');
            setVerificationNotes(res.data.profile?.verificationNotes || '');
            setSuccess('Profile submitted for verification successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Please complete your technician profile before submitting it for verification.');
        } finally {
            setSubmitting(false);
        }
    };

    const statusMessage = {
        draft: 'Your profile is still in draft mode. Complete all required details and submit it for review.',
        pending: 'Your technician profile is awaiting verification. You cannot receive maintenance assignments until your profile is verified.',
        verified: 'Your technician profile has been verified. You can now receive maintenance assignments.',
        rejected: 'Your technician profile verification was rejected. Please review the verification notes and update your profile.'
    };

    const completionSections = [
        { label: 'Basic Information', complete: Boolean(user?.full_name) },
        { label: 'Phone Number', complete: Boolean(phoneNumber && phoneNumber.trim()) },
        { label: 'Specialization', complete: Boolean(primarySpecialization) },
        { label: 'Experience', complete: Boolean(yearsOfExperience !== '' && Number(yearsOfExperience) >= 0) },
        { label: 'Professional Bio', complete: Boolean(bio && bio.trim()) },
        { label: 'Service Location', complete: Boolean(serviceLocation && serviceLocation.trim()) },
        { label: 'Certification', complete: Boolean(certifications && certifications.trim()) },
        { label: 'Qualification Document', complete: Boolean(qualifications && qualifications.length > 0) },
        { label: 'Profile Photo', complete: Boolean(profilePhoto && profilePhoto.trim()) },
        { label: 'Availability', complete: typeof isAvailable === 'boolean' }
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f7f9ff]">
            <TechnicianSidebar />
            <main className="flex-1 flex flex-col md:ml-64 overflow-hidden">
                <header className="flex justify-between items-center px-6 w-full sticky top-0 z-50 bg-white h-16 border-b border-[#c1c6d6]">
                    <div className="font-bold text-lg text-[#005bbf]">Technician Profile Setup</div>
                    <div className="w-10 h-10 rounded-full bg-[#005bbf] flex items-center justify-center text-white font-bold text-sm">{user?.full_name?.charAt(0)}</div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white border border-[#c1c6d6] rounded-xl p-6 shadow-sm">
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-[#181c20]">Profile Completion</h3>
                                    <span className="text-sm font-semibold text-[#005bbf]">{completionPercentage}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-[#dfe7ff]">
                                    <div className="h-full rounded-full bg-[#005bbf]" style={{ width: `${completionPercentage}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-sm text-[#414754]">
                                {completionSections.map((section) => (
                                    <div key={section.label} className="flex items-center gap-2 rounded-lg bg-[#f1f4fa] px-3 py-2">
                                        <span className={`material-symbols-outlined text-sm ${section.complete ? 'text-green-600' : 'text-[#727785]'}`}>
                                            {section.complete ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        <span>{section.label}</span>
                                    </div>
                                ))}
                            </div>

                            {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
                            {success && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}
                            <div className="mb-4 rounded-lg border border-[#d8e2ff] bg-[#f1f4fa] px-4 py-3 text-sm text-[#181c20]">
                                <strong>Verification status:</strong> {verificationStatus?.charAt(0).toUpperCase() + verificationStatus?.slice(1)}
                                <div className="mt-2 text-[#414754]">{statusMessage[verificationStatus] || statusMessage.draft}</div>
                                {verificationNotes && <div className="mt-2 text-[#414754]">Note: {verificationNotes}</div>}
                            </div>

                            {loading ? (
                                <div className="text-sm text-[#414754]">Loading technician profile...</div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Full Name</label>
                                            <input value={user?.full_name || ''} readOnly className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 bg-[#f4f6fa] text-[#181c20]" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Email Address</label>
                                            <input value={user?.email || ''} readOnly className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2 bg-[#f4f6fa] text-[#181c20]" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Phone Number</label>
                                            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" placeholder="+234..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Primary Specialization</label>
                                            <select value={primarySpecialization} onChange={e => setPrimarySpecialization(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2">
                                                <option value="">Select specialization</option>
                                                {specializationsList.map(spec => (
                                                    <option key={spec} value={spec}>{spec.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-2 block">Other Specializations</label>
                                        <div className="flex flex-wrap gap-2">
                                            {specializationsList.map(spec => (
                                                <button
                                                    type="button"
                                                    key={spec}
                                                    onClick={() => toggleSpecialization(spec)}
                                                    className={`px-3 py-2 rounded-lg border ${specializations.includes(spec) ? 'bg-[#005bbf] text-white' : 'bg-white text-[#414754]'}`}>
                                                    {spec.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Years of Experience</label>
                                            <input type="number" min="0" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Service Radius (km)</label>
                                            <input type="number" min="0" value={serviceRadius} onChange={e => setServiceRadius(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" placeholder="Optional" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Preferred Hours</label>
                                            <input value={preferredWorkingHours} onChange={e => setPreferredWorkingHours(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" placeholder="e.g. 8am - 5pm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Service Location</label>
                                            <input value={serviceLocation} onChange={e => setServiceLocation(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" placeholder="e.g. Ibadan, Oyo" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Certifications</label>
                                            <input value={certifications} onChange={e => setCertifications(e.target.value)} className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" placeholder="HND, COREN, etc." />
                                        </div>
                                    </div>

                                    {/* Profile Photo Upload */}
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-2 block">Profile Photo</label>
                                        <div className="border-2 border-dashed border-[#c1c6d6] rounded-lg p-4 bg-[#f7f9ff] text-center">
                                            {profilePhoto ? (
                                                <div className="space-y-3">
                                                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 object-cover rounded-full mx-auto" />
                                                    <p className="text-sm text-[#414754]">Photo uploaded</p>
                                                    <label className="inline-block bg-[#005bbf] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#004493] text-sm font-semibold">
                                                        Change Photo
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadProfilePhoto} className="hidden" disabled={uploadingPhoto} />
                                                    </label>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="material-symbols-outlined text-5xl text-[#005bbf] mb-2 block">photo_camera</span>
                                                    <p className="text-sm text-[#414754] mb-3">Upload your profile photo</p>
                                                    <label className="inline-block bg-[#005bbf] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#004493] text-sm font-semibold">
                                                        {uploadingPhoto ? 'Uploading...' : 'Select Photo'}
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadProfilePhoto} className="hidden" disabled={uploadingPhoto} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Qualifications Upload */}
                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-2 block">Qualifications & Certificates</label>
                                        {qualifications.length > 0 && (
                                            <div className="mb-4 space-y-2">
                                                {qualifications.map((qual, idx) => (
                                                    <div key={idx} className="bg-[#f1f4fa] border border-[#c1c6d6] rounded-lg p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[#005bbf]">description</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#181c20]">{qual.name}</p>
                                                                <p className="text-xs text-[#727785]">{new Date(qual.uploadedAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <a href={qual.url} target="_blank" rel="noopener noreferrer" className="text-[#005bbf] hover:text-[#004493] font-semibold text-sm">
                                                            View
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="border-2 border-dashed border-[#c1c6d6] rounded-lg p-4 bg-[#f7f9ff] text-center">
                                            <span className="material-symbols-outlined text-5xl text-[#005bbf] mb-2 block">upload_file</span>
                                            <p className="text-sm text-[#414754] mb-3">Upload qualification/certificate (PDF, JPG, PNG)</p>
                                            <label className="inline-block bg-[#005bbf] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#004493] text-sm font-semibold">
                                                {uploadingQualification ? 'Uploading...' : 'Upload Certificate'}
                                                <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleUploadQualification} className="hidden" disabled={uploadingQualification} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 pt-2">
                                            <input id="available" type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />
                                            <label htmlFor="available" className="text-sm text-[#414754]">Available for jobs</label>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input id="after-hours" type="checkbox" checked={emergencyAfterHours} onChange={e => setEmergencyAfterHours(e.target.checked)} />
                                            <label htmlFor="after-hours" className="text-sm text-[#414754]">Emergency / After-hours</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-[#414754] uppercase mb-1 block">Professional Bio</label>
                                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows="5" className="w-full border border-[#c1c6d6] rounded-lg px-3 py-2" />
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <button type="submit" disabled={saving} className="bg-[#005bbf] text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
                                        <button type="button" onClick={() => {
                                            setPrimarySpecialization('');
                                            setSpecializations([]);
                                            setYearsOfExperience('');
                                            setCertifications('');
                                            setBio('');
                                            setServiceLocation('');
                                            setServiceRadius('');
                                            setPreferredWorkingHours('');
                                            setEmergencyAfterHours(false);
                                            setPhoneNumber(user?.phone_number || '');
                                            setProfilePhoto('');
                                            setQualifications([]);
                                            setIsAvailable(true);
                                        }} className="border border-[#c1c6d6] px-6 py-2 rounded-lg">Reset</button>
                                        <button
                                            type="button"
                                            onClick={handleSubmitForVerification}
                                            disabled={submitting || !primarySpecialization || !phoneNumber || !yearsOfExperience || !bio || !serviceLocation || !certifications || !qualifications.length || !profilePhoto}
                                            className="bg-[#0a7e3b] text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit for Verification'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicianProfileSetup;
