import React, { useRef, useEffect, useState } from "react";
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
	Stepper,
	Step,
	StepLabel,
	Typography,
	Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import Spinner from "../../components/spinner";

const STEPS = [
	"Introduction",
	"Reporter Details",
	"Team Information",
	"Incident Details",
	"Signature & Declaration",
];

const ALLEGATION_OPTIONS = [
	"Disputed decisions of officials or breached code of conduct.",
	"Used abusive, threatening, obscene language or gestures.",
	"Acted in an unsportsmanlike manner in or around the stadium, including damage to property.",
	"Attempted to trip, strike, push, elbow or kick player/official.",
	"Tripped, punched, slapped, pushed, elbowed, kicked or spat at a player/official.",
	"Participated in basketball activities whilst suspended.",
	"Engaged in conduct likely to bring the game into disrepute.",
	"Deliberately did an act endangering safety/health of players/spectators/officials.",
];

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

const RefereeTribunalReport = () => {
	const navigate = useNavigate();
	const sigCanvasRef = useRef<SignatureCanvas>(null);
	const { enqueueSnackbar } = useSnackbar();
	const [showSpinner, setShowSpinner] = useState<boolean>(false);
	const [activeStep, setActiveStep] = useState(0);

	const today = new Date().toISOString().slice(0, 10);
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

	// Track whether the user clicked "Submit & Duplicate" vs plain "Submit"
	const isDuplicateRef = useRef(false);

	const {
		handleSubmit,
		control,
		reset,
		trigger,
		getValues,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: "",
			coOfficial: "",
			team1: {
				text: "",
				color: "red",
			},
			team2: {
				text: "",
				color: "blue",
			},
			date: today,
			time: currentTime,
			venue: "",
			personOnReport: "",
			allegations: [] as string[],
			summary: "",
			personsNotified: false,
			declarationConfirmed: false,
		},
	});

	useEffect(() => {
		if (activeStep === 4 && sigCanvasRef.current) {
			const canvas = sigCanvasRef.current.getCanvas();
			const ratio = Math.max(window.devicePixelRatio || 1, 1);
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d")?.scale(ratio, ratio);
		}
	}, [activeStep]);

	const clearSignature = () => {
		if (sigCanvasRef.current) {
			sigCanvasRef.current.clear();
		}
	};

	const saveSignatureToFormData = () => {
		if (sigCanvasRef.current) {
			return sigCanvasRef.current.toDataURL();
		}
		return null;
	};

	type FormFieldPath =
		| "name"
		| "coOfficial"
		| "team1.text"
		| "team1.color"
		| "team2.text"
		| "team2.color"
		| "date"
		| "time"
		| "venue"
		| "personOnReport"
		| "allegations"
		| "summary"
		| "declarationConfirmed";

	const stepFields: Record<number, FormFieldPath[]> = {
		1: ["name", "coOfficial"],
		2: ["team1.text", "team1.color", "team2.text", "team2.color"],
		3: ["date", "time", "venue", "personOnReport", "allegations", "summary"],
		4: ["declarationConfirmed"],
	};

	const handleNext = async () => {
		const fields = stepFields[activeStep];
		if (fields) {
			const valid = await trigger(fields);
			if (!valid) return;
		}
		setActiveStep((prev) => prev + 1);
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

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
				if (isDuplicateRef.current) {
					isDuplicateRef.current = false;
					handleDuplicate();
				} else {
					handleReset();
				}
			} else {
				console.error("Failed to send data to Strapi.", response.data);
				isDuplicateRef.current = false;
				enqueueSnackbar("Failed to submit form", {
					variant: "warning",
				});
				setShowSpinner(false);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			isDuplicateRef.current = false;
			enqueueSnackbar("Failed to submit form", {
				variant: "warning",
				style: { float: "right" },
			});
			setShowSpinner(false);
		}
	};

	const handleReset = () => {
		reset();
		clearSignature();
		setActiveStep(0);
	};

	/**
	 * After a successful "Submit & Duplicate", keep all form values except
	 * clear the person-on-report field and the signature/declaration so the
	 * user can immediately fill in the next person's name and re-sign.
	 */
	const handleDuplicate = () => {
		const current = getValues();
		reset({
			...current,
			personOnReport: "",
			declarationConfirmed: false,
		});
		clearSignature();
		// Stepper is 0-indexed: index 3 = "Incident Details" (the 4th step),
		// which contains the personOnReport field the user needs to change.
		setActiveStep(3);
	};

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<Typography variant="h5" gutterBottom>
							About This Form
						</Typography>
						<Typography variant="body1">
							This form is used by referees to report incidents that occur during
							Hills Raiders Basketball Association games. It is a formal record of
							any conduct that may require review by the tribunal.
						</Typography>
						<Typography variant="body1">
							Please complete all sections accurately and honestly. The information
							you provide will be used by the tribunal to assess the incident and
							determine any appropriate action.
						</Typography>
						<Alert severity="info">
							<Typography variant="body2">
								<strong>Before you begin, please ensure you have the following information ready:</strong>
							</Typography>
							<ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
								<li>Full names of both teams involved</li>
								<li>Date, time, and venue of the incident</li>
								<li>Name and/or number of the person on report</li>
								<li>A clear summary of the facts</li>
							</ul>
						</Alert>
						<Typography variant="body2" color="text.secondary">
							This report will be submitted to the Hills Raiders Basketball
							Association tribunal for review. Submitting a false or misleading
							report may result in disciplinary action against the reporter.
						</Typography>
					</Box>
				);

			case 1:
				return (
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
									label="Name of Co-Official"
									fullWidth
									error={!!errors.coOfficial}
									helperText={errors.coOfficial?.message}
								/>
							)}
						/>
					</Box>
				);

			case 2:
				return (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
						<Typography variant="h6" gutterBottom>
							Team Information
						</Typography>
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
											<InputLabel id="team1-color-label">
												Team 1 Colour
											</InputLabel>
											<Select
												{...field}
												labelId="team1-color-label"
												label="Team 1 Colour"
											>
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
											<InputLabel id="team2-color-label">
												Team 2 Colour
											</InputLabel>
											<Select
												{...field}
												labelId="team2-color-label"
												label="Team 2 Colour"
											>
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

			case 3:
				return (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<Typography variant="h6" gutterBottom>
							Incident Details
						</Typography>

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
										label="Time"
										type="time"
										fullWidth
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
							rules={{ required: "Name/number of person on report is required" }}
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
							<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
								Check the appropriate item(s)
							</Typography>
							<FormGroup>
								{ALLEGATION_OPTIONS.map((allegation, index) => (
									<Controller
										key={index}
										name="allegations"
										control={control}
										rules={{
											validate: (value) =>
												(value && value.length > 0) ||
												"At least one allegation must be selected",
										}}
										render={({ field }) => (
											<FormControlLabel
												control={
													<Checkbox
														value={allegation}
														checked={field.value?.includes(allegation)}
														onChange={(e) => {
															const value = e.target.value;
															const checked = e.target.checked;
															field.onChange(
																checked
																	? [...(field.value || []), value]
																	: field.value.filter(
																		(v: string) => v !== value
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
								<Typography variant="caption" color="error">
									{errors.allegations.message}
								</Typography>
							)}
						</FormControl>

						{/* Summary of Facts */}
						<Controller
							name="summary"
							control={control}
							rules={{ required: "Summary of facts is required" }}
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

						{/* Persons Notified */}
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
					</Box>
				);

			case 4:
				return (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<Typography variant="h6" gutterBottom>
							Signature &amp; Declaration
						</Typography>

						{/* Signature */}
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

						{/* Declaration */}
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
											onChange={(e) =>
												field.onChange(e.target.checked)
											}
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

			default:
				return null;
		}
	};

	const isLastStep = activeStep === STEPS.length - 1;

	return (
		<div className="panel">
			<Spinner loading={showSpinner} />
			<div className="panel-heading">
				<h1>Referee Tribunal Report</h1>
				<Button
					type="button"
					variant="contained"
					color="error"
					onClick={handleReset}
				>
					Reset
				</Button>
			</div>

			<Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }} alternativeLabel>
				{STEPS.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>

			<form onSubmit={handleSubmit(onSubmit)} className="form-container">
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{renderStepContent()}

					<div className="panel-footer" style={{ marginTop: "16px" }}>
						<Button
							type="button"
							variant="outlined"
							color="primary"
							onClick={activeStep === 0 ? () => navigate("/") : handleBack}
						>
							{activeStep === 0 ? "Cancel" : "Previous"}
						</Button>

						{isLastStep ? (
							<Box sx={{ display: "flex", gap: 1 }}>
								<Button
									type="submit"
									variant="outlined"
									color="primary"
								>
									Submit
								</Button>
								<Button
									type="submit"
									variant="contained"
									color="primary"
									onClick={() => { isDuplicateRef.current = true; }}
								>
									Submit &amp; Duplicate
								</Button>
							</Box>
						) : (
							<Button
								type="button"
								variant="contained"
								color="primary"
								onClick={handleNext}
							>
								Next
							</Button>
						)}
					</div>
				</Box>
			</form>
		</div>
	);
};

export default RefereeTribunalReport;
