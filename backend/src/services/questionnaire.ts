// For MVP, we'll use a static list of questions.
// In a real app, this could be fetched from the DB.

export const getQuestions = () => {
    return [
        {
            id: 'industry',
            text: 'What is your target industry?',
            type: 'text',
        },
        {
            id: 'role',
            text: 'What is your target role?',
            type: 'text',
        },
        {
            id: 'experience',
            text: 'How many years of experience do you have?',
            type: 'number',
        },
        {
            id: 'goals',
            text: 'What are your primary career goals?',
            type: 'textarea',
        },
    ];
};
