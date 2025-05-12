import React from "react";
import Panel from "../../components/panel";
import { Link } from "react-router-dom";
import NavigationItem from "../../components/navigationItem";

const Dashboard = () => {
    return (
        <>
            <Panel>
                <h1>Dashboard</h1>
            </Panel>
            <Panel><h2>Referee Forms</h2>
                <NavigationItem to="/tribunal"><>Referee Tribuneral Report</></NavigationItem>
            </Panel>

            <Panel><h2>Finacial</h2>
                <NavigationItem to="/reimbursement"><>Reimbursement Form</></NavigationItem>
            </Panel>
        </>
    );
}

export default Dashboard;