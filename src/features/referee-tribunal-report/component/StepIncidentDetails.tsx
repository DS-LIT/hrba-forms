import React from "react";
import { Controller } from "react-hook-form";
import {
    TextField,
    Box,
    Typography,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { StepProps } from "./types";

const ALLEGATION_OPTIONS = [
    "Disputed decisions of officials or breached code of conduct.",
    "Used abusive, threatening, obscene language or gestures.",
    "Acted in an unsportsmanlike manner in or around the stadium, including damage to property.",
    "Attempted to trip, strike, push, elbow or kick player/official.",
    "Tripped, punched, slapped, pushed, elbowed, kicked or spat at a player/official.",
    "Participated in basketball activities whilst suspended.",
    "Engaged in conduct likely to bring the game into disrepute.",
    "Deliberately did an act endangering safety/health of players/spectators/officials.",
];

interface Props extends StepProps {
    reportedPersonTeamOptions: string[];
}

const StepIncidentDetails: React.FC<Props> = ({
    control,
    errors,
    handleRequiredFieldChange,
    reportedPersonTeamOptions,
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" gutterBottom>
            Incident Details
        </Typography>

        {/* Person on Report */}
        <Controller
            name="reportedPersonsName"
            control={control}
            rules={{ required: "Name of person being reported is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "reportedPersonsName",
                        field.onChange,
                        "Name of person being reported is required"
                    )}
                    label="Name of Person Being Reported"
                    fullWidth
                    error={!!errors.reportedPersonsName}
                    helperText={
                        errors.reportedPersonsName?.message ??
                        "Please refer to PlayHQ for correct details"
                    }
                />
            )}
        />

        <Controller
            name="reportedPersonsNumber"
            control={control}
            rules={{ required: "Number of person being reported is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "reportedPersonsNumber",
                        field.onChange,
                        "Number of person being reported is required"
                    )}
                    label="Number of Person Being Reported"
                    fullWidth
                    error={!!errors.reportedPersonsNumber}
                    helperText={
                        errors.reportedPersonsNumber?.message ??
                        "Please refer to PlayHQ for correct details"
                    }
                />
            )}
        />

        <Controller
            name="reportedPersonsTeam"
            control={control}
            rules={{ required: "Team of person being reported is required" }}
            render={({ field }) => (
                <FormControl fullWidth error={!!errors.reportedPersonsTeam}>
                    <InputLabel id="reported-person-team-label" shrink>
                        Team of Person Being Reported
                    </InputLabel>
                    <Select
                        {...field}
                        labelId="reported-person-team-label"
                        label="Team of Person Being Reported"
                        displayEmpty
                        notched
                        onChange={handleRequiredFieldChange(
                            "reportedPersonsTeam",
                            field.onChange,
                            "Team of person being reported is required"
                        )}
                    >
                        <MenuItem value="">
                            <em>Select team</em>
                        </MenuItem>
                        {reportedPersonTeamOptions.map((teamName) => (
                            <MenuItem key={teamName} value={teamName}>
                                {teamName}
                            </MenuItem>
                        ))}
                        <MenuItem value="NA">
                            <em>N/A</em>
                        </MenuItem>
                    </Select>
                    <Typography
                        variant="caption"
                        color={errors.reportedPersonsTeam ? "error" : "text.secondary"}
                    >
                        {errors.reportedPersonsTeam?.message ??
                            (reportedPersonTeamOptions.length > 0
                                ? "Select one of the teams entered in the previous step"
                                : "Enter Team 1 and Team 2 in the previous step to populate this list")}
                    </Typography>
                </FormControl>
            )}
        />

        {/* Allegations */}
        <FormControl component="fieldset" error={!!errors.allegations}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Check the appropriate item(s)
            </Typography>
            <FormGroup>
                {ALLEGATION_OPTIONS.map((allegation, index) => (
                    <Controller
                        key={index}
                        name="allegations"
                        control={control}
                        rules={{
                            validate: (value) =>
                                (value && value.length > 0) ||
                                "At least one allegation must be selected",
                        }}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value={allegation}
                                        checked={field.value?.includes(allegation)}
                                        onChange={(e) => {
                                            const { value, checked } = e.target;
                                            field.onChange(
                                                checked
                                                    ? [...(field.value || []), value]
                                                    : field.value.filter((v: string) => v !== value)
                                            );
                                        }}
                                    />
                                }
                                label={allegation}
                            />
                        )}
                    />
                ))}
            </FormGroup>
            {errors.allegations && (
                <Typography variant="caption" color="error">
                    {errors.allegations.message}
                </Typography>
            )}
        </FormControl>

        {/* Summary Fields */}
        <Controller
            name="summaryprior"
            control={control}
            rules={{ required: "Summary of details leading up to incident is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "summaryprior",
                        field.onChange,
                        "Summary of details leading up to incident is required"
                    )}
                    label="Summary of details leading up to incident"
                    multiline
                    minRows={6}
                    fullWidth
                    error={!!errors.summaryprior}
                    helperText={errors.summaryprior?.message}
                />
            )}
        />

        <Controller
            name="summary"
            control={control}
            rules={{ required: "Summary of facts is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "summary",
                        field.onChange,
                        "Summary of facts is required"
                    )}
                    label="Summary of the Facts"
                    multiline
                    minRows={6}
                    fullWidth
                    error={!!errors.summary}
                    helperText={errors.summary?.message}
                />
            )}
        />

        <Controller
            name="summaryafter"
            control={control}
            rules={{ required: "Summary of actions from after incident is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "summaryafter",
                        field.onChange,
                        "Summary of actions from after incident is required"
                    )}
                    label="Summary of actions from after incident"
                    multiline
                    minRows={6}
                    fullWidth
                    error={!!errors.summaryafter}
                    helperText={errors.summaryafter?.message}
                />
            )}
        />

        <Controller
            name="witness"
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    label="Witness involved (name if known)"
                    fullWidth
                    error={!!errors.witness}
                    helperText={errors.witness?.message ?? "Optional"}
                />
            )}
        />

        <Controller
            name="staffWatching"
            control={control}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                        />
                    }
                    label="Was there a HRBA Staff member watching?"
                />
            )}
        />
    </Box>
);

export default StepIncidentDetails;
