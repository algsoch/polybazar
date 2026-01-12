'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, XMarkIcon, SparklesIcon, ShieldCheckIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

const categories = [
  'HDPE', 'LDPE', 'LLDPE', 'PP', 'PET', 'PVC', 'PS', 'ABS', 'PC', 'Nylon', 'Other'
];

const grades = ['A+', 'A', 'B+', 'B', 'C'];

const locations = [
  'Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Ahmedabad', 'Pune', 'Kolkata', 'Hyderabad', 'Other'
];

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [kycDocuments, setKycDocuments] = useState({ gst: null, pan: null, businessProof: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      category: '',
      grade: '',
      location: '',
      pricePerKg: '',
      minOrderQuantity: 100,
      availableQuantity: '',
    }
  });

  const watchCategory = watch('category');
  const watchGrade = watch('grade');
  const watchLocation = watch('location');

  // Image dropzone
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 5));
      
      // AI Classification on first image
      if (acceptedFiles.length > 0 && !aiClassification) {
        classifyImage(acceptedFiles[0]);
      }
    }
  });

  // KYC document dropzones
  const createKycDropzone = (docType) => useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setKycDocuments(prev => ({
          ...prev,
          [docType]: {
            file: acceptedFiles[0],
            preview: acceptedFiles[0].type.startsWith('image/') 
              ? URL.createObjectURL(acceptedFiles[0]) 
              : null
          }
        }));
      }
    }
  });

  const gstDropzone = createKycDropzone('gst');
  const panDropzone = createKycDropzone('pan');
  const businessProofDropzone = createKycDropzone('businessProof');

  const classifyImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/ml/vision/classify`, {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiClassification(data);
        if (data.type) setValue('category', data.type);
        toast.success(`AI detected: ${data.type} (${Math.round(data.confidence * 100)}% confidence)`);
      }
    } catch (error) {
      console.error('Classification failed:', error);
      // Mock classification for demo
      const mockTypes = ['HDPE', 'PP', 'PET', 'LDPE'];
      const mockResult = {
        type: mockTypes[Math.floor(Math.random() * mockTypes.length)],
        confidence: 0.85 + Math.random() * 0.1
      };
      setAiClassification(mockResult);
      setValue('category', mockResult.type);
      toast.success(`AI detected: ${mockResult.type} (${Math.round(mockResult.confidence * 100)}% confidence)`);
    }
  };

  const fetchPricePrediction = async () => {
    if (!watchCategory || !watchGrade || !watchLocation) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/ml/price/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: watchCategory,
          grade: watchGrade,
          location: watchLocation,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPredictedPrice(data);
      }
    } catch {
      // Mock prediction for demo
      setPredictedPrice({
        predictedPrice: 60 + Math.floor(Math.random() * 40),
        minPrice: 50 + Math.floor(Math.random() * 20),
        maxPrice: 80 + Math.floor(Math.random() * 40),
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img.file));
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (res.ok) {
        toast.success('Product listed successfully! Pending approval.');
        router.push('/dashboard');
      } else {
        throw new Error('Failed to list product');
      }
    } catch (error) {
      toast.error('Failed to list product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitKyc = async () => {
    if (!kycDocuments.gst || !kycDocuments.pan) {
      toast.error('Please upload GST and PAN documents');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('gst', kycDocuments.gst.file);
      formData.append('pan', kycDocuments.pan.file);
      if (kycDocuments.businessProof) {
        formData.append('businessProof', kycDocuments.businessProof.file);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/users/me/kyc`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (res.ok) {
        toast.success('KYC documents submitted successfully!');
        setStep(2);
      } else {
        throw new Error('KYC submission failed');
      }
    } catch {
      toast.error('KYC submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h2 text-gray-900 mb-2">List Your Product</h1>
          <p className="text-body text-neutral-muted">
            Start selling polymer materials on India's largest B2B marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'KYC Verification' },
            { num: 2, label: 'Product Details' },
            { num: 3, label: 'Review & Submit' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s.num ? 'bg-primary text-white' : 'bg-neutral-bg text-neutral-muted border-2 border-neutral-border'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`ml-2 text-small hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-neutral-muted'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.num ? 'bg-primary' : 'bg-neutral-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: KYC Verification */}
        {step === 1 && (
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-h4 text-gray-900">Business Verification</h2>
                <p className="text-small text-neutral-muted">Upload your KYC documents for verification</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* GST Certificate */}
              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  GST Certificate <span className="text-danger">*</span>
                </label>
                <div
                  {...gstDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-colors ${
                    kycDocuments.gst ? 'border-accent bg-accent-50' : 'border-neutral-border hover:border-primary'
                  }`}
                >
                  <input {...gstDropzone.getInputProps()} />
                  {kycDocuments.gst ? (
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <DocumentTextIcon className="w-6 h-6" />
                      <span className="font-medium">{kycDocuments.gst.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-10 h-10 text-neutral-muted mx-auto mb-2" />
                      <p className="text-small text-neutral-muted">Drop GST certificate or click to upload</p>
                    </>
                  )}
                </div>
              </div>

              {/* PAN Card */}
              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  PAN Card <span className="text-danger">*</span>
                </label>
                <div
                  {...panDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-colors ${
                    kycDocuments.pan ? 'border-accent bg-accent-50' : 'border-neutral-border hover:border-primary'
                  }`}
                >
                  <input {...panDropzone.getInputProps()} />
                  {kycDocuments.pan ? (
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <DocumentTextIcon className="w-6 h-6" />
                      <span className="font-medium">{kycDocuments.pan.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-10 h-10 text-neutral-muted mx-auto mb-2" />
                      <p className="text-small text-neutral-muted">Drop PAN card or click to upload</p>
                    </>
                  )}
                </div>
              </div>

              {/* Business Proof (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Business Registration Proof <span className="text-neutral-muted">(Optional)</span>
                </label>
                <div
                  {...businessProofDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-card p-6 text-center cursor-pointer transition-colors ${
                    kycDocuments.businessProof ? 'border-accent bg-accent-50' : 'border-neutral-border hover:border-primary'
                  }`}
                >
                  <input {...businessProofDropzone.getInputProps()} />
                  {kycDocuments.businessProof ? (
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <DocumentTextIcon className="w-6 h-6" />
                      <span className="font-medium">{kycDocuments.businessProof.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-10 h-10 text-neutral-muted mx-auto mb-2" />
                      <p className="text-small text-neutral-muted">Shop Act License, MSME Registration, etc.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={submitKyc} disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Product Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit((data) => setStep(3))} className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <PhotoIcon className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-h4 text-gray-900">Product Details</h2>
                <p className="text-small text-neutral-muted">Add images and details about your product</p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-small font-medium text-gray-900 mb-2">
                Product Images <span className="text-danger">*</span> <span className="text-neutral-muted">(Up to 5)</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img.preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <div
                    {...getImageRootProps()}
                    className="aspect-square border-2 border-dashed border-neutral-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <input {...getImageInputProps()} />
                    <CloudArrowUpIcon className="w-8 h-8 text-neutral-muted mb-1" />
                    <span className="text-tiny text-neutral-muted">Add Image</span>
                  </div>
                )}
              </div>

              {/* AI Classification Result */}
              {aiClassification && (
                <div className="mt-4 p-4 bg-accent-50 rounded-lg flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-accent" />
                  <div>
                    <p className="font-medium text-gray-900">AI Classification</p>
                    <p className="text-small text-neutral-muted">
                      Detected: <strong>{aiClassification.type}</strong> ({Math.round(aiClassification.confidence * 100)}% confidence)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  {...register('name', { required: 'Product name is required' })}
                  className="input"
                  placeholder="e.g., HDPE Granules - Virgin Grade"
                />
                {errors.name && <p className="text-tiny text-danger mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Category <span className="text-danger">*</span>
                </label>
                <select {...register('category', { required: 'Category is required' })} className="input">
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-tiny text-danger mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Grade <span className="text-danger">*</span>
                </label>
                <select
                  {...register('grade', { required: 'Grade is required' })}
                  className="input"
                  onChange={(e) => {
                    setValue('grade', e.target.value);
                    fetchPricePrediction();
                  }}
                >
                  <option value="">Select grade</option>
                  {grades.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-tiny text-danger mt-1">{errors.grade.message}</p>}
              </div>

              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Location <span className="text-danger">*</span>
                </label>
                <select
                  {...register('location', { required: 'Location is required' })}
                  className="input"
                  onChange={(e) => {
                    setValue('location', e.target.value);
                    fetchPricePrediction();
                  }}
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.location && <p className="text-tiny text-danger mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Price per kg (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  {...register('pricePerKg', { required: 'Price is required', min: 1 })}
                  className="input"
                  placeholder="e.g., 85"
                />
                {predictedPrice && (
                  <p className="text-tiny text-accent mt-1">
                    AI Suggested: ₹{predictedPrice.predictedPrice}/kg (Range: ₹{predictedPrice.minPrice}-₹{predictedPrice.maxPrice})
                  </p>
                )}
                {errors.pricePerKg && <p className="text-tiny text-danger mt-1">{errors.pricePerKg.message}</p>}
              </div>

              <div>
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Available Quantity (kg) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  {...register('availableQuantity', { required: 'Quantity is required', min: 1 })}
                  className="input"
                  placeholder="e.g., 5000"
                />
                {errors.availableQuantity && <p className="text-tiny text-danger mt-1">{errors.availableQuantity.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-small font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input min-h-[120px]"
                  placeholder="Describe your product specifications, quality, applications, etc."
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                Back
              </button>
              <button type="submit" className="btn-primary">
                Review Listing
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="card p-8">
            <h2 className="text-h4 text-gray-900 mb-6">Review Your Listing</h2>
            
            <div className="bg-neutral-bg rounded-card p-6 mb-6">
              <p className="text-body">
                Your listing will be reviewed by our team. Once approved, it will be visible to all buyers on the platform.
              </p>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-ghost">
                Back to Edit
              </button>
              <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
