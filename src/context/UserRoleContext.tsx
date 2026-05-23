"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "Customer" | "Owner";

interface UserRoleContextType {
    role: Role;
    setRole: (role: Role) => void;
    toggleRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Role>("Customer");

    // Persist role in localStorage for a better DX
    useEffect(() => {
        const savedRole = localStorage.getItem("userRole") as Role;
        if (savedRole && (savedRole === "Customer" || savedRole === "Owner")) {
            setRoleState(savedRole);
        }
    }, []);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem("userRole", newRole);
    };

    const toggleRole = () => {
        const newRole = role === "Customer" ? "Owner" : "Customer";
        setRole(newRole);
    };

    return (
        <UserRoleContext.Provider value={{ role, setRole, toggleRole }}>
            {children}
        </UserRoleContext.Provider>
    );
}

export function useUserRole() {
    const context = useContext(UserRoleContext);
    if (context === undefined) {
        throw new Error("useUserRole must be used within a UserRoleProvider");
    }
    return context;
}
