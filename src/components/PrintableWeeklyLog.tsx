import { DAY_NAMES, type Child, type ChildWeek } from "../data/model";
import { DailyLogForm } from "./DailyLogForm";
import { RecreationVisitationSection } from "./RecreationVisitationSection";
import { MedicalMedicationsSection } from "./MedicalMedicationsSection";
import { IlsFireDrillSection } from "./IlsFireDrillSection";
import { AllowanceSubstanceSignatureSection } from "./AllowanceSubstanceSignatureSection";

type PrintableWeeklyLogProps = {
  child: Child;
  week: ChildWeek;
};

const noop = () => {};

/**
 * Renders all 11 pages of a child's weekly log stacked vertically, for the
 * "Print" action on Page 11 (confirmed from screenshots to open a real
 * multi-page print/PDF dialog, not a stub — 2026-10-13). Only visible via
 * `@media print` (see .print-only / .no-print in base.css); on-screen this
 * sits off-screen so it never affects normal layout. Reuses the existing
 * page components in read-only-ish mode (onChange handlers are no-ops; this
 * view is for printing, not editing) rather than duplicating their markup.
 */
export function PrintableWeeklyLog({ child, week }: PrintableWeeklyLogProps) {
  return (
    <div className="print-only printable-weekly-log">
      {DAY_NAMES.map((_, i) => (
        <div className="print-page" key={i}>
          <DailyLogForm child={child} dayIndex={i} entry={week.days[i]} onChange={noop} onComplete={noop} />
        </div>
      ))}
      <div className="print-page">
        <RecreationVisitationSection childName={child.name} summary={week.weekSummary} onChange={noop} onBack={noop} onNext={noop} />
      </div>
      <div className="print-page">
        <MedicalMedicationsSection childName={child.name} summary={week.weekSummary} onChange={noop} onBack={noop} onNext={noop} />
      </div>
      <div className="print-page">
        <IlsFireDrillSection childName={child.name} summary={week.weekSummary} onChange={noop} onBack={noop} onNext={noop} />
      </div>
      <div className="print-page">
        <AllowanceSubstanceSignatureSection childName={child.name} summary={week.weekSummary} onChange={noop} onBack={noop} onSubmit={noop} />
      </div>
    </div>
  );
}
