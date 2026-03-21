import React, { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";

import SignatureCanvas from 'react-signature-canvas';
import Spinner from '../../components/spinner'


interface UniformExeptionFormProps {
    season: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    registeredTeam: string;
    competitionAgeGroup: string;
    contactNumber: string;
    exemptionReason: string;
    signature: string;
    dateLodged: string
    club: string;
}

const UniformExeptionForm = () => {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [accessAllowed, setAccessAllowed] = useState<boolean>(false);
    const [accessChecked, setAccessChecked] = useState<boolean>(false);
    const [clubName, setClubName] = useState<string>("");
    const isProduction = process.env.NODE_ENV === "production";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) {
            setAccessAllowed(false);
            setAccessChecked(true);
            return;
        }
        const url = `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/club-referral-links?filters[token][$eq]=${token}`;
        axios.get(url)
            .then(res => {
                if (res.data && res.data.data && res.data.data.length > 0) {
                    const clubObj = res.data.data[0];
                    if (clubObj.club_name) {
                        setAccessAllowed(true);
                        setClubName(clubObj.club_name);
                    } else {
                        setAccessAllowed(false);
                        console.warn("Club object missing club_name field.", clubObj);
                    }
                } else {
                    setAccessAllowed(false);
                    console.warn("No valid club found for token.");
                }
                setAccessChecked(true);
            })
            .catch((err) => {
                setAccessAllowed(false);
                setAccessChecked(true);
                console.error("Error validating token:", err);
            });
    }, [isProduction]);

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

    const { handleSubmit, control, reset, formState: { errors } } = useForm<UniformExeptionFormProps>({
        defaultValues: {
            season: "",
            fullName: "",
            gender: "",
            dateOfBirth: "",
            registeredTeam: "",
            competitionAgeGroup: "",
            exemptionReason: "",
            signature: "",
            dateLodged: new Date().toISOString().split('T')[0],
            contactNumber: "",
            club: clubName,
        },
    });


    function toStrapiTimeFormat(time24: string): string {
        if (!time24) return "";
        return `${time24}:00.000`;
    }

    const onSubmit = async (data: UniformExeptionFormProps) => {
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
                season: data.season,
                full_name: data.fullName,
                gender: data.gender,
                date_of_birth: toStrapiTimeFormat(data.dateOfBirth),
                registered_team: data.registeredTeam,
                competition_age_group: data.competitionAgeGroup,
                exemption_reason: data.exemptionReason,
                signature: data.signature,
                date_lodged: toStrapiTimeFormat(data.dateLodged),
                contact_number: parseInt(data.contactNumber) || 0,
                club: clubName,
            };



            const response = await axios.post(
                `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/uniform-exemption-forms`, // Update this endpoint as needed
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

    if (!accessChecked) {
        return <Spinner loading={true} />;
    }
    if (!accessAllowed) {
        return (
            <div className="panel">
                <div className="panel-heading">
                    <h1>Access Denied</h1>
                </div>
                <Box sx={{ p: 2 }}>
                    <p>This page is restricted. Please use a valid club link to access the form.</p>
                    <Button variant="contained" color="primary" onClick={() => navigate("/")}>Go Home</Button>
                </Box>
            </div>
        );
    }
    return (
        <div className="panel">
            <Spinner loading={showSpinner} />
            <div className="panel-heading">
                <div> <h1>Uniform Exemption Form</h1>
                    {clubName && <h4>Club: {clubName}</h4>}</div>

                <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={handleReset}
                    style={{ marginTop: "32px" }}
                >
                    Reset
                </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                {/* ...existing code... */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Season Field */}
                    <Controller
                        name="season"
                        control={control}
                        rules={{ required: "Season is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Season"
                                fullWidth
                                error={!!errors.season}
                                helperText={errors.season?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="fullName"
                        control={control}
                        rules={{ required: "Full name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Full Name"
                                fullWidth
                                error={!!errors.fullName}
                                helperText={errors.fullName?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="gender"
                        control={control}
                        rules={{ required: "Gender is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                label="Gender"
                                fullWidth
                                error={!!errors.gender}
                                helperText={errors.gender?.message}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="i_dont_know">I don't know</option>
                                <option value="i_dont_want_to_specify">I don't want to specify</option>
                            </TextField>
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="dateOfBirth"
                        control={control}
                        rules={{ required: "Date of birth is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date of Birth"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.dateOfBirth}
                                helperText={errors.dateOfBirth?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="registeredTeam"
                        control={control}
                        rules={{ required: "Registered team is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Registered Team"
                                fullWidth
                                error={!!errors.registeredTeam}
                                helperText={errors.registeredTeam?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="competitionAgeGroup"
                        control={control}
                        rules={{ required: "Competition age group is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Competition Age Group"
                                fullWidth
                                error={!!errors.competitionAgeGroup}
                                helperText={errors.competitionAgeGroup?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
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
                                type="text"
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                error={!!errors.contactNumber}
                                helperText={errors.contactNumber?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="exemptionReason"
                        control={control}
                        rules={{ required: "Exemption reason is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Exemption Reason"
                                minRows={4}
                                fullWidth
                                multiline
                                error={!!errors.exemptionReason}
                                helperText={errors.exemptionReason?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
                    <Controller
                        name="dateLodged"
                        control={control}
                        rules={{ required: "Date lodged is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date Lodged"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.dateLodged}
                                helperText={errors.dateLodged?.message}
                            />
                        )}
                    />
                    {/* ...existing code... */}
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
                    <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate("/")}
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

export default UniformExeptionForm;