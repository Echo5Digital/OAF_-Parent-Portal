import {
  MEDICAL_APPOINTMENT_TYPES,
  MEDICATIONS,
  MEDICATION_DAYS,
  MEDICATION_FREQUENCIES,
  emptyMedicalAppointmentRow,
  emptyMedicationRow,
  type MedicalAppointmentRow,
  type MedicationRow,
  type WeekSummary,
} from "../data/model";
import { DocIcon, TrashIcon } from "./Icons";

type MedicalMedicationsSectionProps = {
  childName: string;
  summary: WeekSummary;
  onChange: (next: WeekSummary) => void;
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Page 9 of the real 11-page Jotform: Medical Appointments + Medications, nothing else. */
export function MedicalMedicationsSection({ childName, summary, onChange }: MedicalMedicationsSectionProps) {
  function update<K extends keyof WeekSummary>(key: K, value: WeekSummary[K]) {
    onChange({ ...summary, [key]: value });
  }

  function updateMedicationRow(index: number, patch: Partial<MedicationRow>) {
    const next = [...summary.medications];
    next[index] = { ...next[index], ...patch };
    update("medications", next);
  }

  function addMedicationRow() {
    update("medications", [...summary.medications, emptyMedicationRow()]);
  }

  function removeMedicationRow(index: number) {
    update(
      "medications",
      summary.medications.filter((_, i) => i !== index),
    );
  }

  function updateMedicalAppointmentRow(index: number, patch: Partial<MedicalAppointmentRow>) {
    const next = [...summary.medicalAppointmentRows];
    next[index] = { ...next[index], ...patch };
    update("medicalAppointmentRows", next);
  }

  function addMedicalAppointmentRow() {
    update("medicalAppointmentRows", [...summary.medicalAppointmentRows, emptyMedicalAppointmentRow()]);
  }

  function removeMedicalAppointmentRow(index: number) {
    update(
      "medicalAppointmentRows",
      summary.medicalAppointmentRows.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="card">
      <div className="form-head">
        <div className="ttl">
          <div className="ic">
            <DocIcon />
          </div>
          <div>
            <h3>Medical & Medications</h3>
            <div className="desc">Medical appointments and medications for {childName.split(" ")[0]} this week.</div>
          </div>
        </div>
      </div>

      <div className="form-body">
        <div className="ffield">
          <label>Medical Appointments</label>
          <div className="radio-row">
            <label className="radio-opt">
              <input
                type="radio"
                name="medicalAppointments"
                checked={summary.medicalAppointments === "N/A"}
                onChange={() => update("medicalAppointments", "N/A")}
              />
              N/A
            </label>
            <label className="radio-opt">
              <input
                type="radio"
                name="medicalAppointments"
                checked={summary.medicalAppointments === "Required"}
                onChange={() => update("medicalAppointments", "Required")}
              />
              Required
            </label>
          </div>
        </div>

        {summary.medicalAppointments === "Required"
          ? summary.medicalAppointmentRows.map((row, i) => (
              <div key={i} className="card nested-card">
                <div className="section-label" style={{ marginTop: 0 }}>
                  Medical Appointments
                </div>
                <div className="frow" style={{ gridTemplateColumns: "1fr 1fr 1.4fr" }}>
                  <div className="ffield">
                    <label>Dropdown</label>
                    <select
                      value={row.type}
                      onChange={(e) => updateMedicalAppointmentRow(i, { type: e.target.value as MedicalAppointmentRow["type"] })}
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {MEDICAL_APPOINTMENT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ffield">
                    <label>Calendar</label>
                    <input
                      type="text"
                      placeholder="MM-DD-YYYY"
                      value={row.date}
                      onChange={(e) => updateMedicalAppointmentRow(i, { date: e.target.value })}
                    />
                  </div>
                  <div className="ffield">
                    <label>Meds Changed</label>
                    <div className="radio-row">
                      <label className="radio-opt">
                        <input
                          type="radio"
                          name={`medsChanged-${i}`}
                          checked={row.medsChanged === "Yes-Notify Agency Immediately"}
                          onChange={() => updateMedicalAppointmentRow(i, { medsChanged: "Yes-Notify Agency Immediately" })}
                        />
                        Yes-Notify Agency Immediately
                      </label>
                      <label className="radio-opt">
                        <input
                          type="radio"
                          name={`medsChanged-${i}`}
                          checked={row.medsChanged === "No"}
                          onChange={() => updateMedicalAppointmentRow(i, { medsChanged: "No" })}
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {summary.medicalAppointmentRows.length > 1 ? (
                  <button
                    className="btn btn-ghost btn-icon-only"
                    type="button"
                    onClick={() => removeMedicalAppointmentRow(i)}
                    aria-label="Remove appointment"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </div>
            ))
          : null}

        {summary.medicalAppointments === "Required" ? (
          <button className="btn btn-ghost" type="button" onClick={addMedicalAppointmentRow} style={{ marginBottom: 16 }}>
            + Click here to add another appointment
          </button>
        ) : null}

        <div className="section-label">Medications given to the TFC child — note ALL times throughout the day that meds are dispensed</div>
        {summary.medications.map((row, i) => (
          <div key={i} className="medication-row">
            <div className="frow" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 2fr" }}>
              <div className="ffield">
                <label>Medication</label>
                <select value={row.medication} onChange={(e) => updateMedicationRow(i, { medication: e.target.value })}>
                  {MEDICATIONS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="ffield">
                <label>Dosage</label>
                <input type="text" value={row.dosage} onChange={(e) => updateMedicationRow(i, { dosage: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Frequency</label>
                <select value={row.frequency} onChange={(e) => updateMedicationRow(i, { frequency: e.target.value as MedicationRow["frequency"] })}>
                  {MEDICATION_FREQUENCIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="ffield">
                <label>Days</label>
                <div className="radio-row">
                  {MEDICATION_DAYS.map((d) => (
                    <label key={d} className="checkbox-opt">
                      <input
                        type="checkbox"
                        checked={row.days.includes(d)}
                        onChange={() => updateMedicationRow(i, { days: toggleInList(row.days, d) })}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="frow" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <div className="ffield">
                <label>Other Medication</label>
                <input type="text" value={row.otherMedication1} onChange={(e) => updateMedicationRow(i, { otherMedication1: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Dosage</label>
                <input type="text" value={row.otherDosage1} onChange={(e) => updateMedicationRow(i, { otherDosage1: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Frequency</label>
                <input type="text" value={row.otherFrequency1} onChange={(e) => updateMedicationRow(i, { otherFrequency1: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Comments</label>
                <input type="text" value={row.otherComments1} onChange={(e) => updateMedicationRow(i, { otherComments1: e.target.value })} />
              </div>
            </div>

            <div className="frow" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <div className="ffield">
                <label>Other Medication</label>
                <input type="text" value={row.otherMedication2} onChange={(e) => updateMedicationRow(i, { otherMedication2: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Dosage</label>
                <input type="text" value={row.otherDosage2} onChange={(e) => updateMedicationRow(i, { otherDosage2: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Frequency</label>
                <input type="text" value={row.otherFrequency2} onChange={(e) => updateMedicationRow(i, { otherFrequency2: e.target.value })} />
              </div>
              <div className="ffield">
                <label>Comments</label>
                <input type="text" value={row.otherComments2} onChange={(e) => updateMedicationRow(i, { otherComments2: e.target.value })} />
              </div>
            </div>

            <div className="frow" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              {(["time1", "time2", "time3", "time4"] as const).map((key, idx) => (
                <div className="ffield" key={key}>
                  <label>Time {idx + 1}</label>
                  <input type="text" placeholder="HH:MM" value={row[key]} onChange={(e) => updateMedicationRow(i, { [key]: e.target.value })} />
                </div>
              ))}
            </div>

            {summary.medications.length > 1 ? (
              <button className="btn btn-ghost btn-icon-only" type="button" onClick={() => removeMedicationRow(i)} aria-label="Remove medication row">
                <TrashIcon />
              </button>
            ) : null}

            {i < summary.medications.length - 1 ? <div className="divider" /> : null}
          </div>
        ))}

        <button className="btn btn-ghost" type="button" onClick={addMedicationRow}>
          + Add Row
        </button>
      </div>
    </div>
  );
}
