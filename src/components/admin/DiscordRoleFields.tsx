"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DiscordRoleValues {
  discordRoleId: string;
  color: string;
  synced: boolean;
}

// Discord role IDs are long numbers; a name pasted by mistake is caught here.
const SNOWFLAKE = /^\d{15,32}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;

export function discordRoleErrors(values: DiscordRoleValues): {
  discordRoleId?: string;
  color?: string;
} {
  const errors: { discordRoleId?: string; color?: string } = {};
  const id = values.discordRoleId.trim();
  if (id && !SNOWFLAKE.test(id)) {
    errors.discordRoleId = "Paste the role ID, a long number, not the role name.";
  }
  if (values.color && !HEX.test(values.color)) {
    errors.color = "Use a hex code such as #f5c518.";
  }
  return errors;
}

/**
 * The Discord part of a role form. Shown only while role sync is on: the
 * role is kept the same on the portal and on Discord, and what it can see on
 * Discord is still set in Discord.
 */
export function DiscordRoleFields({
  values,
  onChange,
  errors,
  isNew,
}: {
  values: DiscordRoleValues;
  onChange: (next: DiscordRoleValues) => void;
  errors: { discordRoleId?: string; color?: string };
  isNew: boolean;
}) {
  const set = (patch: Partial<DiscordRoleValues>) => onChange({ ...values, ...patch });

  return (
    <section className="border border-grey-200 bg-white">
      <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
        <h2 className="font-sans text-base font-bold text-text-primary">Discord</h2>
      </div>
      <div className="space-y-6 p-5">
        <label className="flex cursor-pointer items-start gap-3 border border-grey-200 p-3 hover:bg-grey-50">
          <input
            type="checkbox"
            checked={values.synced}
            onChange={(e) => set({ synced: e.target.checked })}
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          <div>
            <p className="font-mono text-xs font-bold text-text-primary">
              Keep in step with Discord
            </p>
            <p className="mt-1 font-mono text-[11px] leading-5 text-text-muted">
              Giving or removing this role here does the same on Discord, and the other way round.
              Turn off for roles nobody should get from the portal, such as Moderator.
            </p>
          </div>
        </label>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="discordRoleId"
              className="font-mono text-xs font-medium text-text-muted"
            >
              Discord role ID{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <Input
              id="discordRoleId"
              value={values.discordRoleId}
              onChange={(e) => set({ discordRoleId: e.target.value })}
              placeholder="123456789012345678"
              inputMode="numeric"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              aria-invalid={!!errors.discordRoleId}
              aria-describedby="discordRoleId-hint"
            />
            <p
              id="discordRoleId-hint"
              className={`font-mono text-[10px] ${errors.discordRoleId ? "text-error-600" : "text-text-muted"}`}
            >
              {errors.discordRoleId ??
                (values.synced && !values.discordRoleId.trim()
                  ? isNew
                    ? "Leave empty and Vector makes the role on Discord."
                    : "Empty: saving asks Vector to make the role on Discord."
                  : "To use a role that already exists on Discord, paste its ID.")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleColor" className="font-mono text-xs font-medium text-text-muted">
              Colour{" "}
              <span className="font-mono text-[10px] normal-case tracking-normal text-text-muted">
                (optional)
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick a colour"
                value={HEX.test(values.color) ? values.color : "#99aab5"}
                onChange={(e) => set({ color: e.target.value })}
                className="h-10 w-12 shrink-0 cursor-pointer border border-grey-300 bg-white p-1"
              />
              <Input
                id="roleColor"
                value={values.color}
                onChange={(e) => set({ color: e.target.value.trim() })}
                placeholder="#f5c518"
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
                aria-invalid={!!errors.color}
                aria-describedby="roleColor-hint"
              />
            </div>
            <p
              id="roleColor-hint"
              className={`font-mono text-[10px] ${errors.color ? "text-error-600" : "text-text-muted"}`}
            >
              {errors.color ??
                (values.color ? "Shown on Discord." : "Empty: Discord's default colour.")}
            </p>
          </div>
        </div>

        <p className="font-mono text-[11px] leading-5 text-text-muted">
          Which channels this role can see is set in Discord's channel permissions, not here.
        </p>
      </div>
    </section>
  );
}
