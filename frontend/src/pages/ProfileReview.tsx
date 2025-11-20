import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Save } from 'lucide-react';

const ProfileReview: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [filename, setFilename] = useState('');

    useEffect(() => {
        if (location.state?.text) {
            setText(location.state.text);
            setFilename(location.state.filename || 'Uploaded Resume');
        } else {
            // Fallback if accessed directly without state (should redirect to home)
            navigate('/');
        }
    }, [location.state, navigate]);

    const handleContinue = () => {
        // Pass the confirmed text to the questionnaire
        navigate('/questionnaire', {
            state: {
                resumeText: text,
                resumePath: location.state?.filename
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <FileText className="mr-2" />
                        Review Your Profile
                    </h1>
                    <p className="text-blue-100 mt-1">
                        We extracted the following text from <strong>{filename}</strong>. Please review and edit any errors to ensure accurate analysis.
                    </p>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Extracted Text
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleContinue}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Confirm & Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileReview;
