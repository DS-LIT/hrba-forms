import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface NavigationItemProps {
    to: string;
    children: React.ReactNode;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ to, children }) => {
    return (
        <div className="link-container">
            <Link to={to} className="link">
                {children}
                <FontAwesomeIcon icon={faChevronRight} className="icon" />
            </Link>
        </div>
    );
}

export default NavigationItem;