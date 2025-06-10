import React from "react";

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeUrl }) => {
  if (!qrCodeUrl) return null;

  return (
    <div className="qr-container ">
      <div className="qr-code">
        <img
          src={qrCodeUrl}
          alt="QR Code for payment"
          className="h-full w-full object-contain"
        />
      </div>
      <p className="mt-4 text-primary text-sm">Scan to complete payment</p>
    </div>
  );
};

export default QRCodeDisplay;
