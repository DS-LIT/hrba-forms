import React from "react";
import Panel from "../../components/panel";
import NavigationItem from "../../components/navigationItem";

const Dashboard = () => {
    return (
        <>
            <h1>Hills Raiders Forms</h1>
            <Panel><h2>Referee Forms</h2>
                <NavigationItem to="/tribunal"><>Referee Tribuneral Report</></NavigationItem>
            </Panel>

            <Panel><h2>Financial</h2>
                <NavigationItem to="/hrba-reimbursement"><>Hills Raiders Reimbursement Form</></NavigationItem>
                <NavigationItem to="/bwa-reimbursement"><>BWA Reimbursement Form</></NavigationItem>
            </Panel>
        </>
    );
}

export default Dashboard;