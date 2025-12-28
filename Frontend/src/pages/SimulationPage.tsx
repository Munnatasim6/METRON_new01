
import React, { Suspense } from 'react';
// MainLayout handles Sidebar and Header, so we just return the content
// Lazy load the simulation lab component
const SimulationLab = React.lazy(() => import('@/components/SimulationLab'));

const SimulationPage: React.FC = () => {
    return (
        <div className="h-[calc(100vh-100px)]">
            {/* Height calculation: 100vh - Header(64px approx) - Padding. 
                SimulationLab expects to fill the parent. 
                MainLayout gives us a flex-1 container. 
                We might need to ensure full height for the laboratory view. 
            */}
            <Suspense fallback={
                <div className="flex h-full w-full items-center justify-center text-neon-blue font-mono animate-pulse">
                    Initializing Quantum Simulation Environment...
                </div>
            }>
                <SimulationLab />
            </Suspense>
        </div>
    );
};

export default SimulationPage;
