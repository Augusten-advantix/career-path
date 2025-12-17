import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useToast } from './ToastContext';

interface UploadAreaProps {
    onUploadComplete: () => void;
    jobRequirementId?: number | null;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadComplete, jobRequirementId }) => {
    const { showToast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            if (jobRequirementId) formData.append('jobRequirementId', String(jobRequirementId));
            await axios.post('/api/recruiter/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadComplete();
        } catch (error) {
            console.error('Upload failed:', error);
            showToast('error', 'Upload failed. Please try again.');
        }
    }, [onUploadComplete, jobRequirementId, showToast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip']
        }
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
                <p className="text-blue-600">Drop the files here ...</p>
            ) : (
                <p className="text-gray-600">Drag & drop resumes (PDF, DOCX, ZIP) here, or click to select files</p>
            )}
        </div>
    );
};

export default UploadArea;
