import React from "react";
import { Box, Typography, Alert } from "@mui/material";

const StepIntroduction: React.FC = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" gutterBottom>
            About This Form
        </Typography>
        <Typography variant="body1">
            This form is used by referees to report incidents that occur during Hills
            Raiders Basketball Association games. It is a formal record of any conduct
            that may require review by the tribunal.
        </Typography>
        <Typography variant="body1">
            Please complete all sections accurately and honestly. The information you
            provide will be used by the tribunal to assess the incident and determine
            any appropriate action.
        </Typography>
        <Alert severity="info">
            Only 1 player/coach/official per report. If multiple people are being
            reported, submit 1 report per person.
        </Alert>
        <Alert severity="info">
            <Typography variant="body2">
                <strong>
                    Before you begin, please ensure you have the following information
                    ready:
                </strong>
            </Typography>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                <li>Full names of both teams involved</li>
                <li>Date, time, venue, and court of the game</li>
                <li>Name and/or number of the person on report</li>
                <li>A clear summary of the facts</li>
            </ul>
        </Alert>
    </Box>
);

export default StepIntroduction;
