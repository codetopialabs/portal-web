import type { FieldHintContent } from "@/components/ui/field-hint";

/**
 * Copy for the "?" hints on the profile settings form. Kept in one place so
 * the wording can be edited without touching the form markup.
 *
 * Rule of thumb for each entry: `what` says what the field is, `why` says
 * where the value actually shows up or gets used — a member who knows their
 * bio is the first thing on their public profile writes a better bio than one
 * who thinks it is a throwaway box.
 */
export const PROFILE_FIELD_HINTS = {
  primaryTeam: {
    title: "Primary team",
    what: "The community team you want to help in: Events, Projects & Tech, Comms & Brand, Operations or Partnerships.",
    why: "Its lead sees you on their roster and can offer you a role card. You can change it any time. Leave it empty to stay in the contributor pool and pick up one-off tasks.",
  },
  secondaryTeam: {
    title: "Secondary team",
    what: "A second team you also want to help, if any. Must be different from your primary team.",
    why: "Shows that team's lead you are available too. Most members leave this empty.",
  },
  hoursPerMonth: {
    title: "Hours per month",
    what: "Roughly how much time you can give the community each month.",
    why: "Leads match roles to the time people actually have. Hours are a ceiling, not a floor: nobody is chased for more.",
  },
  recentContribution: {
    title: "Recent contribution",
    what: "What have you done for Codetopia Community in the last 3 months? Hosted, built, posted, answered, mentored, showed up to help.",
    why: "This is the evidence a lead uses when offering core roles. Specific beats general: 'booked the venue and handled 80 RSVPs' says more than 'helped with events'.",
  },
  levelAndRole: {
    title: "Level and role",
    what: "Where you are on the contributor ladder (Member, Contributor, Core team, Lead, Alumni) and the role card you hold, if any.",
    why: "Set by your team's lead, not edited here. Finish a one-off task to become a Contributor; a lead offers Core roles to people who have delivered.",
  },
  avatar: {
    title: "Avatar",
    what: "Your photo across the portal — member directory, teams, reflections, and anywhere you're mentioned.",
    why: "Profiles with a real face get recognised at meetups and get replies. A clear head-and-shoulders shot beats a logo or a group photo.",
  },
  coverImage: {
    title: "Cover image",
    what: "The banner across the top of your public profile.",
    why: "It's the first thing a visitor sees. Something that reflects what you build reads better than an empty grey strip.",
  },
  fullName: {
    title: "Display name",
    what: "The name shown on your profile, your member card, and anywhere you're credited.",
    why: "The directory search matches on this. Use the name people in the community would actually type when looking for you.",
  },
  username: {
    title: "Username",
    what: "Your handle, and the address of your public profile: /your-username.",
    why: "It's the link you share on CVs and applications, so it should stay stable — you can only change it once every 3 months.",
    example: { avoid: "kwame_x99_temp", better: "kwame-mensah" },
  },
  location: {
    title: "Location",
    what: "The city and country you're based in.",
    why: "Directory search matches on location, so this is how members find people nearby for meetups, study groups, and local opportunities.",
    example: { avoid: "Earth", better: "Accra, Ghana" },
  },
  currentRole: {
    title: "Job title / occupation",
    what: "What you do day to day — a job, your studies, or freelance work.",
    why: "It sits under your name in the member directory and gives context a discipline tag can't. Include where, if you're comfortable.",
    example: { avoid: "Dev", better: "Frontend Developer at Acme · CS student at UG" },
  },
  primaryRole: {
    title: "Primary community role",
    what: "Which of the roles you've been assigned in Codetopia leads your profile.",
    why: "Members often hold several roles. This picks the one shown first, so choose the one you want to be known for here.",
  },
  dateOfBirth: {
    title: "Birthday",
    what: "Your date of birth. The day and month are used to celebrate you with the community.",
    why: "Your birth year is never shared publicly and your full date of birth does not appear on your profile.",
  },
  gender: {
    title: "Gender",
    what: "Male or female.",
    why: "Used in aggregate to track how representative the community is and to report to programme partners. It isn't shown on your public profile.",
  },
  nationality: {
    title: "Country",
    what: "The country you hold citizenship in — separate from where you currently live.",
    why: "Used for eligibility on programmes, scholarships, and partner opportunities that are limited to specific countries. Not shown publicly.",
  },
  bio: {
    title: "Bio",
    what: "A short introduction in your own words. It's the first section of your public profile, right under your name.",
    why: "This is what a mentor, a team lead picking collaborators, or a recruiter reads before deciding to reach out. Two or three sentences: what you work on, what you're building or learning now, and what you'd like to be contacted about.",
    example: {
      avoid: "A developer.",
      better:
        "Frontend developer focused on React and design systems. Currently building a booking app for local barbers and learning TypeScript properly. Happy to pair on UI work or review code.",
    },
  },
  discipline: {
    title: "Primary discipline",
    what: "Your main focus area. Pick 'Other' if none of the presets fit and type your own.",
    why: "Used for mentorship pairing and programme recommendations, and shown as a tag on your public profile.",
  },
  experienceLevel: {
    title: "Experience level",
    what: "Roughly where you are in your primary discipline.",
    why: "Members filter the directory by level, and it decides whether you're matched as a mentor or a mentee. Be honest — there's no wrong answer, and overstating it gets you the wrong match.",
  },
  memberStatus: {
    title: "Current status",
    what: "What you're doing right now — studying, employed, job hunting, freelancing, or something else.",
    why: "Lets the community surface the right things to you: openings if you're looking, mentees if you're settled, study groups if you're in school.",
  },
  communityGoals: {
    title: "What you want from the community",
    what: "The outcomes you're here for. Select as many as apply.",
    why: "This drives who you get introduced to and which events, programmes, and opportunities are recommended to you. Leaving it empty means the recommendations are generic.",
  },
  socialLinks: {
    title: "Social links",
    what: "Where your work and your presence live outside Codetopia.",
    why: "These render as buttons on your public profile. A GitHub with recent commits or a portfolio does more for you than any list of skills, and it's how people verify what you've built.",
  },
  skills: {
    title: "Skills",
    what: "The tools, languages, and practices you actually work with.",
    why: "Members filter the directory by skill — this is how you get found for collaborations, teams, and referrals. List what you can be asked about today, not what you plan to learn.",
    example: {
      avoid: "Coding, computers, hard work",
      better: "React · TypeScript · PostgreSQL · Figma",
    },
  },
} satisfies Record<string, FieldHintContent>;
