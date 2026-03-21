import React, { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    InputAdornment
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import Divider from "../../components/divider";

import SignatureCanvas from 'react-signature-canvas';
import Spinner from '../../components/spinner'


interface PIDJuniorsProps {
    gardianFullName: string;
    playerName: string;
    dateOfBirth: string;
    gardianSignature: string;
    date: string;
}

const PIDJuniors = () => {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const sigCanvasRef = useRef < SignatureCanvas > (null);
    // Derived flag instead of manual checkbox; now driven by playersAge number input
    const [showSpinner, setShowSpinner] = useState < boolean > (false);

    useEffect(() => {
        if (sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d")?.scale(ratio, ratio);
        }
    }, []);

    const clearSignature = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear(); // Clear the canvas
        }
    };

    const saveSignatureToFormData = () => {
        if (sigCanvasRef.current) {
            const signatureDataUrl = sigCanvasRef.current.toDataURL();
            return signatureDataUrl;
        }
        return null;
    };

    const { handleSubmit, control, reset, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {

        },
    });

    function toStrapiTimeFormat(time24: string): string {
        if (!time24) return "";
        return `${time24}:00.000`;
    }

    const onSubmit = async (data: any) => {
        setShowSpinner(true);

        try {
            // Ensure an account is available
            const signatureDataUrl = saveSignatureToFormData();
            if (signatureDataUrl) {
                data.signature = signatureDataUrl;
            }

            // Transform data to match Strapi schema
            const strapiData = {
                player_name: data.playerName,
                date_of_birth: data.dateOfBirth,
                gardian_full_name: data.gardianFullName,
                signature: data.signature,

                date: toStrapiTimeFormat(data.date),
            };

            const isProduction = process.env.NODE_ENV === "production";

            const response = await axios.post(
                `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/pid-juniors`, // Update this endpoint as needed
                { data: strapiData },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log("Form data sent to Strapi successfully.");
                enqueueSnackbar("Form submission successful", {
                    variant: "success",
                    style: { right: "20px" },
                });
                setShowSpinner(false);;
            } else {
                console.error("Failed to send data to Strapi.", response.data);
                enqueueSnackbar("Failed to submit form", {
                    variant: "warning",
                });
                setShowSpinner(false);;
            }
            handleReset();
        } catch (error) {
            console.error("Error submitting form:", error);
            setShowSpinner(false);;
        }
    };

    const handleReset = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear(); // Clear the signature canvas
        }
        reset(); // Reset the form
    };

    return (
        <div className="panel">
            <Spinner loading={showSpinner} />
            <div className="panel-heading">

                <h1>Casual Casual Wavier</h1>
                <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={handleReset} // Reset the form
                >
                    Reset
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Player Name Field */}
                    <Controller
                        name="playerName"
                        control={control}
                        rules={{ required: "Player name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Player Name"
                                fullWidth
                                error={!!errors.playerName}
                                helperText={errors.playerName?.message}
                            />
                        )}
                    />

                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
                        {/* Date Field */}
                        <Controller
                            name="date"
                            control={control}
                            rules={{ required: "Date is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    error={!!errors.date}
                                    helperText={errors.date?.message}
                                />
                            )}
                        />
                    </Box>
                    {/* Signature Field */}
                    <Box>
                        <h4>Signature</h4>
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
                </Box>
                <div className="panel-footer">
                    {/* Submit Button */}
                    <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate("/")} // Reset the formq
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </div>
            </form>

        </div>
    );
};

export default ReimbursementForm;