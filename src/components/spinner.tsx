import { useState, CSSProperties, useEffect } from "react";
import { SyncLoader } from "react-spinners";

const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

type SpinnerProps = {
    loading?: boolean;
    color?: string;
};

function Spinner({ loading = false, color = "#ffffff" }: SpinnerProps) {
    useEffect(() => {
        if (loading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [loading]);

    return (
        loading ? (
            <div
                className="sweet-loading"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(255,255,255,0.75)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <SyncLoader
                    color={"var(--primary-color)"}
                    loading={loading}
                    size={16}
                    aria-label="Loading Spinner"
                    data-testid="SyncLoader"
                />
            </div>
        ) : null
    );
}

export default Spinner;