import React from "react";

const BwaRefundForm = () => {
    return (
        <>
            <div>
                <h1>BWA Refund Form</h1>
                <p>
                    Please download and fill out the form below to request a refund from the Basketball WA (BWA).
                    Ensure all fields are completed accurately to avoid delays in processing your request.
                </p>
                <p>
                    Once you have filled out the form, please submit it via email to <a href="mailto:accounts@hillsraiders.com.ai">accounts@hillsraiders.com.au</a> or return it to the Hills Raiders Basketball Association office.
                </p>
            </div>
            <div style={{ height: "100vh", width: "100%", marginTop: "40px" }}>
                <iframe
                    src="/assets/documents/BWA Refund Form.pdf"
                    title="BWA Refund Form PDF"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            </div>
        </>
    );
};

export default BwaRefundForm;