import React from "react";
import { Controller } from "react-hook-form";
import { TextField, Box, Typography } from "@mui/material";
import { StepProps } from "./types";

const StepReporterDetails: React.FC<StepProps> = ({
    control,
    errors,
    handleRequiredFieldChange,
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" gutterBottom>
            Reporter Details
        </Typography>

        <Controller
            name="name"
            control={control}
            rules={{ required: "Name of reporter is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "name",
                        field.onChange,
                        "Name of reporter is required"
                    )}
                    label="Name of Reporter"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
            )}
        />

        <Controller
            name="coOfficial"
            control={control}
            rules={{ required: "Name of co-official is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "coOfficial",
                        field.onChange,
                        "Name of co-official is required"
                    )}
                    label="Name of Co-Official"
                    fullWidth
                    error={!!errors.coOfficial}
                    helperText={errors.coOfficial?.message}
                />
            )}
        />

        <Controller
            name="supervisor"
            control={control}
            rules={{ required: "Name of supervisor is required" }}
            render={({ field }) => (
                <TextField
                    {...field}
                    onChange={handleRequiredFieldChange(
                        "supervisor",
                        field.onChange,
                        "Name of supervisor is required"
                    )}
                    label="Name of Supervisor"
                    fullWidth
                    error={!!errors.supervisor}
                    helperText={errors.supervisor?.message}
                />
            )}
        />
    </Box>
);

export default StepReporterDetails;
