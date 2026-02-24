import {
  TypingStats as TypingStatsType,
  UserProfile,
  UserProfileDetails,
} from "@monkeytype/schemas/users";
import { differenceInDays } from "date-fns/differenceInDays";
import { formatDate } from "date-fns/format";
import { For, JSXElement, Show } from "solid-js";

import { isFriend } from "../../../db";
import { secondsToString } from "../../../utils/date-and-time";
import { formatXp, getXpDetails, XPDetails } from "../../../utils/levels";
import { AutoShrink } from "../../common/AutoShrink";
import { Button } from "../../common/Button";
import { DiscordAvatar } from "../../common/DiscordAvatar";
import { UserBadge, UserFlags } from "../../common/User";

export function UserDetails(props: { profile: UserProfile }): JSXElement {
  return (
    <div class="grid grid-cols-[1fr_minmax(0,2rem)]">
      <div class="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-[1.25fr_auto_1.25fr] lg:grid-cols-[17.5rem_auto_1fr_auto_2fr_auto_auto]">
        <div class="lg:order-first">
          <AvatarAndName profile={props.profile} />
        </div>
        <div class="hidden h-full w-2 rounded bg-bg md:block lg:order-2"></div>
        <div class="lg:order-5">
          <Show when={!props.profile.banned}>
            <BioAndKeyboard details={props.profile.details} />
          </Show>
        </div>
        <div class="hidden h-full w-2 rounded bg-bg lg:order-3 lg:block"></div>
        <div class="col-span-1 md:col-span-3 lg:order-2">
          <TypingStats typingStats={props.profile.typingStats} />
        </div>
        <div class="hidden h-full w-2 rounded bg-bg lg:order-6 lg:block"></div>
        <div class="lg:order-last">
          <Show when={!props.profile.banned}>
            <Socials socials={props.profile.details?.socialProfiles} />
          </Show>
        </div>
      </div>

      <div class="h-full rounded-r hover:bg-text hover:text-bg">
        <div>X</div>
      </div>
    </div>
  );
}

function AvatarAndName(props: { profile: UserProfile }): JSXElement {
  const accountAgeHint = (): string => {
    const creationDate = new Date(props.profile.addedAt);
    const diffDays = differenceInDays(new Date(), creationDate);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  function formatStreak(length: number): string {
    return `${length} ${length === 1 ? "day" : "days"}`;
  }

  return (
    <div class="grid w-full grid-cols-[5rem_1fr] items-center gap-4 self-center text-sub">
      <DiscordAvatar
        class="text-[5rem] text-sub"
        size={256}
        discordAvatar={props.profile.discordAvatar}
        discordId={props.profile.discordId}
      />

      <div class="flex h-full flex-col gap-1 text-xs [&>div]:w-fit">
        <AutoShrink class="flex text-text [&>div]:px-1 [&>div>i]:text-sub">
          {props.profile.name}

          <UserFlags
            {...props.profile}
            isFriend={isFriend(props.profile.uid)}
          />
        </AutoShrink>
        <UserBadge
          id={props.profile.inventory?.badges.find((it) => it.selected)?.id}
        />
        <For
          each={props.profile.inventory?.badges
            .filter((it) => !it.selected)
            .map((it) => it.id)}
        >
          {(badgeId) => <UserBadge id={badgeId} iconOnly />}
        </For>
        <span aria-label={accountAgeHint()} data-balloon-pos="up">
          Joined {formatDate(props.profile.addedAt ?? 0, "dd MMM yyyy")}
        </span>
        <Show when={props.profile.streak ?? 0 > 1}>
          <span
            aria-label={
              "Longest streak: " + formatStreak(props.profile.maxStreak)
            }
            data-balloon-pos="up"
          >
            Current streak {formatStreak(props.profile.streak)}
          </span>
        </Show>
      </div>

      <LevelAndBar xp={props.profile.xp} />
    </div>
  );
}

function LevelAndBar(props: { xp?: number }): JSXElement {
  const xpDetails = (): XPDetails => getXpDetails(props.xp ?? 0);
  const bar = (): string =>
    ((xpDetails().levelCurrentXp / xpDetails().levelMaxXp) * 100).toFixed(2) +
    "%";

  return (
    <div class="col-span-2 flex w-full items-center gap-2">
      <div
        class="shrink-0 text-text"
        data-balloon-pos="up"
        aria-label={formatXp(props.xp ?? 0) + " total xp"}
      >
        {xpDetails().level}
      </div>
      <div
        class="h-2 flex-1 rounded bg-sub"
        data-balloon-pos="up"
        aria-label={bar()}
      >
        <div
          class="h-2 rounded bg-main"
          style={{
            width: bar(),
          }}
        >
          &nbsp;
        </div>
      </div>
      <div
        class="shrink-0"
        data-balloon-pos="up"
        aria-label={
          formatXp(xpDetails().levelMaxXp - xpDetails().levelCurrentXp) +
          " xp until next level"
        }
      >
        {formatXp(xpDetails().levelCurrentXp)}/
        {formatXp(xpDetails().levelMaxXp)}{" "}
      </div>
    </div>
  );
}

function BioAndKeyboard(props: { details?: UserProfileDetails }): JSXElement {
  return (
    <div class="grid h-full grid-rows-2 text-xs">
      <div>
        <div class="text-sub">bio</div>
        <div>{props.details?.bio}</div>
      </div>

      <div>
        <div class="text-sub">keyboard</div>
        <div>{props.details?.keyboard}</div>
      </div>
    </div>
  );
}

function TypingStats(props: { typingStats: TypingStatsType }): JSXElement {
  return (
    <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4 sm:grid-cols-3 lg:flex lg:flex-col">
      <div class="flex flex-col">
        <div class="text-xs text-sub">tests started</div>
        <div class="text-2xl">{props.typingStats.startedTests}</div>
      </div>
      <div class="flex flex-col">
        <div class="text-xs text-sub">tests completed</div>
        <div class="text-2xl">{props.typingStats.completedTests}</div>
      </div>
      <div class="flex flex-col">
        <div class="text-xs text-sub">time typing</div>
        <div class="text-2xl">
          {secondsToString(
            Math.round(props.typingStats.timeTyping ?? 0),
            true,
            true,
          )}
        </div>
      </div>
    </div>
  );
}

function Socials(props: {
  socials?: UserProfileDetails["socialProfiles"];
}): JSXElement {
  return (
    <div class="">
      <div class="text-xs text-sub lg:hidden">socials</div>
      <div class="flex text-2xl text-text lg:flex-col [&>a]:text-text [&>a]:hover:text-main">
        <Show when={props.socials?.github}>
          <Button
            type="text"
            fa={{ icon: "fa-github", variant: "brand", fixedWidth: true }}
            href={`https://github.com/${props.socials?.github}`}
          />
        </Show>
        <Show when={props.socials?.twitter}>
          <Button
            type="text"
            fa={{ icon: "fa-twitter", variant: "brand", fixedWidth: true }}
            href={`https://x.com/${props.socials?.twitter}`}
          />
        </Show>
        <Show when={props.socials?.website}>
          <Button
            type="text"
            fa={{ icon: "fa-globe", fixedWidth: true }}
            href={props.socials?.website ?? ""}
          />
        </Show>
      </div>
    </div>
  );
}
