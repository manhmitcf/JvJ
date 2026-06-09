import { ArrowLeft, CheckCircle2, Info, Upload, XCircle } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerWellnessPanelImage from "@/assets/auth/register-wellness-panel.webp";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore, type AuthUser } from "./auth-store";
import { registerCustomer, registerTherapist, type TherapistRegistrationData } from "./registration-service";
import {
  validateBio,
  validateCertificates,
  validateCitizenId,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
  validateRequiredConfirmation,
  validateRequiredFile,
  validateServiceAreas,
  validateSpecialties,
  validateUsername,
  validateYearsOfExperience,
} from "./validation";

type AccountType = "customer" | "therapist";
type TherapistStep = "account" | "profile";

type RegistrationFormData = {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  yearsOfExperience: string;
  specialties: string[];
  citizenId: string;
  bio: string;
  serviceAreas: string[];
  hasTransport: boolean;
  hasEquipment: boolean;
};

type FormErrors = Partial<Record<keyof RegistrationFormData | "portrait" | "citizenIdFront" | "citizenIdBack" | "certificates", string>>;

const benefits = [
  "Đặt lịch trị liệu tại nhà dễ dàng",
  "Theo dõi lịch hẹn và lịch sử chăm sóc",
  "Kết nối với kỹ thuật viên đã được thẩm định",
  "Quy trình minh bạch, an toàn",
];

const daNangServiceAreas = ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Cẩm Lệ", "Liên Chiểu", "Hòa Vang"];

const therapistSpecialties = [
  "Cổ và gáy",
  "Vật lý trị liệu",
  "Phục hồi chức năng",
  "Ấn huyệt",
  "Đông y",
];

const initialFormData: RegistrationFormData = {
  fullName: "",
  phone: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  yearsOfExperience: "",
  specialties: [],
  citizenId: "",
  bio: "",
  serviceAreas: [],
  hasTransport: false,
  hasEquipment: false,
};

