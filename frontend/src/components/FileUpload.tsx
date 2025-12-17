import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

interface ModelOption {
    key: string;
    id: string;
    name: string;
    provider: string;
}

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [models, setModels] = useState<ModelOption[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    // Fetch available models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/models`);
                setModels(response.data);
                // Load saved model from localStorage
                const savedModel = localStorage.getItem('selectedModel');
                if (savedModel && response.data.some((m: ModelOption) => m.key === savedModel)) {
                    setSelectedModel(savedModel);
                }
            } catch (error) {
                console.error('Failed to fetch models:', error);
                // Fallback models if API fails
                setModels([
                    { key: 'gemini-1.5-flash', id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', provider: 'Google' },
                    { key: 'gpt-4o-mini', id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
                    { key: 'claude-3-haiku', id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' }
                ]);
            }
        };
        fetchModels();
    }, []);

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

    const handleModelSelect = (modelKey: string) => {
        setSelectedModel(modelKey);
        localStorage.setItem('selectedModel', modelKey);
        setShowModelDropdown(false);
        console.log('🤖 Model selected:', modelKey);
    };

    const getSelectedModelName = () => {
        const model = models.find(m => m.key === selectedModel);
        return model ? `${model.name} (${model.provider})` : selectedModel;
    };

    const handleUpload = async () => {
        if (!file) {
            console.log('⚠️ No file selected for upload');
            return;
        }

        console.log('🚀 Starting file upload for:', file.name);
        console.log('🤖 Using model:', selectedModel);

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('model', selectedModel);

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
                localStorage.setItem('selectedModel', selectedModel);
                // Navigate to review page with text, filename, and model
                console.log('🧭 Navigating to /review with state');
                navigate('/review', {
                    state: {
                        text: response.data.text,
                        filename: response.data.filename,
                        model: selectedModel
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
        <div className="w-full mx-auto">
            {/* Model Selector */}
            <div className="mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    🤖 AI Model
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left bg-white border-2 border-blue-300 rounded-lg sm:rounded-xl hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    >
                        <span className="text-gray-800 font-medium truncate pr-2">{getSelectedModelName()}</span>
                        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform flex-shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showModelDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-200 rounded-lg sm:rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                            {models.map((model) => (
                                <button
                                    key={model.key}
                                    onClick={() => handleModelSelect(model.key)}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-blue-50 transition-colors text-sm sm:text-base ${selectedModel === model.key ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                                        }`}
                                >
                                    <div className="font-medium text-gray-800">{model.name}</div>
                                    <div className="text-xs sm:text-sm text-gray-500">{model.provider}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
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
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mb-2" />
                        <p className="text-gray-700 font-medium text-sm sm:text-base break-all px-2">{file.name}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium text-sm sm:text-base">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">PDF, DOCX, TXT (Max 5MB)</p>
                    </div>
                )}
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-md flex items-center text-sm sm:text-base ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />}
                    <span className="break-words">{message.text}</span>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full mt-4 py-2.5 sm:py-3 px-4 rounded-md text-white font-medium flex items-center justify-center text-sm sm:text-base ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
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

