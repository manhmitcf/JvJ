import { Trash2 } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./shared";
import { SelectField, TextField } from "./TreatmentFormFields";

export function SlotFormDialog({ image, onCreate }: { image: string; onCreate: () => void }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-botanical-border bg-white shadow-stitch-soft">
      <img src={image} alt="Quản lý lịch làm việc" className="h-48 w-full object-cover" />
      <div className="p-lg">
        <h2 className="text-xl font-black text-ink-primary">Thêm khung giờ</h2>
        <div className="mt-md space-y-md">
          <SelectField label="Ngày" value="Thứ 4, 03/06" />
          <div className="grid grid-cols-2 gap-sm">
            <TextField label="Bắt đầu" value="08:00" />
            <TextField label="Kết thúc" value="09:00" />
          </div>
          <SelectField label="Trạng thái" value="Khả dụng" />
        </div>
        <div className="mt-lg flex gap-sm">
          <PrimaryButton onClick={onCreate}>Lưu</PrimaryButton>
          <SecondaryButton><Trash2 className="h-4 w-4" /> Xóa</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
