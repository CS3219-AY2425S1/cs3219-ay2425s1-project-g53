import axios from 'axios';

const handleFindMatch = async () => {
    const user_id = 123;  // Replace with actual user ID
    const question_id = 456;  // Replace with actual question ID

    try {
        const response = await axios.post('http://localhost:8086/find_match/', {
            user_id,
            question_id,
        });

        console.log('Match response:', response.data);
    } catch (error) {
        console.error('Error finding match:', error);
    }
};