"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BriefcaseMedical,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ProviderStats } from "@/components/providers/ProviderStats";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderTable } from "@/components/providers/ProviderTable";
import { ProviderProfilePanel } from "@/components/providers/ProviderProfilePanel";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/context/UIContext";

interface ProviderRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  sessions: number;
  joinDate: string;
}

const providers: ProviderRecord[] = [
  {
    id: "GHA-101-544-1",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-2",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-3",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-4",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-5",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-6",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
  {
    id: "GHA-101-544-7",
    name: "Dr. Louisa Parker",
    email: "louisaparker@gmail.com",
    phone: "024 000 3241",
    status: "Verified",
    sessions: 15,
    joinDate: "5/11/25",
  },
];

export function ProvidersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isZoomed = searchParams.get("view") === "maximized";

  const [data, setData] = React.useState<ProviderRecord[]>(providers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderRecord | null>(
    providers[0]
  );
  const [showAddProviderModal, setShowAddProviderModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);
  const [providerForm, setProviderForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "Occupational Therapy",
    licenseNumber: "",
  });

  const { addToast } = useUI();

  const handleAddProvider = () => {
    setShowAddProviderModal(true);
  };

  const handleProviderFormChange = (
    field: keyof typeof providerForm,
    value: string
  ) => {
    setProviderForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegisterProvider = (event: React.FormEvent) => {
    event.preventDefault();

    const fullName = `${providerForm.firstName} ${providerForm.lastName}`.trim();
    const newProvider: ProviderRecord = {
      id: `GHA-101-544-${String(data.length + 1).padStart(2, "0")}`,
      name: fullName,
      email: providerForm.email,
      phone: providerForm.phone,
      status: "Pending Review",
      sessions: 0,
      joinDate: new Date().toLocaleDateString("en-GB"),
    };

    setData((current) => [newProvider, ...current]);
    setSelectedProvider(newProvider);
    setShowAddProviderModal(false);
    setProviderForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialty: "Occupational Therapy",
      licenseNumber: "",
    });
    addToast("New provider registered and awaiting credentials verification.", "success");
  };

  const filteredProviders = data.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-primary">
          Service Provider Management
        </h1>
        <p className="text-sm font-bold uppercase tracking-tight text-slate-400">
          View, verify and manage all service provider accounts
        </p>
      </div>

      {!isZoomed && (
        <div className="animate-in fade-in slide-in-from-top duration-500">
          <ProviderStats />
        </div>
      )}

      <div
        className={cn(
          "grid h-full gap-8 transition-all duration-700",
          isZoomed ? "grid-cols-1" : "lg:grid-cols-3"
        )}
      >
        <div
          className={cn(
            "transition-all duration-700",
            isZoomed ? "col-span-1" : "lg:col-span-2"
          )}
        >
          <Card className="h-full overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
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

        {!isZoomed && (
          <div className="h-full lg:col-span-1">
            <ProviderProfilePanel provider={selectedProvider} />
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddProviderModal}
        onClose={() => setShowAddProviderModal(false)}
      >
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black tracking-tight text-primary">
              Register Service Provider
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new provider and begin the verification process.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleRegisterProvider}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                placeholder="e.g. Louisa"
                value={providerForm.firstName}
                onChange={(event) =>
                  handleProviderFormChange("firstName", event.target.value)
                }
                icon={<UserIcon size={18} className="text-slate-400" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="e.g. Parker"
                value={providerForm.lastName}
                onChange={(event) =>
                  handleProviderFormChange("lastName", event.target.value)
                }
                icon={<UserIcon size={18} className="text-slate-400" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="provider@example.com"
                value={providerForm.email}
                onChange={(event) =>
                  handleProviderFormChange("email", event.target.value)
                }
                icon={<Mail size={18} className="text-slate-400" />}
                required
              />
              <Input
                label="Phone Number"
                placeholder="024 000 3241"
                value={providerForm.phone}
                onChange={(event) =>
                  handleProviderFormChange("phone", event.target.value)
                }
                icon={<Phone size={18} className="text-slate-400" />}
                required
              />
              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-slate-700">
                  Specialty
                </label>
                <div className="relative">
                  <BriefcaseMedical
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    aria-label="Provider specialty"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium shadow-sm shadow-slate-200/40 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/5"
                    value={providerForm.specialty}
                    onChange={(event) =>
                      handleProviderFormChange("specialty", event.target.value)
                    }
                  >
                    <option>Occupational Therapy</option>
                    <option>Physiotherapy</option>
                    <option>Speech Therapy</option>
                    <option>Clinical Psychology</option>
                  </select>
                </div>
              </div>
              <Input
                label="License Number"
                placeholder="MDC-22341"
                value={providerForm.licenseNumber}
                onChange={(event) =>
                  handleProviderFormChange("licenseNumber", event.target.value)
                }
                icon={<ShieldCheck size={18} className="text-slate-400" />}
                required
              />
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50"
                onClick={() => setShowAddProviderModal(false)}
              >
                Cancel
              </button>
              <Button type="submit" className="flex-1 font-bold">
                Register Provider
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <div className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.5rem] border border-slate-100 bg-slate-50 text-slate-300">
            <UserIcon size={40} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-primary">
              Edit Provider Profile
            </h2>
            <p className="mt-2 font-medium text-slate-500">
              Update the information for{" "}
              <span className="font-bold text-primary">
                {selectedProvider?.name}
              </span>
              . This will reflect across all system records.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <Button className="flex-1 font-bold">Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
      >
        <div className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.5rem] border border-rose-100 bg-rose-50 text-rose-500">
            <Plus size={40} className="rotate-45" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-primary">
              Account Deactivation
            </h2>
            <p className="mt-2 font-medium text-slate-500">
              Are you sure you want to deactivate{" "}
              <span className="font-bold text-rose-500">
                {selectedProvider?.name}
              </span>
              ? They will lose access to all portal features immediately.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => setShowDeactivateModal(false)}
            >
              Keep Active
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 font-bold text-white transition-colors hover:bg-rose-600"
            >
              Yes, Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}