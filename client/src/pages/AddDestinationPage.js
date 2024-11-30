import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AddDestinationPage = () => {
    const { id } = useParams(); // List ID
    const [destinationId, setDestinationId] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleAddDestination = async () => {
        try {
            const response = await axios.post(
                `http://localhost:3000/api/lists/${id}/add-destination`,
                { destinationId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setSuccess('Destination added successfully!');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add destination.');
            setSuccess('');
        }
    };

    return (
        <div>
            <h1>Add Destination</h1>
            <input
                type="text"
                placeholder="Destination ID"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
            />
            <button onClick={handleAddDestination}>Add Destination</button>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AddDestinationPage;
