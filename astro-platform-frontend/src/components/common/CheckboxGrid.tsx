type Item = {
  name: string;
  assigned?: boolean;
};

type Props = {
  items: Item[];
  selected: string[];
  onToggle: (value: string) => void;
  disabled?: (item: string) => boolean;
};

export default function CheckboxGrid({
  items,
  selected,
  onToggle,
  disabled,
}: Props) {
  return (
    <div className="row">
      {items.map((item) => {
        const isChecked = selected.includes(item.name);

        return (
          <div key={item.name} className="col-md-4 mb-2">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={item.name}
                checked={isChecked}
                disabled={disabled?.(item.name)}
                onChange={() => onToggle(item.name)}
              />
              <label
                className="form-check-label"
                htmlFor={item.name}
              >
                {item.name}
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
