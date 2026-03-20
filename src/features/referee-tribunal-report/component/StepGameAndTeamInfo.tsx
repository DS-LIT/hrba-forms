import React from "react";
import { Controller } from "react-hook-form";
import {
    TextField,
    Box,
    Typography,
    Autocomplete,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import { StepProps } from "./types";

const COLOUR_OPTIONS = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Purple" },
    { value: "pink", label: "Pink" },
    { value: "brown", label: "Brown" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
];

interface Props extends StepProps {
    venueOptions: string[];
}

const StepGameAndTeamInfo: React.FC<Props> = ({
    control,
    errors,
    handleRequiredFieldChange,
    venueOptions,
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="h6" gutterBottom>
            Game &amp; Team Information
        </Typography>

        {/* Game Information */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
                Game Information
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }} className="break-2">
                <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            onChange={handleRequiredFieldChange("date", field.onChange, "Date is required")}
                            label="Game Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.date}
                            helperText={errors.date?.message}
                        />
                    )}
                />
                <Controller
                    name="time"
                    control={control}
                    rules={{ required: "Time is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            onChange={handleRequiredFieldChange("time", field.onChange, "Time is required")}
                            label="Game Time"
                            type="time"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.time}
                            helperText={errors.time?.message}
                        />
                    )}
                />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }} className="break-2">
                <Controller
                    name="court"
                    control={control}
                    rules={{ required: "Court is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            onChange={handleRequiredFieldChange("court", field.onChange, "Court is required")}
                            label="Court"
                            fullWidth
                            error={!!errors.court}
                            helperText={errors.court?.message}
                        />
                    )}
                />
                <Controller
                    name="venue"
                    control={control}
                    rules={{ required: "Venue is required" }}
                    render={({ field }) => {
                        const onVenueChange = handleRequiredFieldChange(
                            "venue",
                            field.onChange,
                            "Venue is required"
                        );
                        return (
                            <Autocomplete
                                freeSolo
                                options={venueOptions}
                                value={field.value || ""}
                                onChange={(_, newValue) =>
                                    onVenueChange(typeof newValue === "string" ? newValue : "")
                                }
                                onInputChange={(_, newInputValue) => onVenueChange(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Venue"
                                        fullWidth
                                        error={!!errors.venue}
                                        helperText={errors.venue?.message}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        );
                    }}
                />
            </Box>
        </Box>

        {/* Team 1 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
                Team 1
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }} className="break-2">
                <Controller
                    name="team1.text"
                    control={control}
                    rules={{ required: "Team 1 name is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            onChange={handleRequiredFieldChange("team1.text", field.onChange, "Team 1 name is required")}
                            label="Team 1 Name"
                            fullWidth
                            error={!!errors.team1?.text}
                            helperText={errors.team1?.text?.message}
                        />
                    )}
                />
                <Controller
                    name="team1.color"
                    control={control}
                    rules={{ required: "Team 1 colour is required" }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.team1?.color}>
                            <InputLabel id="team1-color-label">Team 1 Colour</InputLabel>
                            <Select {...field} labelId="team1-color-label" label="Team 1 Colour">
                                {COLOUR_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.team1?.color && (
                                <Typography variant="caption" color="error">
                                    {errors.team1.color.message}
                                </Typography>
                            )}
                        </FormControl>
                    )}
                />
            </Box>
        </Box>

        {/* Team 2 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
                Team 2
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }} className="break-2">
                <Controller
                    name="team2.text"
                    control={control}
                    rules={{ required: "Team 2 name is required" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            onChange={handleRequiredFieldChange("team2.text", field.onChange, "Team 2 name is required")}
                            label="Team 2 Name"
                            fullWidth
                            error={!!errors.team2?.text}
                            helperText={errors.team2?.text?.message}
                        />
                    )}
                />
                <Controller
                    name="team2.color"
                    control={control}
                    rules={{ required: "Team 2 colour is required" }}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.team2?.color}>
                            <InputLabel id="team2-color-label">Team 2 Colour</InputLabel>
                            <Select {...field} labelId="team2-color-label" label="Team 2 Colour">
                                {COLOUR_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.team2?.color && (
                                <Typography variant="caption" color="error">
                                    {errors.team2.color.message}
                                </Typography>
                            )}
                        </FormControl>
                    )}
                />
            </Box>
        </Box>
    </Box>
);

export default StepGameAndTeamInfo;
