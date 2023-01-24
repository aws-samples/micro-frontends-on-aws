// host/src/App.js
import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
const Remote1App = React.lazy(() => import('Remote1/App'));
const Remote1Button = React.lazy(() => import('Remote1/Button'));
const Remote2App = React.lazy(() => import('Remote2/App'));
const Remote2Button = React.lazy(() => import('Remote2/Button'));
import './App.css';

interface Props {
    children?: ReactNode;
}

const RemoteWrapper = ({ children }: Props) => (
    <div>
        <ErrorBoundary>{children}</ErrorBoundary>
    </div>
);

export const App = () => (
    <div className='App'>
        <h1>HOST APP</h1>
        <div className='main'>
            <div className='remote'>
                <h2>Remote 1</h2>
                <RemoteWrapper>
                    <Remote1App />
                    <Remote1Button />
                </RemoteWrapper>
            </div>
            <div className='remote'>
                <h2>Remote 2</h2>
                <RemoteWrapper>
                    <Remote2App />
                    <Remote2Button />
                </RemoteWrapper>
            </div>
        </div>
    </div>
);
export default App;