export function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [therapistStep, setTherapistStep] = useState<TherapistStep>("account");
  const [formData, setFormData] = useState(initialFormData);
  const [certificates, setCertificates] = useState<FileList | null>(null);
  const [portrait, setPortrait] = useState<File | null>(null);
  const [citizenIdFront, setCitizenIdFront] = useState<File | null>(null);
  const [citizenIdBack, setCitizenIdBack] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  function handleAccountTypeChange(nextType: AccountType) {
    setAccountType(nextType);
    setTherapistStep("account");
    setError(null);
    setFieldErrors({});
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError(null);
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: checked }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError(null);
  }

  function handleServiceAreaChange(area: string) {
    setFormData((current) => {
      const serviceAreas = current.serviceAreas.includes(area)
        ? current.serviceAreas.filter((item) => item !== area)
        : [...current.serviceAreas, area];

      return { ...current, serviceAreas };
    });
    setFieldErrors((current) => ({ ...current, serviceAreas: undefined }));
    setError(null);
  }

  function handleSpecialtyChange(specialty: string) {
    setFormData((current) => {
      const specialties = current.specialties.includes(specialty)
        ? current.specialties.filter((item) => item !== specialty)
        : [...current.specialties, specialty];

      return { ...current, specialties };
    });
    setFieldErrors((current) => ({ ...current, specialties: undefined }));
    setError(null);
  }

  function handleCertificatesChange(event: ChangeEvent<HTMLInputElement>) {
    setCertificates(event.target.files);
    setFieldErrors((current) => ({ ...current, certificates: undefined }));
    setError(null);
  }

  function handleSingleFileChange(field: "portrait" | "citizenIdFront" | "citizenIdBack", file: File | null) {
    if (field === "portrait") setPortrait(file);
    if (field === "citizenIdFront") setCitizenIdFront(file);
    if (field === "citizenIdBack") setCitizenIdBack(file);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  }

  function validateAccountFields() {
    const errors: FormErrors = {};
    const fullName = validateFullName(formData.fullName);
    const phone = validatePhone(formData.phone);
    const email = validateEmail(formData.email);
    const username = validateUsername(formData.username);
    const password = validatePassword(formData.password);
    const confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (!fullName.isValid) errors.fullName = fullName.error;
    if (!phone.isValid) errors.phone = phone.error;
    if (!email.isValid) errors.email = email.error;
    if (!username.isValid) errors.username = username.error;
    if (!password.isValid) errors.password = password.error;
    if (!confirmPassword.isValid) errors.confirmPassword = confirmPassword.error;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateTherapistProfileFields() {
    const errors: FormErrors = {};
    const years = validateYearsOfExperience(formData.yearsOfExperience);
    const specialties = validateSpecialties(formData.specialties);
    const bio = validateBio(formData.bio);
    const citizenId = validateCitizenId(formData.citizenId);
    const serviceAreas = validateServiceAreas(formData.serviceAreas);
    const transport = validateRequiredConfirmation(formData.hasTransport, "Vui lòng xác nhận bạn tự túc phương tiện di chuyển");
    const equipment = validateRequiredConfirmation(formData.hasEquipment, "Vui lòng xác nhận bạn có dụng cụ hành nghề cơ bản");
    const portraitResult = validateRequiredFile(portrait, "ảnh chân dung");
    const citizenIdFrontResult = validateRequiredFile(citizenIdFront, "ảnh CCCD mặt trước");
    const citizenIdBackResult = validateRequiredFile(citizenIdBack, "ảnh CCCD mặt sau");
    const certificateResult = validateCertificates(certificates);

    if (!years.isValid) errors.yearsOfExperience = years.error;
    if (!specialties.isValid) errors.specialties = specialties.error;
    if (!bio.isValid) errors.bio = bio.error;
    if (!citizenId.isValid) errors.citizenId = citizenId.error;
    if (!serviceAreas.isValid) errors.serviceAreas = serviceAreas.error;
    if (!transport.isValid) errors.hasTransport = transport.error;
    if (!equipment.isValid) errors.hasEquipment = equipment.error;
    if (!portraitResult.isValid) errors.portrait = portraitResult.error;
    if (!citizenIdFrontResult.isValid) errors.citizenIdFront = citizenIdFrontResult.error;
    if (!citizenIdBackResult.isValid) errors.citizenIdBack = citizenIdBackResult.error;
    if (!certificateResult.isValid) errors.certificates = certificateResult.error;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (accountType === "therapist" && therapistStep === "account") {
      if (!validateAccountFields()) return;
      setTherapistStep("profile");
      return;
    }

    if (!validateAccountFields()) return;

    if (accountType === "therapist" && !validateTherapistProfileFields()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
      };

      if (accountType === "customer") {
        const user = await registerCustomer(baseData);
        setUser(user);
        setRegisteredUser(user);
      } else {
        // Upload files trước
        setIsUploading(true);
        try {
          const user = await registerTherapist({
            ...baseData,
            yearsOfExperience: Number.parseInt(formData.yearsOfExperience, 10),
            specialties: formData.specialties,
            bio: formData.bio.trim(),
            serviceAreas: formData.serviceAreas,
            hasTransport: formData.hasTransport,
            hasEquipment: formData.hasEquipment,
            portrait: portrait!,
            citizenId: formData.citizenId.trim(),
            citizenIdFront: citizenIdFront!,
            citizenIdBack: citizenIdBack!,
            certificates: Array.from(certificates ?? []),
          } satisfies TherapistRegistrationData);

          setUser(user);
          setRegisteredUser(user);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (registrationError) {
      const errorMessage = registrationError instanceof Error
        ? registrationError.message
        : "Đăng ký thất bại";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background md:flex-row">
      <section className="relative hidden h-screen w-full overflow-hidden border-r border-botanical-border bg-soft-mint md:sticky md:top-0 md:flex md:w-5/12">
        <img src={registerWellnessPanelImage} alt="Không gian chăm sóc sức khỏe tại nhà của JvJ" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 mx-auto flex h-screen w-full max-w-xl flex-col justify-between px-8 py-12 lg:px-16">
          <div>
            <Link to="/" className="mb-12 flex w-fit">
              <BrandLogo imageClassName="size-12 rounded-xl shadow-lg shadow-primary/20" textClassName="text-3xl font-extrabold tracking-tighter text-primary" />
            </Link>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-on-surface">Đăng ký tài khoản JvJ</h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              Đặt lịch trị liệu tại nhà hoặc trở thành kỹ thuật viên được thẩm định tại Đà Nẵng.
            </p>
          </div>

          <div className="mb-4 max-w-md rounded-2xl border border-botanical-border bg-white/85 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-bold text-primary">Quyền lợi khi tham gia</h2>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-on-surface">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 fill-primary text-white" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center bg-surface p-6 md:w-7/12 md:p-12 lg:p-20">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 text-center md:hidden">
            <BrandLogo className="justify-center" imageClassName="size-12 rounded-xl shadow-lg shadow-primary/20" textClassName="text-2xl font-extrabold text-primary" />
            <p className="mt-3 text-sm text-on-surface-variant">Tạo tài khoản để trải nghiệm dịch vụ tại Đà Nẵng</p>
          </div>

          {registeredUser ? (
            <SuccessCard accountType={accountType} onLoginClick={() => navigate("/login")} />
          ) : (
            <div className="rounded-2xl border border-botanical-border bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-2 text-2xl font-bold text-on-surface">Tạo tài khoản mới</h2>
              <p className="mb-8 text-sm text-on-surface-variant">Vui lòng điền thông tin bên dưới để bắt đầu</p>

              <div className="mb-8 flex rounded-xl bg-surface-container p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-sm transition-all ${accountType === "customer" ? "bg-white font-semibold text-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface"}`}
                  onClick={() => handleAccountTypeChange("customer")}
                >
                  Khách hàng
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-sm transition-all ${accountType === "therapist" ? "bg-white font-semibold text-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface"}`}
                  onClick={() => handleAccountTypeChange("therapist")}
                >
                  Kỹ thuật viên
                </button>
              </div>

              {error ? (
                <div className="mb-5 flex gap-3 rounded-xl border border-error/20 bg-error-container p-4 text-sm text-error">
                  <XCircle className="size-5 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {accountType === "therapist" ? <StepIndicator currentStep={therapistStep} /> : null}

                {(accountType === "customer" || therapistStep === "account") ? (
                  <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Họ tên" error={fieldErrors.fullName}>
                        <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" disabled={isLoading} className={inputClass(fieldErrors.fullName)} />
                      </Field>
                      <Field label="Số điện thoại" error={fieldErrors.phone}>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="0905 xxx xxx" disabled={isLoading} className={inputClass(fieldErrors.phone)} />
                      </Field>
                    </div>

                    <Field label="Email" error={fieldErrors.email}>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" disabled={isLoading} className={inputClass(fieldErrors.email)} />
                    </Field>

                    <Field label="Tên đăng nhập" error={fieldErrors.username}>
                      <Input name="username" value={formData.username} onChange={handleChange} placeholder="nguyenvana" disabled={isLoading} className={inputClass(fieldErrors.username)} />
                    </Field>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Mật khẩu" error={fieldErrors.password}>
                        <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={isLoading} className={inputClass(fieldErrors.password)} />
                      </Field>
                      <Field label="Nhập lại mật khẩu" error={fieldErrors.confirmPassword}>
                        <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" disabled={isLoading} className={inputClass(fieldErrors.confirmPassword)} />
                      </Field>
                    </div>
                  </>
                ) : null}

                {accountType === "therapist" && therapistStep === "profile" ? (
                  <div className="space-y-5 pt-2">
                    <div className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-4">
                      <div className="flex gap-3">
                        <Info className="size-5 shrink-0 text-pending-amber" />
                        <p className="text-xs leading-relaxed text-pending-amber">
                          Hồ sơ của bạn sẽ được Admin xem xét trước khi được nhận lịch. Vui lòng cung cấp thông tin đúng với giấy tờ và chứng chỉ hiện có.
                        </p>
                      </div>
                    </div>

                    <FileUploadField
                      label="Ảnh chân dung"
                      description="Tải ảnh chân dung rõ mặt để Admin xác minh hồ sơ"
                      fileName={portrait?.name}
                      error={fieldErrors.portrait}
                      onChange={(event) => handleSingleFileChange("portrait", event.target.files?.[0] ?? null)}
                    />

                    <Field label="Số CCCD" error={fieldErrors.citizenId}>
                      <Input name="citizenId" inputMode="numeric" value={formData.citizenId} onChange={handleChange} placeholder="Nhập 12 chữ số CCCD" disabled={isLoading} className={inputClass(fieldErrors.citizenId)} />
                    </Field>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FileUploadField
                        label="CCCD mặt trước"
                        description="Tải ảnh mặt trước CCCD"
                        fileName={citizenIdFront?.name}
                        error={fieldErrors.citizenIdFront}
                        onChange={(event) => handleSingleFileChange("citizenIdFront", event.target.files?.[0] ?? null)}
                      />
                      <FileUploadField
                        label="CCCD mặt sau"
                        description="Tải ảnh mặt sau CCCD"
                        fileName={citizenIdBack?.name}
                        error={fieldErrors.citizenIdBack}
                        onChange={(event) => handleSingleFileChange("citizenIdBack", event.target.files?.[0] ?? null)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field label="Số năm kinh nghiệm" error={fieldErrors.yearsOfExperience}>
                        <Input name="yearsOfExperience" type="number" min="0" value={formData.yearsOfExperience} onChange={handleChange} placeholder="VD: 3" disabled={isLoading} className={inputClass(fieldErrors.yearsOfExperience)} />
                      </Field>
                      <Field label="Chuyên môn" error={fieldErrors.specialties}>
                        <div className="grid grid-cols-2 gap-2">
                          {therapistSpecialties.map((specialty) => (
                            <label key={specialty} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${formData.specialties.includes(specialty) ? "border-primary bg-soft-mint text-primary" : "border-botanical-border bg-background text-on-surface-variant"}`}>
                              <input className="sr-only" type="checkbox" checked={formData.specialties.includes(specialty)} onChange={() => handleSpecialtyChange(specialty)} disabled={isLoading} />
                              <span>{specialty}</span>
                            </label>
                          ))}
                        </div>
                      </Field>
                    </div>

                    <Field label="Giới thiệu bản thân" error={fieldErrors.bio}>
                      <Input name="bio" value={formData.bio} onChange={handleChange} placeholder="Tóm tắt kinh nghiệm và thế mạnh trị liệu của bạn" disabled={isLoading} className={inputClass(fieldErrors.bio)} />
                    </Field>

                    <Field label="Khu vực phục vụ tại Đà Nẵng" error={fieldErrors.serviceAreas}>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {daNangServiceAreas.map((area) => (
                          <label key={area} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${formData.serviceAreas.includes(area) ? "border-primary bg-soft-mint text-primary" : "border-botanical-border bg-background text-on-surface-variant"}`}>
                            <input className="sr-only" type="checkbox" checked={formData.serviceAreas.includes(area)} onChange={() => handleServiceAreaChange(area)} disabled={isLoading} />
                            <span>{area}</span>
                          </label>
                        ))}
                      </div>
                    </Field>

                    <FileUploadField
                      label="Bằng cấp / chứng chỉ hành nghề"
                      description="Tải ảnh hoặc PDF chứng chỉ hành nghề"
                      fileName={certificates && certificates.length > 0 ? `${certificates.length} file đã chọn` : undefined}
                      error={fieldErrors.certificates}
                      multiple
                      onChange={handleCertificatesChange}
                    />

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 rounded-xl border border-botanical-border bg-background p-3 text-sm text-on-surface-variant">
                        <input name="hasTransport" type="checkbox" checked={formData.hasTransport} onChange={handleCheckboxChange} disabled={isLoading} className="mt-1" />
                        <span>Tôi xác nhận tự túc phương tiện di chuyển đến địa chỉ khách hàng tại Đà Nẵng.</span>
                      </label>
                      {fieldErrors.hasTransport ? <p className="text-xs text-error">{fieldErrors.hasTransport}</p> : null}

                      <label className="flex items-start gap-3 rounded-xl border border-botanical-border bg-background p-3 text-sm text-on-surface-variant">
                        <input name="hasEquipment" type="checkbox" checked={formData.hasEquipment} onChange={handleCheckboxChange} disabled={isLoading} className="mt-1" />
                        <span>Tôi xác nhận có đầy đủ dụng cụ cơ bản để thực hiện liệu trình tại nhà.</span>
                      </label>
                      {fieldErrors.hasEquipment ? <p className="text-xs text-error">{fieldErrors.hasEquipment}</p> : null}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  {accountType === "therapist" && therapistStep === "profile" ? (
                    <Button type="button" variant="secondary" className="h-auto flex-1 rounded-xl border border-botanical-border bg-transparent py-4 text-base font-bold text-on-surface hover:bg-surface-container-low" onClick={() => setTherapistStep("account")} disabled={isLoading}>
                      Quay lại
                    </Button>
                  ) : null}
                  <Button type="submit" className="h-auto flex-1 rounded-xl py-4 text-base font-bold shadow-md active:scale-[0.98]" disabled={isLoading}>
                    {isLoading
                      ? isUploading
                        ? "Đang tải hồ sơ lên..."
                        : "Đang xử lý đăng ký..."
                      : accountType === "therapist" && therapistStep === "account" ? "Tiếp tục" : accountType === "therapist" ? "Gửi hồ sơ xét duyệt" : "Đăng ký"}
                  </Button>
                </div>
              </form>

              <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-sm text-on-surface-variant">
                  Đã có tài khoản? <Link className="font-bold text-primary hover:underline" to="/login">Đăng nhập</Link>
                </p>
                <Link className="flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary" to="/">
                  <ArrowLeft className="size-4" />
                  Quay lại trang chủ
                </Link>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-xs text-on-surface-variant/60">© 2026 JvJ - Chăm sóc sức khỏe tại nhà Đà Nẵng</p>
        </div>
      </section>
    </div>
  );
}

function inputClass(error?: string) {
  return `h-auto rounded-xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 ${error ? "border-error" : "border-botanical-border"}`;
}

type FieldProps = Readonly<{
  label: string;
  error?: string;
  children: ReactNode;
}>;

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-on-surface">{label}</label>
      {children}
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}

type FileUploadFieldProps = Readonly<{
  label: string;
  description: string;
  fileName?: string;
  error?: string;
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}>;

function FileUploadField({ label, description, fileName, error, multiple = false, onChange }: FileUploadFieldProps) {
  return (
    <Field label={label} error={error}>
      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-background p-5 text-center transition-colors hover:bg-surface-container-low ${error ? "border-error" : "border-botanical-border"}`}>
        <Upload className="mb-2 size-7 text-primary" />
        <span className="text-sm text-on-surface-variant">{description}</span>
        <span className="mt-1 text-xs text-muted-text">{multiple ? "JPG, PNG, WebP hoặc PDF tối đa 5MB" : "JPG, PNG hoặc WebP tối đa 5MB"}</span>
        {fileName ? <span className="mt-2 text-xs font-semibold text-primary">{fileName}</span> : null}
        <input className="sr-only" type="file" accept={multiple ? "image/jpeg,image/png,image/webp,application/pdf" : "image/jpeg,image/png,image/webp"} multiple={multiple} onChange={onChange} />
      </label>
    </Field>
  );
}

type StepIndicatorProps = Readonly<{
  currentStep: TherapistStep;
}>;

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: "account", label: "Tài khoản" },
    { id: "profile", label: "Hồ sơ xét duyệt" },
  ] satisfies ReadonlyArray<{ id: TherapistStep; label: string }>;

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-surface-container p-1">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        return (
          <div key={step.id} className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${isActive ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"}`}>
            {index + 1}. {step.label}
          </div>
        );
      })}
    </div>
  );
}

type SuccessCardProps = Readonly<{
  accountType: AccountType;
  onLoginClick: () => void;
}>;

function SuccessCard({ accountType, onLoginClick }: SuccessCardProps) {
  return (
    <div className="rounded-2xl border border-botanical-border bg-white p-8 text-center shadow-sm md:p-10">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-soft-mint text-primary">
        <CheckCircle2 className="size-9" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-on-surface">Đăng ký thành công!</h2>
      <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
        {accountType === "therapist"
          ? "Hồ sơ của bạn đang chờ Admin duyệt. Bạn sẽ nhận được thông báo khi hồ sơ được phê duyệt."
          : "Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ."}
      </p>
      <Button type="button" className="h-auto w-full rounded-xl py-4 text-base font-bold" onClick={onLoginClick}>
        Đăng nhập ngay
      </Button>
    </div>
  );
}
