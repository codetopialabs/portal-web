"use client";

import { Bold, Eye, Heading1, Heading2, Heading3, Italic, Link2, Moon, Sun } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendEmail } from "@/hooks/useEmails";
import { getAvatarUrl } from "@/lib/utils";
import { EmailsService } from "@/services/emails.service";
import type { AdminMember } from "@/types/users.types";

const VARIABLES: { token: string; label: string }[] = [
  { token: "{{name}}", label: "Name" },
  { token: "{{email}}", label: "Email" },
  { token: "{{username}}", label: "Username" },
];

function wrapSelection(
  el: HTMLTextAreaElement,
  before: string,
  after: string,
  value: string,
  onChange: (next: string) => void
) {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "text";
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + before.length, start + before.length + selected.length);
  });
}

function insertAtCursor(
  el: HTMLTextAreaElement,
  token: string,
  value: string,
  onChange: (next: string) => void
) {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const next = value.slice(0, start) + token + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + token.length, start + token.length);
  });
}

const HEADING_PREFIX_RE = /^#{1,3}\s+/;

// Toggles a "# "/"## "/"### " prefix on the current line — clicking the same
// level again removes it, clicking a different level swaps it.
function toggleHeadingPrefix(
  el: HTMLTextAreaElement,
  hashes: string,
  value: string,
  onChange: (next: string) => void
) {
  const pos = el.selectionStart ?? value.length;
  const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
  const restOfLine = value.slice(lineStart);
  const existing = restOfLine.match(HEADING_PREFIX_RE);
  const existingLength = existing ? existing[0].length : 0;
  const isSamePrefix = existing?.[0] === `${hashes} `;

  const newPrefix = isSamePrefix ? "" : `${hashes} `;
  const next = value.slice(0, lineStart) + newPrefix + value.slice(lineStart + existingLength);
  const cursorOffset = pos - existingLength + newPrefix.length;

  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(cursorOffset, cursorOffset);
  });
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  recipients,
  audienceSummary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: AdminMember[];
  audienceSummary?: string;
}) {
  const sendEmail = useSendEmail();
  const [step, setStep] = useState<"compose" | "preview" | "confirm">("compose");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewHtml, setPreviewHtml] = useState<{ light: string; dark: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const reset = () => {
    setStep("compose");
    setSubject("");
    setBody("");
    setPreviewHtml(null);
    setPreviewMode("light");
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const handleReview = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Add a subject and a message before sending.");
      return;
    }
    setStep("confirm");
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const html = await EmailsService.preview(subject, body);
      setPreviewHtml(html);
      setStep("preview");
    } catch {
      /* axios interceptor already showed the toast */
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSend = async () => {
    try {
      const result = await sendEmail.mutateAsync({
        subject: subject.trim(),
        body,
        recipientIds: recipients.map((m) => m.id),
        audienceSummary,
      });
      toast.success(
        `Sent to ${result.recipientCount} member${result.recipientCount === 1 ? "" : "s"}.`
      );
      close();
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  const format = (before: string, after: string) => {
    const el = bodyRef.current;
    if (!el) return;
    wrapSelection(el, before, after, body, setBody);
  };

  const toggleHeading = (hashes: string) => {
    const el = bodyRef.current;
    if (!el) return;
    toggleHeadingPrefix(el, hashes, body, setBody);
  };

  const insertVariable = (token: string) => {
    const el = bodyRef.current;
    if (!el) return;
    insertAtCursor(el, token, body, setBody);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className={step === "preview" ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        {step === "compose" ? (
          <>
            <DialogHeader>
              <DialogTitle>Email members</DialogTitle>
              <DialogDescription>
                {audienceSummary
                  ? `Sending to everyone matching your current filter — ${audienceSummary}.`
                  : `Sending to ${recipients.length} member${recipients.length === 1 ? "" : "s"}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="border border-grey-200 bg-grey-50 px-3 py-2 font-mono text-xs font-bold text-text-secondary">
              {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Subject
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Upcoming community event"
                  className="h-9 rounded-none font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Message
                  </Label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Heading 1"
                      onClick={() => toggleHeading("#")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Heading1 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => toggleHeading("##")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Heading2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Heading 3"
                      onClick={() => toggleHeading("###")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Heading3 className="h-3 w-3" />
                    </button>
                    <span className="mx-1 h-4 w-px bg-grey-200" />
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => format("**", "**")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Bold className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => format("*", "*")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Italic className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      title="Link"
                      onClick={() => format("[", "](https://)")}
                      className="grid h-6 w-6 place-items-center border border-grey-200 text-text-secondary hover:border-grey-900 hover:text-grey-900"
                    >
                      <Link2 className="h-3 w-3" />
                    </button>
                    <span className="mx-1 h-4 w-px bg-grey-200" />
                    {VARIABLES.map((v) => (
                      <button
                        key={v.token}
                        type="button"
                        title={`Insert ${v.label}`}
                        onClick={() => insertVariable(v.token)}
                        className="h-6 border border-grey-200 px-1.5 font-mono text-[9px] font-bold text-text-secondary hover:border-grey-900 hover:text-grey-900"
                      >
                        {v.token}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  className="w-full border border-grey-200 bg-white p-3 font-mono text-xs text-text-secondary outline-none focus:border-grey-900 resize-none"
                  placeholder="Write your message. Blank lines start a new paragraph. {{name}} etc. also works in the subject."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none font-mono text-xs"
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none font-mono text-xs"
                onClick={() => handlePreview()}
                disabled={previewLoading}
              >
                <Eye className="h-3.5 w-3.5" />
                {previewLoading ? "Loading…" : "Preview"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-none font-mono text-xs font-bold"
                onClick={handleReview}
              >
                Review & send
              </Button>
            </DialogFooter>
          </>
        ) : step === "preview" ? (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle>Preview</DialogTitle>
              <DialogDescription>
                Variables are filled with{" "}
                <span className="font-bold text-text-primary">your own info</span> as a stand-in for
                each recipient's.
              </DialogDescription>
            </DialogHeader>
            <div className="inline-flex self-start border border-grey-200">
              <button
                type="button"
                onClick={() => setPreviewMode("light")}
                className={`flex h-8 items-center gap-1.5 px-3 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  previewMode === "light"
                    ? "bg-grey-900 text-white"
                    : "text-text-secondary hover:bg-grey-50"
                }`}
              >
                <Sun className="h-3 w-3" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("dark")}
                className={`flex h-8 items-center gap-1.5 border-l border-grey-200 px-3 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  previewMode === "dark"
                    ? "bg-grey-900 text-white"
                    : "text-text-secondary hover:bg-grey-50"
                }`}
              >
                <Moon className="h-3 w-3" />
                Dark
              </button>
            </div>
            <div
              className={`h-[420px] overflow-hidden border border-grey-200 ${previewMode === "dark" ? "bg-zinc-950" : "bg-grey-50"}`}
            >
              {previewHtml && (
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml[previewMode]}
                  sandbox=""
                  className={`h-full w-full border-0 ${previewMode === "dark" ? "bg-zinc-950" : "bg-white"}`}
                />
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none font-mono text-xs"
                onClick={() => setStep("compose")}
              >
                Back to edit
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-none font-mono text-xs font-bold"
                onClick={handleReview}
              >
                Review & send
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm send</DialogTitle>
              <DialogDescription>
                This will send "{subject}" to {recipients.length} member
                {recipients.length === 1 ? "" : "s"}. Variables like {"{{name}}"} will be replaced
                with each recipient's own info.
              </DialogDescription>
            </DialogHeader>
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {recipients.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-2.5 border border-grey-200 bg-white p-2"
                >
                  <NextImage
                    src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                    alt={member.fullName}
                    width={28}
                    height={28}
                    className="border border-grey-200 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-bold text-text-primary">
                      {member.fullName}
                    </p>
                    <p className="truncate font-mono text-[10px] text-text-muted">
                      @{member.username} · {member.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none font-mono text-xs"
                onClick={() => setStep("compose")}
                disabled={sendEmail.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-none font-mono text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                onClick={handleConfirmSend}
                disabled={sendEmail.isPending}
              >
                {sendEmail.isPending ? "Sending…" : `Confirm — send to ${recipients.length}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
