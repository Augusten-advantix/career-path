import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            console.log('📎 File selected:', {
                name: e.target.files[0].name,
                size: e.target.files[0].size,
                type: e.target.files[0].type
            });
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setMessage(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!file) {
            console.log('⚠️ No file selected for upload');
            return;
        }

        console.log('🚀 Starting file upload for:', file.name);

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('resume', file);

        console.log('📦 FormData prepared, sending to:', `${config.apiUrl}/upload`);

        try {
            const response = await axios.post(`${config.apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('✅ Upload successful! Response:', response.data);
            setMessage({ type: 'success', text: 'File uploaded successfully!' });
            setFile(null);
            if (response.data.filename) {
                console.log('💾 Saving to localStorage:', response.data.filename);
                console.log('📝 Resume text length:', response.data.text?.length || 0);
                localStorage.setItem('resumePath', response.data.filename);
                // Navigate to review page with text and filename
                console.log('🧭 Navigating to /review with state');
                navigate('/review', {
                    state: {
                        text: response.data.text,
                        filename: response.data.filename
                    }
                });
            } else {
                console.warn('⚠️ No filename in response');
            }
        } catch (error: any) {
            console.error('❌ Upload failed:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
            }
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
        } finally {
            setUploading(false);
            console.log('🏁 Upload process completed');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-8">
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                />

                {file ? (
                    <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-blue-500 mb-2" />
                        <p className="text-gray-700 font-medium">{file.name}</p>
                        <p className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm mt-1">PDF, DOCX, TXT (Max 5MB)</p>
                    </div>
                )}
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full mt-4 py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    'Upload Resume'
                )}
            </button>
        </div>
    );
};

export default FileUpload;
