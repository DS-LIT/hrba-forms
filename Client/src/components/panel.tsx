import React from "react";

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="panel">
            {children}
        </div>
    );
}
export default Panel;