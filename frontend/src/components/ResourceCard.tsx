import React from 'react';
import { ExternalLink, DollarSign, Clock, Star, Book, Code, Users, Wrench } from 'lucide-react';

interface Course {
    name: string;
    provider: string;
    url: string;
    duration: string;
    cost: { amount: number; currency: string } | 'free';
    rating?: number;
    difficulty: string;
}

interface Book {
    title: string;
    author: string;
    amazonUrl?: string;
    cost: { amount: number; currency: string };
}

interface ProjectIdea {
    title: string;
    description: string;
    githubTemplate?: string;
    complexity: string;
    estimatedHours: number;
}

interface Community {
    name: string;
    platform: string;
    url: string;
    activity: string;
}

interface Tool {
    name: string;
    purpose: string;
    url: string;
    cost: string;
}

interface Props {
    resources: {
        courses?: Course[];
        books?: Book[];
        projects?: ProjectIdea[];
        communities?: Community[];
        tools?: Tool[];
    };
}

const ResourceCard: React.FC<Props> = ({ resources }) => {
    const formatCost = (cost: { amount: number; currency: string } | 'free'): string => {
        if (cost === 'free') return 'Free';
        return `${cost.currency} ${cost.amount}`;
    };

    return (
        <div className="space-y-4 mt-4">
            {/* Courses */}
            {resources.courses && resources.courses.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Book className="w-4 h-4 mr-2 text-blue-600" />
                        Recommended Courses ({resources.courses.length})
                    </h4>
                    <div className="space-y-3">
                        {resources.courses.map((course, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-gray-800 flex-1">{course.name}</h5>
                                    <span className={`px-2 py-1 text-xs rounded-full ml-2 ${course.cost === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {formatCost(course.cost)}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <span className="font-medium mr-1">Provider:</span> {course.provider}
                                    </span>
                                    <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {course.duration}
                                    </span>
                                    {course.rating && (
                                        <span className="flex items-center">
                                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                            {course.rating}/5
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                        course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {course.difficulty}
                                    </span>
                                </div>

                                <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View Course <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Books */}
            {resources.books && resources.books.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Book className="w-4 h-4 mr-2 text-purple-600" />
                        Recommended Books ({resources.books.length})
                    </h4>
                    <div className="space-y-3">
                        {resources.books.map((book, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                                <h5 className="font-semibold text-gray-800">{book.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 flex items-center">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        {formatCost(book.cost)}
                                    </span>
                                    {book.amazonUrl && (
                                        <a
                                            href={book.amazonUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                                        >
                                            View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* projects */}
            {resources.projects && resources.projects.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Code className="w-4 h-4 mr-2 text-green-600" />
                        Assessments ({resources.projects.length})
                    </h4>
                    <div className="space-y-3">
                        {resources.projects.map((project, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                                <h5 className="font-semibold text-gray-800">{project.title}</h5>
                                <p className="text-sm text-gray-600 my-2">{project.description}</p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full ${project.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                                        project.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {project.complexity}
                                    </span>
                                    <span className="flex items-center text-gray-700">
                                        <Clock className="w-3 h-3 mr-1" />
                                        ~{project.estimatedHours}h
                                    </span>
                                </div>
                                {project.githubTemplate && (
                                    <a
                                        href={project.githubTemplate}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium mt-2"
                                    >
                                        GitHub Template <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Communities */}
            {resources.communities && resources.communities.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-orange-600" />
                        Communities ({resources.communities.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resources.communities.map((community, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-orange-50 flex justify-between items-center">
                                <div>
                                    <h5 className="font-semibold text-gray-800 text-sm">{community.name}</h5>
                                    <span className="text-xs text-gray-600">{community.platform}</span>
                                </div>
                                <a
                                    href={community.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-800"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tools */}
            {resources.tools && resources.tools.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Wrench className="w-4 h-4 mr-2 text-gray-600" />
                        Tools & Resources ({resources.tools.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resources.tools.map((tool, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-semibold text-gray-800 text-sm">{tool.name}</h5>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${tool.cost === 'free' ? 'bg-green-100 text-green-700' :
                                        tool.cost === 'freemium' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {tool.cost}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{tool.purpose}</p>
                                <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 text-xs font-medium flex items-center"
                                >
                                    Visit <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceCard;
