"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Calendar, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import SuccessModal from "@/components/admin/SuccessModal";
import { useInspection } from "@/hooks/useInspection";
import { useProperty } from "@/hooks/useProperty";
import { format } from "date-fns";
import Link from "next/link";
import { PropertyType, AvailabilityStatus, PropertyLeaseType } from "@/types/property";

const propertyTypeLabels: Record<PropertyType, string> = {
    [PropertyType.House]: "House",
    [PropertyType.Apartment]: "Apartment",
    [PropertyType.Guesthouse]: "Guesthouse",
    [PropertyType.Flat]: "Flat",
    [PropertyType.Duplex]: "Duplex",
};

const availabilityStatusLabels: Record<AvailabilityStatus, string> = {
    [AvailabilityStatus.Available]: "Available",
    [AvailabilityStatus.Occupied]: "Occupied",
    [AvailabilityStatus.Sold]: "Sold",
};

const leaseTypeLabels: Record<PropertyLeaseType, string> = {
    [PropertyLeaseType.Rent]: "Rent",
    [PropertyLeaseType.Sale]: "Sale",
};

export default function PropertyInformationPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [showSuccess, setShowSuccess] = useState(false);

    const { usePropertyInspections } = useInspection();
    const { useGetProperty, publishProperty, isPublishing, unpublishProperty, isUnpublishing } = useProperty();

    const { data: propertyResponse, isLoading: isLoadingProperty } = useGetProperty(id);
    const { data: inspectionsResponse, isLoading: isLoadingInspections } = usePropertyInspections(id);

    const property = propertyResponse?.data;
    const inspections = inspectionsResponse?.data?.items || [];

    if (isLoadingProperty) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#002B7F] w-12 h-12" />
            </div>
        );
    }

    if (!property) {
        return <div className="text-center py-20 text-gray-500 font-bold">Property not found.</div>;
    }

    const isPublished = property.isPublished || false;
    const currentStatus = isPublished ? "Published" : "Posted";
    
    const handleToggleStatus = () => {
        if (isPublished) {
            unpublishProperty(id, {
                onSuccess: () => {
                    setShowSuccess(true);
                }
            });
        } else {
            publishProperty(id, {
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => {
                        router.push("/admin/properties");
                    }, 3000);
                }
            });
        }
    };

    const propertyImage = property.files?.[0]?.fileUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600";
    const propertyLocation = property.propertyAddress
        ? `${property.propertyAddress.place || ""}, ${property.propertyAddress.city || ""}, ${property.propertyAddress.state || ""}`
        : property.address || "Location N/A";
    
    const propertyFullAddress = property.propertyAddress
        ? `${property.propertyAddress.place || ""}, ${property.propertyAddress.city || ""}, ${property.propertyAddress.state || ""}, ${property.propertyAddress.country || ""}`
        : property.address || "Address N/A";

    const formattedDate = property.datePosted || property.dateCreated
        ? format(new Date(property.datePosted || property.dateCreated), "MMM dd, yyyy")
        : "N/A";

    const formattedPrice = property.price !== undefined ? `₦ ${property.price.toLocaleString()}` : "₦ 0";

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit"
            >
                <ChevronLeft size={20} />
                Back
            </button>

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                Property Information
            </h1>

            {/* Header Card */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[120px] h-[120px] rounded-[16px] bg-gray-100 relative overflow-hidden flex-shrink-0">
                    <Image
                        src={propertyImage}
                        alt={property.title || "Property"}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[24px] font-black text-[#1A1A1A] font-montserrat tracking-tight leading-none">
                            {property.title}
                        </h2>
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${!isPublished
                            ? "bg-[#FFF9E9] text-[#FFA800]"
                            : "bg-green-50 text-green-500"
                            }`}>
                            {currentStatus}
                        </span>
                    </div>
                    <p className="text-[17px] font-medium text-[#999999] mb-1">
                        {propertyLocation}
                    </p>
                    <div className="flex items-center gap-4 text-[15px]">
                        <span className="font-bold text-[#1A1A1A]">
                            Owner: <span className="text-[#999999] font-medium">{property.ownerName || "Owner"}</span>
                        </span>
                        <span className="font-bold text-[#0095FF]">
                            Posted: <span className="text-[#999999] font-medium">{formattedDate}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Property Details */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">
                    Property Details
                </h3>

                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Property Type</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{propertyTypeLabels[property.propertyType] ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Property Title</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{property.title}</span>
                    </div>
                    <div className="flex flex-col gap-3 pb-4 border-b border-gray-50 text-justify">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Description</span>
                        <p className="text-[14px] font-bold text-[#1A1A1A] leading-relaxed">
                            {property.description}
                        </p>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Status</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{availabilityStatusLabels[property.availability] ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Address</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{propertyFullAddress}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Features</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">Features ID: {property.features}</span>
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">
                    Pricing
                </h3>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Listing Type</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{leaseTypeLabels[property.propertyLeaseType] ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Price</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{formattedPrice}</span>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">
                    Contact Information
                </h3>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Name</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{property.contactPersonName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Phone</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{property.contactPersonPhoneNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Email</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{property.contactPersonEmail || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Recent Inspections */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">
                        Recent Inspections
                    </h3>
                    <Link href="/admin/inspections" className="text-[#0095FF] text-[13px] font-bold flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                {isLoadingInspections ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="animate-spin text-[#002B7F]" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inspections.slice(0, 3).map((inspection) => (
                            <Link 
                                href={`/admin/inspections`}
                                key={inspection.id} 
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0095FF]">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#1A1A1A]">
                                            {inspection.scheduledDate ? format(new Date(inspection.scheduledDate), "MMM dd, yyyy") : "N/A"}
                                        </p>
                                        <p className="text-[12px] text-gray-400 font-medium">{typeof inspection.scheduledTime === "string" ? inspection.scheduledTime.slice(0, 5) : "N/A"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-[#002B7F] rounded">
                                        ID: {inspection.inspectionId || inspection.id.slice(0, 6)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {inspections.length === 0 && (
                            <p className="text-center py-6 text-gray-400 font-medium">No inspections requested for this property yet.</p>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleToggleStatus}
                disabled={isPublishing || isUnpublishing}
                className="w-full py-5 bg-[#002B7F] text-white rounded-[16px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-md mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {(isPublishing || isUnpublishing) && <Loader2 className="animate-spin" size={20} />}
                {isPublished ? "Unpublish Property" : "Publish Property"}
            </button>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title={isPublished ? "Property Unpublished" : "Property Published"}
                message={`The property has been successfully ${isPublished ? "unpublished" : "published"}.`}
            />
        </div>
    );
}
