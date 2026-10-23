import React from "react";

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" />
      <p style={{ marginTop: "16px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;
