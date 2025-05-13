import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeContextProvider } from "./context/themeContext";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { SnackbarProvider } from "notistack";
import Grow from "./components/grow";

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<React.StrictMode>
		<MsalProvider instance={msalInstance}>
			<BrowserRouter>
				<ThemeContextProvider>
					<SnackbarProvider maxSnack={3} TransitionComponent={Grow}>
						<App />
					</SnackbarProvider>
				</ThemeContextProvider>
			</BrowserRouter>
		</MsalProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
