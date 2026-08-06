"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useOwner } from "@/hooks/useOwner";
import { useProperty } from "@/hooks/useProperty";
import { PropertyType, AvailabilityStatus, PropertyLeaseType } from "@/types/property";
import { PROPERTY_FEATURE_LABELS } from "@/lib/propertyFeatures";
import SuccessModal from "@/components/admin/SuccessModal";

const PROPERTY_TYPES = ["House", "Apartment", "Guesthouse", "Flat", "Duplex"];

// File extensions match the backend's ValidateFile allowlist exactly (PropertyCommandService).
// Size is capped well below the backend's own 10MB limit because uploads go through API
// Gateway + Lambda, which has a hard 6MB payload ceiling (worse once multipart/base64
// overhead is added) — stopgap until uploads move to direct-to-S3 presigned URLs.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".mp4", ".mov", ".avi", ".mkv", ".webm"];

export default function AdminAddPropertyPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { useAllOwners } = useOwner();
    const { createProperty, isCreating } = useProperty();

    const { data: ownersResponse, isLoading: isLoadingOwners } = useAllOwners({ isManaged: true, pageSize: 1000 });
    const managedOwners = ownersResponse?.data?.items ?? [];

    const [ownerId, setOwnerId] = useState("");
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.House);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [availability, setAvailability] = useState<AvailabilityStatus>(AvailabilityStatus.Available);
    const [listingType, setListingType] = useState<PropertyLeaseType>(PropertyLeaseType.Rent);
    const [price, setPrice] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

    const [place, setPlace] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("100001");

    const [contactPersonName, setContactPersonName] = useState("");
    const [contactPersonEmail, setContactPersonEmail] = useState("");
    const [contactPersonPhoneNumber, setContactPersonPhoneNumber] = useState("");

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [imageError, setImageError] = useState("");

    const [duplicateWarning, setDuplicateWarning] = useState<{ title: string; address: string } | null>(null);
    const [successModal, setSuccessModal] = useState(false);

    const isFormValid =
        ownerId !== "" &&
        title.trim() !== "" &&
        description.trim() !== "" &&
        price.trim() !== "" &&
        place.trim() !== "" &&
        city.trim() !== "" &&
        state.trim() !== "" &&
        contactPersonName.trim() !== "" &&
        contactPersonEmail.trim() !== "" &&
        contactPersonPhoneNumber.trim() !== "";

    const toggleFeature = (bit: number) => {
        setSelectedFeatures(prev => prev.includes(bit) ? prev.filter(f => f !== bit) : [...prev, bit]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 10) {
            setImageError("Maximum 10 files allowed.");
            e.target.value = "";
            return;
        }

        const validFiles: File[] = [];
        let error = "";
        for (const file of files) {
            const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
            if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
                error = `${file.name}: unsupported file type. Use JPG, PNG, GIF, WEBP, or BMP images (or MP4, MOV, AVI, MKV, WEBM videos).`;
                continue;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                error = `${file.name}: file is larger than 4MB.`;
                continue;
            }
            validFiles.push(file);
        }
        setImageError(error);

        if (validFiles.length === 0) {
            e.target.value = "";
            return;
        }

        setImages(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const submit = (confirmDuplicate: boolean = false) => {
        const featuresValue = selectedFeatures.reduce((acc, bit) => acc | bit, 0);

        createProperty({
            title,
            description,
            propertyType,
            price: parseFloat(price.replace(/,/g, '')),
            availability,
            propertyLeaseType: listingType,
            features: featuresValue,
            contactPersonName,
            contactPersonEmail,
            contactPersonPhoneNumber,
            ownerId,
            place,
            city,
            state,
            country: "Nigeria",
            postalCode,
            files: images,
            confirmDuplicate,
        }, {
            onSuccess: (response) => {
                if (response.data?.possibleDuplicate) {
                    setDuplicateWarning({
                        title: response.data.possibleDuplicate.title,
                        address: response.data.possibleDuplicate.address,
                    });
                    return;
                }
                setSuccessModal(true);
            },
        });
    };

    const handleConfirmDuplicate = () => {
        setDuplicateWarning(null);
        submit(true);
    };

    if (!isLoadingOwners && managedOwners.length === 0) {
        return (
            <div className="flex flex-col gap-8">
                <Link href="/admin/properties" className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit">
                    <ChevronLeft size={20} /> Back
                </Link>
                <div className="bg-white border border-gray-100 rounded-[20px] p-16 shadow-sm text-center">
                    <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat mb-3">No managed owners yet</h2>
                    <p className="text-gray-500 font-medium max-w-md mx-auto">
                        Mark an owner as &ldquo;Managed by HousingHub&rdquo; from their profile before posting a property on their behalf.
                    </p>
                    <Link
                        href="/admin/owners"
                        className="inline-flex mt-8 px-8 py-3.5 bg-[#0B2545] text-white rounded-full font-bold text-[14px] hover:bg-[#071A33] transition-all"
                    >
                        Go to Owners
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <SuccessModal
                isOpen={successModal}
                onClose={() => { setSuccessModal(false); router.push("/admin/properties"); }}
                title="Property Created"
                message="The property has been successfully posted on behalf of the owner."
            />

            <button
                onClick={() => router.push("/admin/properties")}
                className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit"
            >
                <ChevronLeft size={20} /> Back
            </button>

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">Add Property on Behalf of Owner</h1>

            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <label className="text-[12px] font-black text-gray-400 uppercase tracking-wider">
                    Owner<span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-lg">
                    <select
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                        className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] appearance-none bg-white cursor-pointer"
                    >
                        <option value="">Select a managed owner...</option>
                        {managedOwners.map((owner) => (
                            <option key={owner.id} value={owner.id}>
                                {owner.firstName} {owner.lastName} &mdash; {owner.email}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-8">
                    <h2 className="text-[18px] font-bold text-[#1A1A1A] font-montserrat">Property Details</h2>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Property Type</label>
                        <div className="flex flex-wrap gap-3">
                            {PROPERTY_TYPES.map((type, idx) => (
                                <button
                                    key={type}
                                    onClick={() => setPropertyType(idx as PropertyType)}
                                    className={`px-6 py-3 rounded-full border-2 font-bold text-[13px] transition-all ${propertyType === idx ? "border-[#0095FF] text-[#0095FF]" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                            Title<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Aliart House"
                            className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                            Description<span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                            placeholder="Enter property description..."
                            rows={5}
                            className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Availability</label>
                        <div className="relative">
                            <select
                                value={availability}
                                onChange={(e) => setAvailability(parseInt(e.target.value) as AvailabilityStatus)}
                                className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] appearance-none bg-white cursor-pointer"
                            >
                                <option value={AvailabilityStatus.Available}>Available</option>
                                <option value={AvailabilityStatus.Occupied}>Occupied</option>
                                <option value={AvailabilityStatus.Sold}>Sold</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Listing Type</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setListingType(PropertyLeaseType.Rent)}
                                className={`px-10 py-3 rounded-full border-2 font-bold text-[13px] transition-all ${listingType === PropertyLeaseType.Rent ? "border-[#0095FF] text-[#0095FF]" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                            >
                                Rent
                            </button>
                            <button
                                onClick={() => setListingType(PropertyLeaseType.Sale)}
                                className={`px-10 py-3 rounded-full border-2 font-bold text-[13px] transition-all ${listingType === PropertyLeaseType.Sale ? "border-[#0095FF] text-[#0095FF]" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                            >
                                Sale
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                            Price<span className="text-red-500">*</span>
                        </label>
                        <div className="relative max-w-xs">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A1A1A] font-bold">₦</div>
                            <input
                                type="text"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="350,000"
                                className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Features</label>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(PROPERTY_FEATURE_LABELS).map(([bit, label]) => (
                                <button
                                    key={bit}
                                    onClick={() => toggleFeature(Number(bit))}
                                    className={`px-5 py-2.5 rounded-full border-2 font-bold text-[12px] transition-all ${selectedFeatures.includes(Number(bit)) ? "border-[#0095FF] text-[#0095FF]" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-8">
                        <h2 className="text-[18px] font-bold text-[#1A1A1A] font-montserrat">Address</h2>

                        <div>
                            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                Place<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={place}
                                onChange={(e) => setPlace(e.target.value)}
                                placeholder="Alirat street"
                                className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                    City<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ikeja"
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                    State<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Lagos"
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Country</label>
                                <input
                                    type="text"
                                    value="Nigeria"
                                    readOnly
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 bg-gray-50 font-medium text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Postal Code</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-8">
                        <h2 className="text-[18px] font-bold text-[#1A1A1A] font-montserrat">Contact Person</h2>

                        <div>
                            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={contactPersonName}
                                onChange={(e) => setContactPersonName(e.target.value)}
                                placeholder="Full name"
                                className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                Email<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={contactPersonEmail}
                                onChange={(e) => setContactPersonEmail(e.target.value)}
                                placeholder="contact@example.com"
                                className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">
                                Phone Number<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={contactPersonPhoneNumber}
                                onChange={(e) => setContactPersonPhoneNumber(e.target.value)}
                                placeholder="+234 000000000000"
                                className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:outline-none focus:border-[#0095FF] font-medium text-[#1A1A1A] placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                        <h2 className="text-[18px] font-bold text-[#1A1A1A] font-montserrat">Photos & Videos</h2>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                <Upload size={24} className="text-gray-400" />
                            </div>
                            <span className="text-[15px] font-bold text-gray-400">Upload Images or Videos</span>
                            <p className="text-[11px] font-bold text-gray-300 mt-2 uppercase tracking-wide text-center px-4">
                                JPG, PNG, GIF, WEBP, BMP images or MP4, MOV, AVI, MKV, WEBM videos, max 4MB (up to 10 files)
                            </p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                        />
                        {imageError && <p className="text-[12px] text-red-500 font-semibold">{imageError}</p>}

                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => submit(false)}
                        disabled={!isFormValid || isCreating}
                        className={`w-full py-5 rounded-[20px] font-black text-[18px] font-montserrat transition-all shadow-lg flex items-center justify-center gap-2 ${isFormValid && !isCreating ? "bg-[#0B2545] text-white hover:bg-[#071A33]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Create Property"}
                    </button>
                </div>
            </div>

            {duplicateWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-[22px] font-black text-[#1A1A1A] font-montserrat mb-3">Similar Listing Found</h2>

                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-2">
                            A listing already exists at this address:
                        </p>
                        <p className="text-[#1A1A1A] text-sm font-bold mb-1">{duplicateWarning.title}</p>
                        <p className="text-gray-500 text-xs font-medium mb-8">{duplicateWarning.address}</p>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setDuplicateWarning(null)}
                                className="flex-1 py-3 rounded-full border border-gray-200 font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDuplicate}
                                disabled={isCreating}
                                className="flex-1 py-3 rounded-full bg-[#0B2545] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
