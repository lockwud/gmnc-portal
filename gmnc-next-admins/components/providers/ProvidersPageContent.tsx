"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User as UserIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProviderStats } from "@/components/providers/ProviderStats";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderTable } from "@/components/providers/ProviderTable";
import { ProviderProfilePanel } from "@/components/providers/ProviderProfilePanel";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/context/UIContext";

const providers = [
    { id: "GHA-101-544-1", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-2", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-3", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-4", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-5", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-6", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
    { id: "GHA-101-544-7", name: "Dr. Louisa Parker", email: "louisaparker@gmail.com", phone: "024 000 3241", status: "Verified", sessions: 15, joinDate: "5/11/25" },
];

export function ProvidersPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isZoomed = searchParams.get("view") === "maximized";

    const [data, setData] = React.useState(providers);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("All");
    const [selectedProvider, setSelectedProvider] = React.useState<any>(providers[0]);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
    const { addToast } = useUI();

    const handleAddProvider = () => {
        addToast("New provider registered and awaiting credentials verification.", "success");
    };

    const filteredProviders = data.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleZoom = () => {
        const params = new URLSearchParams(searchParams);
        if (isZoomed) {
            params.delete("view");
        } else {
            params.set("view", "maximized");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-10 pb-12 transition-all duration-500">
            {/* Main Title */}
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-primary tracking-tight">Service Provider Management</h1>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-tight">View, verify and manage all service provider accounts</p>
            </div>

            {/* Stats - Conditional Rendering */}
            {!isZoomed && (
                <div className="animate-in fade-in slide-in-from-top duration-500">
                    <ProviderStats />
                </div>
            )}

            {/* Content Grid */}
            <div className={cn(
                "grid gap-8 transition-all duration-700 h-full",
                isZoomed ? "grid-cols-1" : "lg:grid-cols-3"
            )}>
                {/* Table Side */}
                <div className={cn(
                    "transition-all duration-700",
                    isZoomed ? "col-span-1" : "lg:col-span-2"
                )}>
                    <Card className="border border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden h-full">
                        <ProviderFilters
                            isZoomed={isZoomed}
                            onToggleZoom={toggleZoom}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            onAdd={handleAddProvider}
                        />
                        <ProviderTable
                            providers={filteredProviders}
                            selectedId={selectedProvider?.id}
                            onSelect={setSelectedProvider}
                            onEdit={() => setShowEditModal(true)}
                            onDeactivate={() => setShowDeactivateModal(true)}
                        />
                    </Card>
                </div>

                {/* Profile Side - Conditional Rendering */}
                {!isZoomed && (
                    <div className="lg:col-span-1 h-full">
                        <ProviderProfilePanel provider={selectedProvider} />
                    </div>
                )}
            </div>

            {/* Modals for Flow Designs */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Provider Profile"
            >
                <div className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
                        <UserIcon size={40} />
                    </div>
                    <p className="text-slate-500 font-medium">Update the information for <span className="text-primary font-bold">{selectedProvider?.name}</span>. This will reflect across all system records.</p>
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="amber" className="flex-1 h-14 rounded-2xl font-bold">Save Changes</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                title="Account Deactivation"
            >
                <div className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                        <Plus size={40} className="rotate-45" />
                    </div>
                    <p className="text-slate-500 font-medium">Are you sure you want to deactivate <span className="text-rose-500 font-bold">{selectedProvider?.name}</span>? They will lose access to all portal features immediately.</p>
                    <div className="flex gap-4 pt-4">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={() => setShowDeactivateModal(false)}>Keep Active</Button>
                        <Button className="flex-1 h-14 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600">Yes, Deactivate</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
