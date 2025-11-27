import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Fetch stats or providers
        // For now just show welcome
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to PetSense Admin</p>
            <button onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
            }}>Logout</button>
        </div>
    );
}

export default Dashboard;
