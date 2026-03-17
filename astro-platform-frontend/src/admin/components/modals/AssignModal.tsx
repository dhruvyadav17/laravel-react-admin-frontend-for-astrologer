import CrudModal from "../../../components/common/CrudModal";
import CheckboxGrid from "../../../components/common/CheckboxGrid";
import { useAssignLogic } from "../../hooks/useAssignLogic";
import { execute } from "../../../utils/feedback";

type Props = {
  mode: "user-role" | "user-permission" | "role-permission";
  entity: any;
  onClose: () => void;
};

export default function AssignModal({
  mode,
  entity,
  onClose,
}: Props) {
  const {
    items,
    selected,
    toggle,
    submit,
    title,
  } = useAssignLogic(mode, entity);

  const handleSave = async () => {
    await execute(() => submit(), {
      defaultMessage: "Assignment updated successfully",
    });
    onClose();
  };

  return (
    <CrudModal
      title={title}
      onSave={handleSave}
      onClose={onClose}
    >
      <CheckboxGrid
        items={items}
        selected={selected}
        onToggle={toggle}
      />
    </CrudModal>
  );
}
