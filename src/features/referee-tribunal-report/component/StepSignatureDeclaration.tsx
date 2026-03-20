import React from "react";
import { Controller } from "react-hook-form";
import {
    Box,
    Typography,
    Button,
    Alert,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import SignatureCanvas from "react-signature-canvas";
import { Control, FieldErrors } from "react-hook-form";
import { FormValues } from "./types";

interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    sigCanvasRef: React.RefObject<SignatureCanvas | null>;
    clearSignature: () => void;
}

const StepSignatureDeclaration: React.FC<Props> = ({
    control,
    errors,
    sigCanvasRef,
    clearSignature,
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" gutterBottom>
            Signature &amp; Declaration
        </Typography>

        <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Signature of person making report
            </Typography>
            <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                    width: 500,
                    height: 200,
                    className: "sigCanvas",
                    style: { border: "1px solid #ccc", borderRadius: "4px" },
                }}
            />
            <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={clearSignature}
                sx={{ mt: 1 }}
            >
                Clear Signature
            </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
                <strong>Declaration:</strong> By submitting this report, you declare
                that the information provided is true and correct to the best of your
                knowledge and belief. You understand that submitting a false or
                misleading report to the Hills Raiders Basketball Association tribunal
                may result in disciplinary action against you.
            </Typography>
        </Alert>

        <Controller
            name="declarationConfirmed"
            control={control}
            rules={{
                validate: (value) =>
                    value === true ||
                    "You must confirm the declaration before submitting",
            }}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                        />
                    }
                    label="I confirm that the information in this report is true and correct to the best of my knowledge and belief."
                />
            )}
        />
        {errors.declarationConfirmed && (
            <Typography variant="caption" color="error">
                {errors.declarationConfirmed.message}
            </Typography>
        )}
    </Box>
);

export default StepSignatureDeclaration;
