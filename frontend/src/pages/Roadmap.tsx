import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, ArrowRight } from 'lucide-react';

const Roadmap: React.FC = () => {
    const location = useLocation();
    const analysis = location.state?.analysis;

    if (!analysis) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Roadmap Found</h2>
                    <Link to="/" className="text-blue-600 hover:underline">Go back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 print:mb-4">Your Personalized Career Roadmap</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:gap-0">
                    {/* Gaps Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0 print:mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                            Identified Gaps
                        </h2>
                        <div className="space-y-4">
                            {analysis.gaps?.map((gap: any, index: number) => (
                                <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2 bg-yellow-50 rounded-r-md print:bg-transparent print:border-l-2">
                                    <h3 className="font-medium text-gray-800">{gap.description}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{gap.evidence}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full mt-2 inline-block ${gap.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {gap.severity.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roadmap Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
                            Action Plan
                        </h2>
                        <div className="space-y-6">
                            {analysis.roadmap?.map((step: any, index: number) => (
                                <div key={index} className="relative pl-8 border-l-2 border-blue-200 pb-6 last:pb-0 print:break-inside-avoid">
                                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100 print:hidden"></div>
                                    <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                                    <p className="text-gray-600 mt-1">{step.description}</p>
                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded mr-2 print:border print:bg-transparent">{step.category}</span>
                                        <span>{step.suggested_timeframe}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors mr-4"
                    >
                        Export to PDF
                    </button>
                    <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        Start New Analysis <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
