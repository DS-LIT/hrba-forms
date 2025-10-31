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
                <NavigationItem to="/hrba-reimbursement"><>Hills Raiders Refund Form</></NavigationItem>
                <NavigationItem to="https://forms.office.com/r/y50YxwMH39"><>BWA Refund Form</></NavigationItem>
            </Panel>
        </>
    );
}

export default Dashboard;