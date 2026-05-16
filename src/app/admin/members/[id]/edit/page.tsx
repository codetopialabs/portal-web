"use client";

import { ChevronLeft, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMember, useUpdateAdminMember } from "@/hooks/useAdmin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toList(value: string) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function toCommaList(values: string[]) {
    return values.join(", ");
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function MemberEditForm({ id }: { id: string }) {
    const router = useRouter();
    const { data: member, isLoading, isError } = useAdminMember(id);
    const { mutate: updateMember, isPending } = useUpdateAdminMember();

    const [initialized, setInitialized] = useState(false);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [discordUsername, setDiscordUsername] = useState("");
    const [githubHandle, setGithubHandle] = useState("");
    const [twitterHandle, setTwitterHandle] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [primaryGoal, setPrimaryGoal] = useState("");
    const [communityGoals, setCommunityGoals] = useState("");
    const [memberStatus, setMemberStatus] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [errors, setErrors] = useState<{ fullName?: string; form?: string }>({});

    useEffect(() => {
        if (member && !initialized) {
            setFullName(member.fullName ?? "");
            setBio(member.bio ?? "");
            setDiscipline(member.discipline ?? "");
            setExperienceLevel(member.experienceLevel ?? "");
            setSkills(toCommaList(member.skills ?? []));
            setLocation(member.location ?? "");
            setDiscordUsername(member.discordUsername ?? "");
            setGithubHandle(member.githubHandle ?? "");
            setTwitterHandle(member.twitterHandle ?? "");
            setLinkedinUrl(member.linkedinUrl ?? "");
            setWebsiteUrl(member.websiteUrl ?? "");
            setPrimaryGoal(member.primaryGoal ?? "");
            setCommunityGoals(toCommaList(member.communityGoals ?? []));
            setMemberStatus(member.memberStatus ?? "");
            setCurrentRole(member.currentRole ?? "");
            setInitialized(true);
        }
    }, [member, initialized]);

    function validate(): boolean {
        const next: typeof errors = {};
        if (!fullName.trim()) {
            next.fullName = "Full name is required.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        updateMember(
            {
                id,
                data: {
                    fullName: fullName.trim(),
                    bio: bio.trim() || undefined,
                    discipline: discipline.trim() || undefined,
                    experienceLevel: experienceLevel.trim() || undefined,
                    skills: toList(skills),
                    location: location.trim() || undefined,
                    discordUsername: discordUsername.trim().replace(/^@/, "") || undefined,
                    githubHandle: githubHandle.trim() || undefined,
                    twitterHandle: twitterHandle.trim() || undefined,
                    linkedinUrl: linkedinUrl.trim() || undefined,
                    websiteUrl: websiteUrl.trim() || undefined,
                    primaryGoal: primaryGoal.trim() || undefined,
                    communityGoals: toList(communityGoals),
                    memberStatus: memberStatus.trim() || undefined,
                    currentRole: currentRole.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Member updated successfully.");
                },
                onError: () => {
                    setErrors((prev) => ({
                        ...prev,
                        form: "Failed to update member. Please try again.",
                    }));
                },
            }
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-52 w-full" />
            </div>
        );
    }

    if (isError || !member) {
        return (
            <p className="font-mono text-xs text-red-500">
                Failed to load member details. Please refresh the page.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white border border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                        Member Profile
                    </h2>
                </div>
                <div className="px-6 py-6 space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Full Name
                        </Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                            }}
                            className="font-sans text-sm"
                            aria-invalid={!!errors.fullName}
                        />
                        {errors.fullName && (
                            <p className="font-mono text-xs text-red-500">{errors.fullName}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="bio" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Bio
                        </Label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="discipline" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Discipline
                            </Label>
                            <Input
                                id="discipline"
                                value={discipline}
                                onChange={(e) => setDiscipline(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="experienceLevel" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Experience Level
                            </Label>
                            <Input
                                id="experienceLevel"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="skills" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Skills (comma separated)
                        </Label>
                        <Input
                            id="skills"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="location" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="currentRole" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Current Role
                            </Label>
                            <Input
                                id="currentRole"
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="discordUsername" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Discord Username
                            </Label>
                            <Input
                                id="discordUsername"
                                value={discordUsername}
                                onChange={(e) => setDiscordUsername(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="githubHandle" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                GitHub Handle
                            </Label>
                            <Input
                                id="githubHandle"
                                value={githubHandle}
                                onChange={(e) => setGithubHandle(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="twitterHandle" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Twitter Handle
                            </Label>
                            <Input
                                id="twitterHandle"
                                value={twitterHandle}
                                onChange={(e) => setTwitterHandle(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="linkedinUrl" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                LinkedIn URL
                            </Label>
                            <Input
                                id="linkedinUrl"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="websiteUrl" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Website URL
                            </Label>
                            <Input
                                id="websiteUrl"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="memberStatus" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Member Status
                            </Label>
                            <Input
                                id="memberStatus"
                                value={memberStatus}
                                onChange={(e) => setMemberStatus(e.target.value)}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="primaryGoal" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Primary Goal
                        </Label>
                        <Input
                            id="primaryGoal"
                            value={primaryGoal}
                            onChange={(e) => setPrimaryGoal(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="communityGoals" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Community Goals (comma separated)
                        </Label>
                        <Input
                            id="communityGoals"
                            value={communityGoals}
                            onChange={(e) => setCommunityGoals(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>
                </div>
            </div>

            {errors.form && (
                <p className="font-mono text-xs text-red-500">{errors.form}</p>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="font-mono text-xs uppercase tracking-widest text-white bg-zinc-900 border border-zinc-900 px-6 py-2.5 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isPending ? "Saving…" : "Save Changes"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push(`/admin/members/${id}`)}
                    className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function EditMemberPageContent({ id }: { id: string }) {
    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href={`/admin/members/${id}`}
                    className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Member Details
                </Link>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <User className="w-5 h-5 text-zinc-400" />
                <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
                    Edit Member
                </h1>
            </div>

            <MemberEditForm id={id} />
        </div>
    );
}

export default function EditMemberPage({ params }: { params: { id: string } }) {
    return (
        <RouteGuard permission="members.edit">
            <DashboardShell>
                <EditMemberPageContent id={params.id} />
            </DashboardShell>
        </RouteGuard>
    );
}
