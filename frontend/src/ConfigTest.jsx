import React from 'react';
import { CONFIG } from './config';

const ConfigTest = () => {
    return (
        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', margin: '20px' }}>
            <h2 style={{ color: '#333' }}>Config Source of Truth Test</h2>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
                {JSON.stringify(CONFIG, null, 2)}
            </pre>
            <p><strong>API URL:</strong> {CONFIG.API_URL}</p>
            <p><strong>App Name:</strong> {CONFIG.APP_NAME}</p>
        </div>
    );
};

export default ConfigTest;
