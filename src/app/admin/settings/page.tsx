"use client";

import { useState, useEffect } from "react";
import {
    User,
    Users,
    ShieldCheck,
    Lock,
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Bell,
    Loader2,
    RefreshCw
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import adminAccountService from "@/services/adminAccountService";
import SuccessModal from "@/components/admin/SuccessModal";
import AddUserModal from "@/components/admin/AddUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import AddStaffModal from "@/components/admin/AddStaffModal";
import DeleteStaffModal from "@/components/admin/DeleteStaffModal";

const SIDEBAR_ITEMS = [
    { id: "profile", label: "Admin Profile", icon: User },
    { id: "users", label: "Users Management", icon: Users },
    { id: "staff", label: "Staff Management", icon: ShieldCheck },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Bell },
];

const INITIAL_USERS = [
    { id: 1, firstName: "Guy", lastName: "Hawkins", email: "Tanya.Hill@Example.Com", role: "Owner", status: "Active" },
    { id: 2, firstName: "Cameron", lastName: "Williamson", email: "Nevaeh.Simmons@Example.Com", role: "Renter", status: "Active" },
    { id: 3, firstName: "Bessie", lastName: "Cooper", email: "Jackson.Graham@Example.Com", role: "Owner", status: "Active" },
    { id: 4, firstName: "Wade", lastName: "Warren", email: "Nathan.Roberts@Example.Com", role: "Owner", status: "Active" },
    { id: 5, firstName: "Kristin", lastName: "Watson", email: "Jackson.Graham@Example.Com", role: "Renter", status: "Active" },
    { id: 6, firstName: "Courtney", lastName: "Henry", email: "Felicia.Reid@Example.Com", role: "Renter", status: "Inactive" },
];

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    // Profile State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // User Management State (Mock representation preserved for local interaction)
    const [users, setUsers] = useState(INITIAL_USERS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Staff Management State
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [isDeleteStaffModalOpen, setIsDeleteStaffModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    // Feedback State
    const [showSuccess, setShowSuccess] = useState(false);
    const [successTitle, setSuccessTitle] = useState("Profile Updated");
    const [successMessage, setSuccessMessage] = useState("Your profile information has been successfully updated.");

    // Security State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        allAssigned: true,
        activity: false,
        kycTasks: true,
        listings: false
    });

    // Profile Query & Mutation
    const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
        queryKey: ["admin-profile"],
        queryFn: () => adminAccountService.getProfile(),
        enabled: activeTab === "profile",
    });

    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName || "");
            setLastName(profile.lastName || "");
        }
    }, [profile]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: { firstName: string | null; lastName: string | null }) => adminAccountService.updateProfile(data),
        onSuccess: () => {
            refetchProfile();
            setSuccessTitle("Profile Updated");
            setSuccessMessage("Your profile information has been successfully updated.");
            setShowSuccess(true);
        }
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({ firstName, lastName });
    };

    // Password Update Mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string | null; newPassword: string | null }) => adminAccountService.changePassword(data),
        onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setSuccessTitle("Password Updated");
            setSuccessMessage("Your password has been successfully updated.");
            setShowSuccess(true);
        }
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            alert("New passwords do not match!");
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

    // Staff Queries & Mutations
    const { data: staffMembers = [], isLoading: isLoadingStaff, refetch: refetchStaff } = useQuery({
        queryKey: ["admin-staff"],
        queryFn: () => adminAccountService.getStaff(),
        enabled: activeTab === "staff",
    });

    const createStaffMutation = useMutation({
        mutationFn: (data: { firstName: string | null; lastName: string | null; email: string | null; password: string | null }) =>
            adminAccountService.createStaff(data),
        onSuccess: () => {
            refetchStaff();
            setSuccessTitle("Staff Added");
            setSuccessMessage("The new staff member has been successfully added.");
            setShowSuccess(true);
        }
    });

    const deactivateStaffMutation = useMutation({
        mutationFn: (id: string) => adminAccountService.deactivateStaff(id),
        onSuccess: () => {
            refetchStaff();
            setSuccessTitle("Staff Deactivated");
            setSuccessMessage("The staff member has been successfully deactivated.");
            setShowSuccess(true);
        }
    });

    const reactivateStaffMutation = useMutation({
        mutationFn: (id: string) => adminAccountService.reactivateStaff(id),
        onSuccess: () => {
            refetchStaff();
            setSuccessTitle("Staff Reactivated");
            setSuccessMessage("The staff member has been successfully reactivated.");
            setShowSuccess(true);
        }
    });

    const handleAddStaff = (newStaff: any) => {
        createStaffMutation.mutate({
            firstName: newStaff.firstName,
            lastName: newStaff.lastName,
            email: newStaff.email,
            password: "Password123!",
        });
    };

    const handleDeleteStaff = () => {
        if (selectedStaff) {
            deactivateStaffMutation.mutate(selectedStaff.id);
        }
    };

    const handleReactivateStaff = (id: string) => {
        reactivateStaffMutation.mutate(id);
    };

    const togglePreference = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Mock Users Actions
    const handleAddUser = (user: any) => {
        setUsers([user, ...users]);
        setSuccessTitle("User Added");
        setSuccessMessage("The new user has been successfully added.");
        setShowSuccess(true);
    };

    const handleEditUser = (updatedUser: any) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setSuccessTitle("User Updated");
        setSuccessMessage("The user information has been successfully updated.");
        setShowSuccess(true);
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setSuccessTitle("User Deleted");
            setSuccessMessage("The user has been successfully removed.");
            setShowSuccess(true);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight leading-none text-left">
                    Account Settings
                </h1>
                {activeTab === "users" && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#002B7F] text-white rounded-[16px] font-bold text-[15px] hover:bg-opacity-90 transition-all shadow-md shadow-blue-900/10 font-montserrat"
                    >
                        <Plus size={18} />
                        Add User
                    </button>
                )}
                {activeTab === "staff" && (
                    <button
                        onClick={() => setIsAddStaffModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#002B7F] text-white rounded-[16px] font-bold text-[15px] hover:bg-opacity-90 transition-all shadow-md shadow-blue-900/10 font-montserrat"
                    >
                        <Plus size={18} />
                        Add Staff
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-[300px] bg-white border border-gray-100 rounded-[24px] p-4 h-fit shadow-sm text-left">
                    <div className="flex flex-col gap-2">
                        {SIDEBAR_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-[16px] transition-all duration-300 group font-montserrat ${isActive
                                        ? "bg-[#002B7F] text-white shadow-md shadow-blue-900/10"
                                        : "text-[#1A1A1A] hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className={isActive ? "text-white" : "text-[#1A1A1A] group-hover:text-[#002B7F]"}
                                    />
                                    <span className={`text-[15px] font-bold ${isActive ? "text-white" : "text-[#1A1A1A]"}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white border border-gray-100 rounded-[24px] p-10 shadow-sm h-fit">
                    {activeTab === "profile" && (
                        <div className="flex flex-col gap-8">
                            <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-left">
                                Profile Information
                            </h2>

                            {isLoadingProfile ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="animate-spin text-[#002B7F] w-10 h-10" />
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Enter first name"
                                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[14px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-200 font-montserrat"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Enter last name"
                                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[14px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-200 font-montserrat"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            readOnly
                                            value={profile?.email || ""}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[14px] text-[15px] font-medium text-gray-400 outline-none font-montserrat cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                            Account Status
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={profile?.isActive ? "Active" : "Inactive"}
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[14px] text-[15px] font-medium text-gray-400 outline-none font-montserrat cursor-not-allowed"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="w-fit px-12 py-4 bg-[#002B7F] text-white rounded-[16px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-md mt-4 font-montserrat flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {updateProfileMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                        Save Changes
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="flex flex-col gap-8">
                            <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-left">
                                User Management
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Name</th>
                                            <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Email</th>
                                            <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Role</th>
                                            <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Status</th>
                                            <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-all">
                                                <td className="py-5 text-[14px] font-medium text-[#1A1A1A] font-montserrat">
                                                    {user.firstName} {user.lastName || ""}
                                                </td>
                                                <td className="py-5 text-[14px] font-medium text-gray-500 font-montserrat">
                                                    {user.email}
                                                </td>
                                                <td className="py-5 text-[14px] font-medium text-gray-500 font-montserrat">
                                                    {user.role}
                                                </td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold font-montserrat ${user.status === "Active"
                                                        ? "bg-green-50 text-green-500"
                                                        : "bg-red-50 text-red-500"
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="py-5">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-2 text-[#0095FF] hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                            className="p-2 text-[#FF3B30] hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <div className="flex flex-col gap-8">
                            <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-left">
                                Staff Management
                            </h2>

                            {isLoadingStaff ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="animate-spin text-[#002B7F] w-10 h-10" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Name</th>
                                                <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Email</th>
                                                <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Status</th>
                                                <th className="text-left py-4 text-[15px] font-bold text-[#1A1A1A] font-montserrat">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {staffMembers.map((member) => (
                                                <tr key={member.id} className="group hover:bg-gray-50/50 transition-all">
                                                    <td className="py-5 text-[14px] font-medium text-[#1A1A1A] font-montserrat">
                                                        {member.firstName} {member.lastName}
                                                    </td>
                                                    <td className="py-5 text-[14px] font-medium text-gray-500 font-montserrat">
                                                        {member.email}
                                                    </td>
                                                    <td className="py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold font-montserrat ${member.isActive !== false
                                                            ? "bg-green-50 text-green-500"
                                                            : "bg-red-50 text-red-500"
                                                            }`}>
                                                            {member.isActive !== false ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            {member.isActive !== false ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedStaff(member);
                                                                        setIsDeleteStaffModalOpen(true);
                                                                    }}
                                                                    className="p-2 text-[#FF3B30] hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Deactivate Staff"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        handleReactivateStaff(member.id);
                                                                    }}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                    title="Reactivate Staff"
                                                                >
                                                                    <RefreshCw size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="flex flex-col gap-10">
                            <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-left">
                                Change Password
                            </h2>

                            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6 text-left max-w-full">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[14px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[14px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-[12px] text-gray-300 font-medium font-montserrat">
                                        Between 8 and 72 characters
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[14px] font-medium text-gray-400 font-montserrat">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[14px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-[12px] text-gray-300 font-medium font-montserrat">
                                        Between 8 and 72 characters
                                    </p>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        disabled={changePasswordMutation.isPending}
                                        className="w-fit px-12 py-4 bg-[#002B7F] text-white rounded-full font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-md font-montserrat flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {changePasswordMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className="flex flex-col gap-10">
                            <h2 className="text-[22px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-left">
                                Notification Preferences
                            </h2>

                            <div className="flex flex-col border border-gray-100 rounded-[24px] divide-y divide-gray-100">
                                <div className="flex items-center justify-between p-8">
                                    <span className="text-[16px] font-bold text-[#1A1A1A] font-montserrat">
                                        All Assigned
                                    </span>
                                    <button
                                        onClick={() => togglePreference("allAssigned")}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${preferences.allAssigned ? "bg-[#002B7F]" : "bg-gray-200"}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${preferences.allAssigned ? "translate-x-7" : ""}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-8">
                                    <span className="text-[16px] font-bold text-[#1A1A1A] font-montserrat">
                                        Activity
                                    </span>
                                    <button
                                        onClick={() => togglePreference("activity")}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${preferences.activity ? "bg-[#002B7F]" : "bg-gray-200"}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${preferences.activity ? "translate-x-7" : ""}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-8">
                                    <span className="text-[16px] font-bold text-[#1A1A1A] font-montserrat">
                                        KYC Tasks
                                    </span>
                                    <button
                                        onClick={() => togglePreference("kycTasks")}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${preferences.kycTasks ? "bg-[#002B7F]" : "bg-gray-200"}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${preferences.kycTasks ? "translate-x-7" : ""}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-8">
                                    <span className="text-[16px] font-bold text-[#1A1A1A] font-montserrat">
                                        Listings
                                    </span>
                                    <button
                                        onClick={() => togglePreference("listings")}
                                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${preferences.listings ? "bg-[#002B7F]" : "bg-gray-200"}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${preferences.listings ? "translate-x-7" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddUser}
            />

            <AddStaffModal
                isOpen={isAddStaffModalOpen}
                onClose={() => setIsAddStaffModalOpen(false)}
                onAdd={handleAddStaff}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                onSave={handleEditUser}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteUser}
            />

            <DeleteStaffModal
                isOpen={isDeleteStaffModalOpen}
                onClose={() => setIsDeleteStaffModalOpen(false)}
                onDelete={handleDeleteStaff}
            />

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title={successTitle}
                message={successMessage}
            />
        </div>
    );
}
