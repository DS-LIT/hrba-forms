import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useSnackbar } from "notistack";
import axios from "axios";
import Spinner from '../../components/spinner';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface AgeGroupExemptionFormProps {
    club_name: string;
    season: string;
    full_name: string;
    gender: string;
    date_of_birth: string;
    registered_age_group: string;
    requested_age_group: string;
    requested_team_name: string;
    exemption_reason: string;
    supporting_documentation?: File[];
}

const AgeGroupExemptionForm = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [clubName, setClubName] = useState<string>("");
    const [accessAllowed, setAccessAllowed] = useState<boolean>(false);
    const [accessChecked, setAccessChecked] = useState<boolean>(false);
    const [wablChecked, setWablChecked] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
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
                    }
                } else {
                    setAccessAllowed(false);
                }
                setAccessChecked(true);
            })
            .catch(() => {
                setAccessAllowed(false);
                setAccessChecked(true);
            });
    }, []);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string>("");
    const { handleSubmit, control, reset, formState: { errors } } = useForm<AgeGroupExemptionFormProps>({
        defaultValues: {
            club_name: clubName,
            season: "",
            full_name: "",
            gender: "",
            date_of_birth: "",
            registered_age_group: "",
            requested_age_group: "",
            requested_team_name: "",
            exemption_reason: "",
            supporting_documentation: [],
        },
    });

    useEffect(() => {
        if (clubName) {
            reset((values) => ({ ...values, club_name: clubName }));
        }
    }, [clubName, reset]);

    const onSubmit = async (data: AgeGroupExemptionFormProps) => {
        setShowSpinner(true);
        try {
            let uploadedFiles = [];
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => {
                    formData.append('files', file);
                });
                // Upload files to Strapi /upload endpoint
                const uploadRes = await axios.post(
                    `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                if (uploadRes.data && Array.isArray(uploadRes.data)) {
                    uploadedFiles = uploadRes.data.map((file: any) => file.id);
                }
            }
            const payload = {
                ...data,
                supporting_documentation: uploadedFiles.length > 0 ? uploadedFiles : undefined,
            };
            const response = await axios.post(
                `${isProduction ? process.env.REACT_APP_API_URL : 'http://localhost:1337'}/api/age-group-exemptions`,
                { data: payload },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 200 || response.status === 201) {
                enqueueSnackbar("Form submission successful", { variant: "success" });
                reset();
                setSelectedFiles([]);
            } else {
                enqueueSnackbar("Failed to submit form", { variant: "warning" });
            }
        } catch (error) {
            enqueueSnackbar("Error submitting form", { variant: "error" });
        }
        setShowSpinner(false);
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
            <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
                <DialogTitle sx={{ bgcolor: '#fff3cd', color: '#856404' }}>Caution</DialogTitle>
                <DialogContent sx={{ bgcolor: '#fff3cd', color: '#856404', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span role="img" aria-label="warning" style={{ fontSize: 24 }}>⚠️</span>
                        This player is <b>not eligible</b> for an exemption.
                    </Box>
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#fff3cd' }}>
                    <Button onClick={() => setShowWarning(false)} color="warning" variant="contained">OK</Button>
                </DialogActions>
            </Dialog>
            <div className="panel-heading">
                <div>
                    <h1>Age Group Exemption Form</h1>
                    {clubName && <h4>Club: {clubName}</h4>}
                </div>
                <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={() => reset()}
                    style={{ marginTop: "32px" }}
                >
                    Reset
                </Button>
            </div>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={wablChecked}
                        onChange={(e) => {
                            setWablChecked(e.target.checked);
                            if (e.target.checked) {
                                setShowWarning(true);
                            }
                        }}
                        color="warning"
                    />
                }
                label="Has the player participated in WABL in the last 12 months or development?"
                sx={{ mb: 2, bgcolor: wablChecked ? '#fff3cd' : undefined, borderRadius: 1, px: 1 }}
            />
            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Controller
                        name="season"
                        control={control}
                        rules={{ required: "Season is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Season/Year"
                                fullWidth
                                error={!!errors.season}
                                helperText={errors.season?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
                    <Controller
                        name="full_name"
                        control={control}
                        rules={{ required: "Full name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Full Name"
                                fullWidth
                                error={!!errors.full_name}
                                helperText={errors.full_name?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
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
                                disabled={wablChecked}
                            >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="i don't know">I don't know</MenuItem>
                                <MenuItem value="i don't want to specify">I don't want to specify</MenuItem>
                            </TextField>
                        )}
                    />
                    <Controller
                        name="date_of_birth"
                        control={control}
                        rules={{ required: "Date of birth is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date of Birth"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.date_of_birth}
                                helperText={errors.date_of_birth?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
                    <Controller
                        name="registered_age_group"
                        control={control}
                        rules={{ required: "Registered age group is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Registered Age Group"
                                fullWidth
                                error={!!errors.registered_age_group}
                                helperText={errors.registered_age_group?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
                    <Controller
                        name="requested_age_group"
                        control={control}
                        rules={{ required: "Requested age group is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Requested Age Group"
                                fullWidth
                                error={!!errors.requested_age_group}
                                helperText={errors.requested_age_group?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
                    <Controller
                        name="requested_team_name"
                        control={control}
                        rules={{ required: "Requested team name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Team the player is requesting to play in"
                                fullWidth
                                error={!!errors.requested_team_name}
                                helperText={errors.requested_team_name?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />
                    <Controller
                        name="exemption_reason"
                        control={control}
                        rules={{ required: "Exemption reason is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Reason for exemption request"
                                minRows={4}
                                fullWidth
                                multiline
                                error={!!errors.exemption_reason}
                                helperText={errors.exemption_reason?.message}
                                disabled={wablChecked}
                            />
                        )}
                    />

                    <p>
                        Supporting documentation is required for exemptions to play down an age grade. <br />
                        Documentation can include a medical certificate, letter from a GP or medical specialist, school principal / teacher. A letter from the parent/Guardian may be considered.
                    </p>

                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
                        <b>Upload Supporting Documentation (PNG, JPG, PDF, Word docs, max 5 files):</b>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            disabled={wablChecked || selectedFiles.length >= 5}
                            sx={{ mt: 1, width: 'fit-content' }}
                        >
                            Upload files
                            <VisuallyHiddenInput
                                type="file"
                                multiple
                                accept="image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                disabled={wablChecked}
                                onChange={e => {
                                    setFileError("");
                                    if (e.target.files) {
                                        let newFiles = Array.from(e.target.files);
                                        const allowedTypes = [
                                            "image/png",
                                            "image/jpeg",
                                            "application/pdf",
                                            "application/msword",
                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        ];
                                        newFiles = newFiles.filter(f => allowedTypes.includes(f.type));
                                        if (newFiles.length !== e.target.files.length) {
                                            setFileError("Only PNG, JPG PDF, and Word documents are allowed.");
                                        }
                                        // Avoid duplicates by name and size
                                        const allFiles = [...selectedFiles, ...newFiles].filter((file, idx, arr) =>
                                            arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
                                        );
                                        if (allFiles.length > 5) {
                                            setFileError("You can only upload up to 5 files.");
                                        }
                                        setSelectedFiles(allFiles.slice(0, 5));
                                    }
                                }}
                            />
                        </Button>
                        {fileError && (
                            <Box sx={{ color: 'error.main', mt: 1 }}>{fileError}</Box>
                        )}
                        {selectedFiles.length > 0 && (
                            <List dense sx={{ mt: 1 }}>
                                {selectedFiles.map((file, idx) => (
                                    <ListItem key={idx}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => {
                                                setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
                                            }} disabled={wablChecked}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={file.name} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
                <div className="panel-footer">
                    <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate("/")}
                        disabled={wablChecked}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={wablChecked}>
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AgeGroupExemptionForm;
