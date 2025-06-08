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
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import Spinner from "../../components/spinner"; // Adjust the import based on your project structure

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
	const { enqueueSnackbar } = useSnackbar();
	const [showSpinner, setShowSpinner] = React.useState<boolean>(false);

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

	const today = new Date().toISOString().slice(0, 10);
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
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
			date: today,
			time: currentTime,
			venue: "",
			personOnReport: "",
			allegations: [] as string[],
			summary: "",
			personsNotified: false,
		},
	});

	// Helper to convert 24-hour time ("HH:mm") to "HH:mm:00.000" for Strapi
	function toStrapiTimeFormat(time24: string): string {
		if (!time24) return "";
		return `${time24}:00.000`;
	}

	const onSubmit = async (data: any) => {
		setShowSpinner(true);
		try {
			const signatureDataUrl = saveSignatureToFormData();
			if (signatureDataUrl) {
				data.signature = signatureDataUrl;
			}

			// Transform data to match Strapi schema
			const strapiData = {
				name: data.name,
				co_official: data.coOfficial,
				team_1_name: data.team1.text,
				team_1_colour:
					data.team1.color.charAt(0).toUpperCase() +
					data.team1.color.slice(1),
				team_2_name: data.team2.text,
				team_2_colour:
					data.team2.color.charAt(0).toUpperCase() +
					data.team2.color.slice(1),
				date: data.date,
				time: toStrapiTimeFormat(data.time),
				venue: data.venue,
				person_on_report: data.personOnReport,
				summary: data.summary,
				person_notified: data.personsNotified,
				signature: data.signature,
				allegations: data.allegations,
			};

			const isProduction = process.env.NODE_ENV === "production";
			const apiUrl = isProduction
				? process.env.REACT_APP_API_URL
				: "http://localhost:1337";

			const response = await axios.post(
				`${apiUrl}/api/tribunal-report-forms`,
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
				setShowSpinner(false);
				handleReset();

			} else {
				console.error("Failed to send data to Strapi.", response.data);
				enqueueSnackbar("Failed to submit form", {
					variant: "warning",
				});
				setShowSpinner(false);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			enqueueSnackbar("Failed to submit form", {
				variant: "warning",
				style: { float: "right" },
			});
			setShowSpinner(false);
		}
	};

	const handleReset = () => {
		reset(); // Reset the form
		clearSignature(); // Clear the signature canvas
	};

	return (
		<div className="panel">
			<Spinner loading={showSpinner} />
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
					<Box sx={{ display: "flex", gap: 2 }} className="break-2">
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
									<InputLabel id="team1-color-label">
										Team 1 Colour
									</InputLabel>
									<Select
										{...field}
										labelId="team1-color-label"
										label="Team 1 Colour"
									>
										<MenuItem value="red">Red</MenuItem>
										<MenuItem value="blue">Blue</MenuItem>
										<MenuItem value="green">Green</MenuItem>
										<MenuItem value="yellow">
											Yellow
										</MenuItem>
										<MenuItem value="orange">
											Orange
										</MenuItem>
										<MenuItem value="purple">
											Purple
										</MenuItem>
										<MenuItem value="pink">Pink</MenuItem>
										<MenuItem value="brown">Brown</MenuItem>
										<MenuItem value="black">Black</MenuItem>
									</Select>
									{errors.team1?.color && (
										<p style={{ color: "red" }}>
											{errors.team1.color.message}
										</p>
									)}
								</FormControl>
							)}
						/>
					</Box>

					{/* Team 2 */}
					<Box sx={{ display: "flex", gap: 2 }} className="break-2">
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
									<InputLabel id="team2-color-label">
										Team 2 Colour
									</InputLabel>
									<Select
										{...field}
										labelId="team2-color-label"
										label="Team 2 Colour"
									>
										<MenuItem value="red">Red</MenuItem>
										<MenuItem value="blue">Blue</MenuItem>
										<MenuItem value="green">Green</MenuItem>
										<MenuItem value="yellow">
											Yellow
										</MenuItem>
										<MenuItem value="orange">
											Orange
										</MenuItem>
										<MenuItem value="purple">
											Purple
										</MenuItem>
										<MenuItem value="pink">Pink</MenuItem>
										<MenuItem value="brown">Brown</MenuItem>
										<MenuItem value="black">Black</MenuItem>
									</Select>
									{errors.team2?.color && (
										<p style={{ color: "red" }}>
											{errors.team2.color.message}
										</p>
									)}
								</FormControl>
							)}
						/>
					</Box>

					{/* Date and Time */}
					<Box sx={{ display: "flex", gap: 2 }} className="break-2">
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
					<FormControl
						component="fieldset"
						error={!!errors.allegations}
					>
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
									rules={{
										required:
											"At least one allegation must be selected",
									}}
									render={({ field }) => (
										<FormControlLabel
											control={
												<Checkbox
													{...field}
													value={allegation}
													checked={field.value?.includes(
														allegation
													)}
													onChange={(e) => {
														const value =
															e.target.value;
														const checked =
															e.target.checked;
														field.onChange(
															checked
																? [
																	...(field.value ||
																		[]),
																	value,
																]
																: field.value.filter(
																	(
																		v: string
																	) =>
																		v !==
																		value
																)
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
							<p style={{ color: "red" }}>
								{errors.allegations.message}
							</p>
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
										onChange={(e) =>
											field.onChange(e.target.checked)
										}
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
								style: {
									border: "1px solid #ccc",
									borderRadius: "4px",
								},
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
						<Button
							type="submit"
							variant="contained"
							color="primary"
						>
							Submit
						</Button>
					</div>
				</Box>
			</form>
		</div>
	);
};

export default RefereeTribunalReport;
