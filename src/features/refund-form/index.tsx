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


interface ReimbursementFormProps {
    playerName: string;
    club: string;
    team: string;
    amount: number;
    reason: string;
    accountName: string;
    bsb: number;
    accountNumber: number;
    date: "",
    signature: string;
}

const ReimbursementForm = () => {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [isUnder18, setIsUnder18] = useState(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

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
            playerName: "",
            club: "",
            team: "",
            amount: 0,
            reason: "",
            accountName: "",
            bsb: 0,
            accountNumber: 0,
            date: new Date().toISOString().split('T')[0],
            contactName: "",
            contactNumber: '',
            contactEmail: "",
        },
    });

    // Watch playerName to prefill contactName if needed
    const playerName = watch("playerName");

    useEffect(() => {
        if (!isUnder18) {
            setValue("contactName", playerName); // Prefill contactName with playerName
        }
    }, [playerName, isUnder18, setValue]);

    function toStrapiTimeFormat(time24: string): string {
        if (!time24) return "";
        return `${time24}:00.000`;
    }

    const onSubmit = async (data: any) => {
        // If not under 18, ensure contactName is set to playerName
        // TODO: Show spinner here if needed
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
                club_name: data.club,
                team_name: data.team,
                amount: data.amount,
                reason: data.reason,
                account_name: data.accountName,
                bsb: data.bsb,
                account_number: data.accountNumber,
                signature: data.signature,
                date: toStrapiTimeFormat(data.date),
                contact_name: data.contactName,
                contact_number: data.contactNumber,
                contact_email: data.contactEmail,
            };

            const isProduction = process.env.NODE_ENV === "production";


            const response = await axios.post(
                `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/reimbursement-forms`, // Update this endpoint as needed
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

                <h1>Reimbursement Form</h1>
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

                    {/* Club Field */}
                    <Controller
                        name="club"
                        control={control}
                        rules={{ required: "Club name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Club Name"
                                fullWidth
                                error={!!errors.club}
                                helperText={errors.club?.message}
                            />
                        )}
                    />

                    {/* Team Field */}
                    <Controller
                        name="team"
                        control={control}
                        rules={{ required: "Team name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Team Name"
                                fullWidth
                                error={!!errors.team}
                                helperText={errors.team?.message}
                            />
                        )}
                    />
                    {/* Is Under 18 Checkbox */}
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <input
                            type="checkbox"
                            id="isUnder18"
                            checked={isUnder18}
                            onChange={e => setIsUnder18(e.target.checked)}
                            style={{ marginRight: 8 }}
                        />
                        <label htmlFor="isUnder18">Is the player under the age of 18?</label>
                    </Box>
                    {/* Conditional Contact Fields */}
                    {isUnder18 ? (
                        <>
                            <Controller
                                name="contactName"
                                control={control}
                                rules={{ required: "Contact name is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Name"
                                        fullWidth
                                        error={!!errors.contactName}
                                        helperText={errors.contactName?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="contactNumber"
                                control={control}
                                rules={{
                                    required: "Contact number is required",
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Contact number must be numeric",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Number"
                                        fullWidth
                                        type="number"
                                        error={!!errors.contactNumber}
                                        helperText={errors.contactNumber?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="contactEmail"
                                control={control}
                                rules={{
                                    required: "Contact email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Email"
                                        fullWidth
                                        type="email"
                                        error={!!errors.contactEmail}
                                        helperText={errors.contactEmail?.message}
                                    />
                                )}
                            />
                        </>
                    ) : (
                        <>
                            <Controller
                                name="contactNumber"
                                control={control}
                                rules={{
                                    required: "Number is required",
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Contact number must be numeric",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Number"
                                        fullWidth
                                        type="number"
                                        error={!!errors.contactNumber}
                                        helperText={errors.contactNumber?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="contactEmail"
                                control={control}
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        fullWidth
                                        type="email"
                                        error={!!errors.contactEmail}
                                        helperText={errors.contactEmail?.message}
                                    />
                                )}
                            />
                        </>
                    )}

                    <Divider colorClass="primary" />
                    {/* Amount Field */}
                    <Controller
                        name="amount"
                        control={control}
                        rules={{ required: "Amount is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Amount"
                                type="number"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">$
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                            />
                        )}
                    />

                    {/* Reason Field */}
                    <Controller
                        name="reason"
                        control={control}
                        rules={{ required: "Reason is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Reason"
                                minRows={4}
                                fullWidth
                                multiline
                                error={!!errors.reason}
                                helperText={errors.reason?.message}
                            />
                        )}
                    />

                    <Divider colorClass="primary" />
                    {/* Account Name Field */}
                    <Controller
                        name="accountName"
                        control={control}
                        rules={{ required: "Account name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Account Name"
                                fullWidth
                                error={!!errors.accountName}
                                helperText={errors.accountName?.message}
                            />
                        )}
                    />

                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
                        <Controller
                            name="bsb"
                            control={control}
                            rules={{ required: "BSB is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="BSB"
                                    type="number"
                                    fullWidth
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                    error={!!errors.bsb}
                                    helperText={errors.bsb?.message}
                                />
                            )}
                        />

                        {/* Account Number Field */}
                        <Controller
                            name="accountNumber"
                            control={control}
                            rules={{ required: "Account number is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Account Number"
                                    type="number"
                                    fullWidth
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber?.message}
                                />
                            )}
                        />
                    </Box>

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