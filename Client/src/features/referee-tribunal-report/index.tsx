import React, { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Box,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Alert
} from "@mui/material";

import { useMsal } from "@azure/msal-react"; // Import MSAL hook
import axios from "axios"; // Use axios for API calls
import { loginRequest } from "../../authConfig"; // Import your MSAL login request config

import Snackbar, { SnackbarCloseReason, SnackbarOrigin } from '@mui/material/Snackbar';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from "jspdf";

interface State extends SnackbarOrigin {
    open: boolean;
}

interface RefereeTribunalReportForm {
    name: string;
    coOfficial: string;
    team1: {
        text: string;
        color: string;
    };
    team2: {
        text: string;
        color: string;
    };
    date: string;
    time: string;
    venue: string;
    personOnReport: string;
    allegations: string[];
    summary: string;
    personsNotified: boolean;
}

const RefereeTribunalReport = () => {

    const navigate = useNavigate();
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [state, setState] = React.useState<State>({
        open: false,
        vertical: 'top',
        horizontal: 'center',
    });
    const { vertical, horizontal, open } = state;
    const { instance, accounts } = useMsal(); // MSAL instance and accounts

    useEffect(() => {
        if (sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d")?.scale(ratio, ratio);
        }
    }, []);

    const handleClick = (newState: SnackbarOrigin) => () => {
        setState({ ...newState, open: true });
    };

    const handleClose = () => {
        setState({ ...state, open: false });
    };



    const clearSignature = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear(); // Clear the canvas
        }
    };

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            coOfficial: "",
            team1: {
                text: "",
                color: "red", // Default color
            },
            team2: {
                text: "",
                color: "blue", // Default color
            },
            date: "",
            time: "",
            venue: "",
            personOnReport: "",
            allegations: [] as string[],
            summary: "",
            personsNotified: false,
        },
    });

    const onSubmit = async (data: any) => {
        try {
            // Generate PDF
            const doc = new jsPDF();
            doc.text("Referee Tribunal Report", 10, 10);
            doc.text(`Name: ${data.name}`, 10, 20);
            doc.text(`Co-Official: ${data.coOfficial}`, 10, 30);
            doc.text(`Team 1: ${data.team1.text} (${data.team1.color})`, 10, 40);
            doc.text(`Team 2: ${data.team2.text} (${data.team2.color})`, 10, 50);
            doc.text(`Date: ${data.date}`, 10, 60);
            doc.text(`Time: ${data.time}`, 10, 70);
            doc.text(`Venue: ${data.venue}`, 10, 80);
            doc.text(`Person on Report: ${data.personOnReport}`, 10, 90);
            doc.text("Allegations:", 10, 100);
            data.allegations.forEach((allegation: string, index: number) => {
                doc.text(`- ${allegation}`, 15, 110 + index * 10);
            });
            doc.text("Summary of Facts:", 10, 130);
            doc.text(data.summary, 10, 140, { maxWidth: 180 });

            // Save PDF to a Blob
            const pdfBlob = doc.output("blob");

            // Create a download link for the PDF
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Referee_Tribunal_Report.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("PDF downloaded successfully.");
            handleClick({ vertical: 'bottom', horizontal: 'right' })(); // Show success snackbar
            clearSignature();
            reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            setState({
                open: true,
                vertical: 'bottom',
                horizontal: 'right',
            }); // Show error snackbar
        }
    };

    const handleReset = () => {
        reset(); // Reset the form
        clearSignature(); // Clear the signature canvas
    };

    return (
        <div className="panel">
            <div className="panel-heading">

                <h1>Referee Tribunal Report</h1>
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
                    {/* Name Field */}
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Name of reporter"
                                fullWidth
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        )}
                    />

                    {/* Co-official Field */}
                    <Controller
                        name="coOfficial"
                        control={control}
                        rules={{ required: "Co-official name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Name of co-official"
                                fullWidth
                                error={!!errors.coOfficial}
                                helperText={errors.coOfficial?.message}
                            />
                        )}
                    />

                    {/* Team 1 */}
                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
                        <Controller
                            name="team1.text"
                            control={control}
                            rules={{ required: "Team 1 name is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Team 1"
                                    error={!!errors.team1?.text}
                                    helperText={errors.team1?.text?.message}
                                />
                            )}
                        />
                        <Controller
                            name="team1.color"
                            control={control}
                            rules={{ required: "Team 1 color is required" }}
                            render={({ field }) => (
                                <FormControl error={!!errors.team1?.color}>
                                    <InputLabel id="team1-color-label">Team 1 Colour</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="team1-color-label"
                                        label="Team 1 Colour"
                                    >
                                        <MenuItem value="red">Red</MenuItem>
                                        <MenuItem value="blue">Blue</MenuItem>
                                        <MenuItem value="green">Green</MenuItem>
                                        <MenuItem value="yellow">Yellow</MenuItem>
                                        <MenuItem value="orange">Orange</MenuItem>
                                        <MenuItem value="purple">Purple</MenuItem>
                                        <MenuItem value="pink">Pink</MenuItem>
                                        <MenuItem value="brown">Brown</MenuItem>
                                        <MenuItem value="black">Black</MenuItem>
                                    </Select>
                                    {errors.team1?.color && (
                                        <p style={{ color: "red" }}>{errors.team1.color.message}</p>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Box>

                    {/* Team 2 */}
                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
                        <Controller
                            name="team2.text"
                            control={control}
                            rules={{ required: "Team 2 name is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Team 2"
                                    error={!!errors.team2?.text}
                                    helperText={errors.team2?.text?.message}
                                />
                            )}
                        />
                        <Controller
                            name="team2.color"
                            control={control}
                            rules={{ required: "Team 2 color is required" }}
                            render={({ field }) => (
                                <FormControl error={!!errors.team2?.color}>
                                    <InputLabel id="team2-color-label">Team 2 Colour</InputLabel>
                                    <Select
                                        {...field}
                                        labelId="team2-color-label"
                                        label="Team 2 Colour"
                                    >
                                        <MenuItem value="red">Red</MenuItem>
                                        <MenuItem value="blue">Blue</MenuItem>
                                        <MenuItem value="green">Green</MenuItem>
                                        <MenuItem value="yellow">Yellow</MenuItem>
                                        <MenuItem value="orange">Orange</MenuItem>
                                        <MenuItem value="purple">Purple</MenuItem>
                                        <MenuItem value="pink">Pink</MenuItem>
                                        <MenuItem value="brown">Brown</MenuItem>
                                        <MenuItem value="black">Black</MenuItem>
                                    </Select>
                                    {errors.team2?.color && (
                                        <p style={{ color: "red" }}>{errors.team2.color.message}</p>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Box>

                    {/* Date and Time */}
                    <Box sx={{ display: "flex", gap: 2, }} className="break-2">
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
                                    label="Time"
                                    type="time"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.time}
                                    helperText={errors.time?.message}
                                />
                            )}
                        />
                    </Box>

                    {/* Venue */}
                    <Controller
                        name="venue"
                        control={control}
                        rules={{ required: "Venue is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Venue"
                                fullWidth
                                error={!!errors.venue}
                                helperText={errors.venue?.message}
                            />
                        )}
                    />

                    {/* Person on Report */}
                    <Controller
                        name="personOnReport"
                        control={control}
                        rules={{ required: "Person on report is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Name/Number of Person on Report"
                                fullWidth
                                error={!!errors.personOnReport}
                                helperText={errors.personOnReport?.message}
                            />
                        )}
                    />

                    {/* Allegations */}
                    <FormControl component="fieldset" error={!!errors.allegations}>
                        <h4>Check the appropriate item(s)</h4>
                        <FormGroup>
                            {[
                                "Disputed decisions of officials or breached code of conduct.",
                                "Used abusive, threatening, obscene language or gestures.",
                                "Acted in an unsportsmanlike manner in or around the stadium, including damage to property.",
                                "Attempted to trip, strike, push, elbow or kick player/official.",
                                "Tripped, punched, slapped, pushed, elbowed, kicked or spat at a player/official.",
                                "Participated in basketball activities whilst suspended.",
                                "Engaged in conduct likely to bring the game into disrepute.",
                                "Deliberately did an act endangering safety/health of players/spectators/officials.",
                            ].map((allegation, index) => (
                                <Controller
                                    key={index}
                                    name="allegations"
                                    control={control}
                                    rules={{ required: "At least one allegation must be selected" }}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    {...field}
                                                    value={allegation}
                                                    checked={field.value?.includes(allegation)}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const checked = e.target.checked;
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
                            <p style={{ color: "red" }}>{errors.allegations.message}</p>
                        )}
                    </FormControl>

                    {/* Summary of Facts */}
                    <Controller
                        name="summary"
                        control={control}
                        rules={{ required: "Summary is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Summary of the Facts"
                                multiline
                                minRows={6}
                                fullWidth
                                error={!!errors.summary}
                                helperText={errors.summary?.message}
                            />
                        )}
                    />

                    {/* Checkbox for Persons Notified */}
                    <Controller
                        name="personsNotified"
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
                                label="Persons notified/not notified of this report"
                            />
                        )}
                    />


                    {/* Signature Field */}
                    <Box>
                        <h4>Signature of person making report</h4>
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
                </Box>
            </form>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                autoHideDuration={6000}
                open={open}
                onClose={handleClose}
                key={vertical + horizontal}
            >
                <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
                    Form submitted successfully!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default RefereeTribunalReport;