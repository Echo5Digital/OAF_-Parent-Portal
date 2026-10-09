import { CHILDREN, type ChildWeek } from "../data/model";
import { PlusIcon } from "./Icons";

type ChildRailProps = {
  store: Record<string, ChildWeek>;
  currentChild: string;
  onSelect: (childId: string) => void;
  onAddChild: () => void;
};

export function ChildRail({ store, currentChild, onSelect, onAddChild }: ChildRailProps) {
  return (
    <div className="child-rail">
      {CHILDREN.map((c) => {
        const days = store[c.id].days;
        const complete = days.filter((d) => d.status === "complete").length;
        return (
          <div
            key={c.id}
            className={`child-chip${c.id === currentChild ? " active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <img className="pic" src={c.photo} alt={c.name} />
            <div className="meta">
              <span className="cname">{c.name}</span>
              <span className="cstat">
                <span className="pct">
                  {complete}/{days.length}
                </span>{" "}
                days logged
              </span>
            </div>
          </div>
        );
      })}
      <button className="add-child-chip" onClick={onAddChild} type="button">
        <PlusIcon size={14} /> Add Child
      </button>
    </div>
  );
}
