// packages/desktop/src/components/Qr.tsx
import { QRCodeSVG } from "qrcode.react";

export function Qr({ value, size = 160 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-lg bg-white p-3">
      <QRCodeSVG value={value} size={size} />
    </div>
  );
}
