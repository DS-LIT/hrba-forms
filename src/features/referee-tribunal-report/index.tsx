import React, { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
	Button,
	Box,
	Stepper,
	Step,
	StepLabel,
} from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import Spinner from "../../components/spinner";
import StepIntroduction from "./component/StepIntroduction";
import StepReporterDetails from "./component/StepReporterDetails";
import StepGameAndTeamInfo from "./component/StepGameAndTeamInfo";
import StepIncidentDetails from "./component/StepIncidentDetails";
import StepSignatureDeclaration from "./component/StepSignatureDeclaration";
import { FormValues, FormFieldPath } from "./component/types";

const STEPS = [
	"Introduction",
	"Reporter Details",
	"Game & Team Information",
	"Incident Details",
	"Signature & Declaration",
];

const VENUE_HISTORY_KEY = "refereeTribunalVenueHistory";

const RefereeTribunalReport = () => {
	const navigate = useNavigate();
	const sigCanvasRef = useRef<SignatureCanvas>(null);
	const { enqueueSnackbar } = useSnackbar();
	const [showSpinner, setShowSpinner] = useState<boolean>(false);
	const [activeStep, setActiveStep] = useState<number>(0);
	const [venueOptions, setVenueOptions] = useState<string[]>([]);

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
		watch,
		clearErrors,
		setError,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			name: "",
			supervisor: "",
			coOfficial: "",
			team1: { text: "", color: "red" },
			team2: { text: "", color: "blue" },
			date: today,
			time: currentTime,
			venue: "",
			court: "",
			reportedPersonsName: "",
			reportedPersonsNumber: "",
			reportedPersonsTeam: "",
			allegations: [],
			summaryprior: "",
			summary: "",
			summaryafter: "",
			witness: "",
			staffWatching: false,
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


	// Warn user if they try to leave the page with unsaved form data
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			const isDirty = Object.values(getValues()).some((value) => {
				if (Array.isArray(value)) return value.length > 0;
				if (typeof value === "string") return value.trim().length > 0;
				if (typeof value === "boolean") return value === true;
				if (typeof value === "object" && value !== null) {
					return Object.values(value).some((v) =>
						typeof v === "string" ? v.trim().length > 0 : v
					);
				}
				return false;
			});

			if (isDirty && activeStep > 0) {
				e.preventDefault();
				e.returnValue = "";
				return "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [getValues, activeStep]);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(VENUE_HISTORY_KEY);
			if (!saved) return;
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed)) {
				setVenueOptions(parsed.filter((v) => typeof v === "string"));
			} else if (typeof parsed === "string" && parsed.trim()) {
				setVenueOptions([parsed.trim()]);
			}
		} catch (err) {
			console.warn("Unable to load venue history", err);
		}
	}, []);

	const saveVenueToHistory = (venue: string) => {
		const trimmedVenue = venue.trim();
		if (!trimmedVenue) return;

		setVenueOptions((prev) => {
			const deduped = prev.filter(
				(v) => v.toLowerCase() !== trimmedVenue.toLowerCase()
			);
			const next = [trimmedVenue, ...deduped].slice(0, 10);
			localStorage.setItem(VENUE_HISTORY_KEY, JSON.stringify(next));
			return next;
		});
	};

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

	const stepFields: Record<number, FormFieldPath[]> = {
		1: ["name", "coOfficial", "supervisor"],
		2: [
			"team1.text",
			"team1.color",
			"team2.text",
			"team2.color",
			"date",
			"time",
			"venue",
			"court",
		],
		3: [
			"reportedPersonsName",
			"reportedPersonsNumber",
			"reportedPersonsTeam",
			"allegations",
			"summaryprior",
			"summary",
			"summaryafter",
		],
		4: ["declarationConfirmed"],
	};

	const handleRequiredFieldChange = (
		fieldName: FormFieldPath,
		fieldOnChange: (value: any) => void,
		requiredMessage: string
	) => {
		return (eventOrValue: any) => {
			fieldOnChange(eventOrValue);

			const rawValue =
				typeof eventOrValue === "string"
					? eventOrValue
					: eventOrValue?.target?.value;
			const hasValue =
				typeof rawValue === "string"
					? rawValue.trim().length > 0
					: Boolean(rawValue);

			if (hasValue) {
				clearErrors(fieldName);
			} else {
				setError(fieldName, {
					type: "required",
					message: requiredMessage,
				});
			}
		};
	};

	const team1Text = watch("team1.text");
	const team2Text = watch("team2.text");
	const reportedPersonTeamOptions = [team1Text, team2Text]
		.map((teamName) => teamName?.trim())
		.filter(
			(teamName, index, allTeamNames): teamName is string =>
				Boolean(teamName) && allTeamNames.indexOf(teamName) === index
		);


	const handleNext = async () => {
		const fields = stepFields[activeStep] ?? [];
		if (fields.length > 0) {
			const valid = await trigger(fields);
			if (!valid) return;
		}
		setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Only validate the current step (step 4) before submitting
		const fields = stepFields[activeStep] ?? [];
		if (fields.length > 0) {
			const valid = await trigger(fields);
			if (!valid) return;
		}
		// If validation passes, submit the form
		handleSubmit(onSubmit)(e);
	};

	const handleBack = () => {
		setActiveStep((prev) => Math.max(prev - 1, 0));
	};

	function toStrapiTimeFormat(time24: string): string {
		if (!time24) return "";
		return `${time24}:00.000`;
	}

	const onSubmit = async (data: FormValues) => {
		setShowSpinner(true);
		try {
			const signatureDataUrl = saveSignatureToFormData();

			const strapiData = {
				name: data.name,
				coOfficial: data.coOfficial,
				supervisor: data.supervisor,
				team1: data.team1,
				team2: data.team2,
				date: data.date,
				time: toStrapiTimeFormat(data.time),
				venue: data.venue,
				court: data.court,
				reportedPersonsName: data.reportedPersonsName,
				reportedPersonsNumber: data.reportedPersonsNumber,
				reportedPersonsTeam: data.reportedPersonsTeam,
				summaryprior: data.summaryprior,
				summary: data.summary,
				summaryafter: data.summaryafter,
				witness: data.witness,
				staffWatching: data.staffWatching,
				allegations: data.allegations,
				signature: signatureDataUrl,
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
				saveVenueToHistory(data.venue);
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
			const serverErrorMessage = axios.isAxiosError(error)
				? error.response?.data?.error?.message ??
				error.response?.data?.message ??
				`Request failed with status code ${error.response?.status ?? "unknown"}`
				: "Unknown error";
			console.error("Error submitting form:", {
				message: serverErrorMessage,
				response: axios.isAxiosError(error) ? error.response?.data : undefined,
				error,
			});
			isDuplicateRef.current = false;
			enqueueSnackbar(`Failed to submit form: ${serverErrorMessage}`, {
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
			reportedPersonsName: "",
			reportedPersonsNumber: "",
			reportedPersonsTeam: "",
			declarationConfirmed: false,
		});
		clearSignature();
		setActiveStep(3);
	};

	const stepProps = { control, errors, handleRequiredFieldChange };

	const renderStepContent = () => {
		switch (activeStep) {
			case 0: return <StepIntroduction />;
			case 1: return <StepReporterDetails {...stepProps} />;
			case 2: return <StepGameAndTeamInfo {...stepProps} venueOptions={venueOptions} />;
			case 3: return <StepIncidentDetails {...stepProps} reportedPersonTeamOptions={reportedPersonTeamOptions} />;
			case 4: return <StepSignatureDeclaration control={control} errors={errors} sigCanvasRef={sigCanvasRef} clearSignature={clearSignature} />;
			default: return null;
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

			<form onSubmit={handleFormSubmit} className="form-container">
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{renderStepContent()}

					<div className="panel-footer" style={{ marginTop: "16px" }}>
						<Button
							type="button"
							variant="outlined"
							color="primary"
							onClick={() => {
								if (activeStep === 0) {
									navigate("/");
								} else {
									handleBack();
								}
							}}
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
