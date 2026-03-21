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

const ReimbursementForm = () => {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    // Derived flag instead of manual checkbox; now driven by playersAge number input
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
            firstName: "",
            lastName: "",
            club: "",
            team: "",
            amount: '',
            reason: "",
            accountName: "",
            bsb: '',
            accountNumber: '',
            date: new Date().toISOString().split('T')[0],
            contactName: "",
            contactNumber: '', // keep as string
            contactEmail: "",
            playersAge: '',
        },
    });

    // Watch firstName and lastName to prefill contactName if needed
    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const playersAge = watch("playersAge");

    // Update isUnder18 automatically whenever playersAge changes
    useEffect(() => {
        const ageNum = Number(playersAge);
        setIsUnder18(!isNaN(ageNum) && ageNum < 18);
    }, [playersAge]);

    useEffect(() => {
        if (isUnder18) {
            // Clear contactName when switching to under-18; field becomes Parent/Guardian
            setValue("contactName", "");
        } else {
            setValue("contactName", `${firstName} ${lastName}`); // Prefill contactName with full name
        }
    }, [firstName, lastName, isUnder18, setValue]);

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
                first_name: data.firstName,
                last_name: data.lastName,
                club_name: data.club,
                team_name: data.team,
                amount: parseFloat(data.amount) || 0,
                reason: data.reason,
                account_name: data.accountName,
                // send bsb without dash if backend field is numeric, otherwise keep original
                bsb: data.bsb ? data.bsb.replace('-', '') : '',
                // IMPORTANT: keep as string so any leading zeros are preserved
                account_number: (data.accountNumber ?? '').trim(),
                signature: data.signature,
                date: toStrapiTimeFormat(data.date),
                contact_name: data.contactName,
                // Keep phone/contact number as string to preserve leading 0 (common in AU numbers)
                contact_number: (data.contactNumber ?? '').trim(),
                contact_email: data.contactEmail,
                players_age: parseInt(data.playersAge, 10) || 0,
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

                <h1>Refund Form</h1>
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
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    {/* First Name Field */}
                    <Controller
                        name="firstName"
                        control={control}
                        rules={{
                            required: "First name is required",
                            validate: (value) =>
                                (value?.trim().length ?? 0) > 0 ||
                                "First name cannot be blank",
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="First Name"
                                fullWidth
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                            />
                        )}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        rules={{
                            required: "Last name is required",
                            validate: (value) =>
                                (value?.trim().length ?? 0) > 0 ||
                                "Last name cannot be blank",
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Last Name"
                                fullWidth
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                            />
                        )}
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                    {/* Players Age Number Field (replaces under-18 checkbox) */}
                    <Controller
                        name="playersAge"
                        control={control}
                        rules={{
                            required: "Players age is required",
                            validate: (value: string) => {
                                if (value === undefined || value === null || value === '') return "Players age is required";
                                if (!/^\d+$/.test(value)) return "Age must be a whole number";
                                const n = Number(value);
                                if (n < 1) return "Age must be at least 1";
                                if (n > 120) return "Age must be realistic";
                                return true;
                            }
                        }}
                        render={({ field: { onChange, value, ...rest } }) => (
                            <TextField
                                {...rest}
                                value={value}
                                label="Players Age"
                                type="text"
                                fullWidth
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/[^0-9]/g, '');
                                    onChange(digits);
                                }}
                                error={!!errors.playersAge}
                                helperText={errors.playersAge?.message}
                            />
                        )}
                    />
                    {/* Conditional Contact Fields */}
                    {isUnder18 ? (
                        <React.Fragment key="under18">
                            <Controller
                                name="contactName"
                                control={control}
                                rules={{ required: "Parent/Guardian name is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Parent/Guardian Name"
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
                                    required: "Parent/Guardian phone number is required",
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Parent/Guardian phone number must be numeric",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Parent/Guardian Phone Number"
                                        fullWidth
                                        type="text"
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        error={!!errors.contactNumber}
                                        helperText={errors.contactNumber?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="contactEmail"
                                control={control}
                                rules={{
                                    required: "Parent/Guardian email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Parent/Guardian Email"
                                        fullWidth
                                        type="email"
                                        error={!!errors.contactEmail}
                                        helperText={errors.contactEmail?.message}
                                    />
                                )}
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment key="notUnder18">
                            {/* Do not render contactName at all when not under 18 */}
                            <Controller
                                name="contactNumber"
                                control={control}
                                rules={{
                                    required: "Players phone number is required",
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "Players phone number must be numeric",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Players Phone Number"
                                        fullWidth
                                        type="text"
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        error={!!errors.contactNumber}
                                        helperText={errors.contactNumber?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="contactEmail"
                                control={control}
                                rules={{
                                    required: "Players email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email address",
                                    },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Players Email"
                                        fullWidth
                                        type="email"
                                        error={!!errors.contactEmail}
                                        helperText={errors.contactEmail?.message}
                                    />
                                )}
                            />
                        </React.Fragment>
                    )}

                    <Divider colorClass="primary" />
                    {/* Amount Field */}
                    <Controller
                        name="amount"
                        control={control}
                        rules={{
                            required: "Amount is required",
                            validate: (value: string) => {
                                if (value === undefined || value === null || value === '') return "Amount is required";
                                // Allow digits with optional decimal (0-4 decimal places). Accept trailing dot while typing.
                                if (!/^\d+(\.(\d{0,4})?)?$/.test(value)) return "Amount must be numeric (up to 4 decimals)";
                                // Reject just '.' or '0.' style zero values when parsing finishes
                                if (value === '.' || /^0*\.0*$/.test(value)) return "Amount must be greater than 0";
                                if (parseFloat(value) <= 0) return "Amount must be greater than 0";
                                return true;
                            }
                        }}
                        render={({ field: { onChange, value, ...rest } }) => (
                            <TextField
                                {...rest}
                                value={value}
                                label="Amount"
                                type="text"
                                fullWidth
                                // pattern removed to allow decimal point on mobile keyboards
                                inputProps={{ inputMode: 'decimal', maxLength: 12 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">$
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={(e) => {
                                    // Allow only digits and a single decimal point, strip others
                                    let v = e.target.value.replace(/[^0-9.]/g, '');
                                    const firstDot = v.indexOf('.');
                                    if (firstDot !== -1) {
                                        // remove any additional dots
                                        v = v.substring(0, firstDot + 1) + v.substring(firstDot + 1).replace(/\./g, '');
                                    }
                                    // limit to 4 decimal places if present (currency-like precision but extended)
                                    v = v.replace(/(\.[0-9]{4}).*/, '$1');
                                    onChange(v);
                                }}
                                error={!!errors.amount}
                                helperText={errors.amount?.message || "Refund is only for HRBA registration fee; BWA or Club fees handled elsewhere."}
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
                                helperText={errors.accountName?.message || "Name of your bank account - ie John Smith"}
                            />
                        )}
                    />

                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
                        <Controller
                            name="bsb"
                            control={control}
                            rules={{
                                required: "BSB is required",
                                pattern: {
                                    value: /^\d{3}-\d{3}$/,
                                    message: "BSB must be in the format 123-456",
                                },
                            }}
                            render={({ field: { onChange, value, ...rest } }) => (
                                <TextField
                                    {...rest}
                                    value={value}
                                    label="BSB"
                                    type="text"
                                    fullWidth
                                    inputProps={{ pattern: "\\d{3}-\\d{3}", placeholder: "123-456", maxLength: 7 }}
                                    error={!!errors.bsb}
                                    helperText={errors.bsb?.message || "Format: 123-456"}
                                    onChange={e => {
                                        let v = e.target.value.replace(/[^0-9]/g, "");
                                        if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3, 6);
                                        if (v.length > 7) v = v.slice(0, 7);
                                        onChange(v);
                                    }}
                                />
                            )}
                        />

                        {/* Account Number Field */}
                        <Controller
                            name="accountNumber"
                            control={control}
                            rules={{
                                required: "Account number is required",
                                pattern: {
                                    value: /^[0-9]{4,12}$/,
                                    message: "Account number must be 4-12 digits",
                                },
                            }}
                            render={({ field: { onChange, value, ...rest } }) => (
                                <TextField
                                    {...rest}
                                    value={value}
                                    label="Account Number"
                                    type="text"
                                    fullWidth
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber?.message || ""}
                                    onChange={(e) => {
                                        // Strip non-digits but keep leading zeros by not converting to number
                                        const digits = e.target.value.replace(/[^0-9]/g, '');
                                        onChange(digits);
                                    }}
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

        </div >
    );
};

export default ReimbursementForm;