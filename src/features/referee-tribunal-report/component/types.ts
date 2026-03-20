import { Control, FieldErrors } from "react-hook-form";

export type FormValues = {
    name: string;
    supervisor: string;
    coOfficial: string;
    team1: { text: string; color: string };
    team2: { text: string; color: string };
    date: string;
    time: string;
    venue: string;
    court: string;
    reportedPersonsName: string;
    reportedPersonsNumber: string;
    reportedPersonsTeam: string;
    allegations: string[];
    summaryprior: string;
    summary: string;
    summaryafter: string;
    witness: string;
    staffWatching: boolean;
    declarationConfirmed: boolean;
    signature?: string | null;
};

export type FormFieldPath =
    | "name"
    | "coOfficial"
    | "supervisor"
    | "team1.text"
    | "team1.color"
    | "team2.text"
    | "team2.color"
    | "date"
    | "time"
    | "venue"
    | "court"
    | "reportedPersonsName"
    | "reportedPersonsNumber"
    | "reportedPersonsTeam"
    | "allegations"
    | "summaryprior"
    | "summary"
    | "summaryafter"
    | "witness"
    | "staffWatching"
    | "declarationConfirmed";

export type HandleRequiredFieldChange = (
    fieldName: FormFieldPath,
    fieldOnChange: (value: any) => void,
    requiredMessage: string
) => (eventOrValue: any) => void;

export interface StepProps {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    handleRequiredFieldChange: HandleRequiredFieldChange;
}
