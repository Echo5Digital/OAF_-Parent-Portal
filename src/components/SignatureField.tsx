import { SignaturePad } from "./SignaturePad";

type SignatureFieldProps = {
  label: string;
  signerName: string;
  /** Base64 PNG data URL of the drawn signature, or "" if unsigned. */
  signature: string;
  date: string;
  onSign: (signature: string, date: string) => void;
  required?: boolean;
};

function todayStamp(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${today.getFullYear()}`;
}

/** Shared draw-to-sign pad + read-only signed date, used for parent and therapist signatures across the daily log and the week-level pages. */
export function SignatureField({ label, signature, date, onSign, required = true }: SignatureFieldProps) {
  function handlePadChange(dataUrl: string) {
    onSign(dataUrl, dataUrl ? date || todayStamp() : "");
  }

  return (
    <div className="frow" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="ffield">
        <label>
          {label} {required ? <span className="star">*</span> : null}
        </label>
        <SignaturePad value={signature} onChange={handlePadChange} />
      </div>
      <div className="ffield">
        <label>
          Signature Date {required ? <span className="star">*</span> : null}
        </label>
        <input type="text" className="mono" readOnly value={date} style={{ background: "var(--surface-sunken)" }} />
      </div>
    </div>
  );
}
