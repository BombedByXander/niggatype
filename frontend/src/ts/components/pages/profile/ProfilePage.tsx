import { PersonalBests } from "@monkeytype/schemas/shared";
import { RankAndCount } from "@monkeytype/schemas/users";
import { useQuery } from "@tanstack/solid-query";
import { formatDate } from "date-fns/format";
import { createMemo, createSignal, For, JSXElement, Show } from "solid-js";
import { createStore } from "solid-js/store";

import Page, { PageName } from "../../../pages/page";
import { getUserProfile } from "../../../queries/profile";
import { getConfig } from "../../../signals/config";
import { getActivePage } from "../../../signals/core";
import { qsr } from "../../../utils/dom";
import { Formatting } from "../../../utils/format";
import { formatTopPercentage } from "../../../utils/misc";
import * as Skeleton from "../../../utils/skeleton";
import AsyncContent from "../../common/AsyncContent";
import { Conditional } from "../../common/Conditional";

import { ActivityCalendar } from "./ActivityCalendar";
import { UserDetails } from "./UserDetails";

const [currentName, setCurrentName] = createSignal<string | undefined>(
  "user_50",
);

//TODO
const pageName: PageName = "about";
export function ProfilePage(): JSXElement {
  const isOpen: () => boolean = () => getActivePage() === pageName;

  const profileQuery = useQuery(() => ({
    ...getUserProfile(currentName() as string),
    enabled: isOpen() && currentName() !== undefined,
  }));

  return (
    <AsyncContent query={profileQuery}>
      {(profile) => (
        <div class="flex flex-col gap-8">
          <div class="rounded bg-sub-alt">
            <UserDetails profile={profile} />
          </div>
          <Show when={!profile.banned && !profile.lbOptOut}>
            <LeaderboardPosition
              top15={profile.allTimeLbs?.time?.["15"]?.["english"]}
              top60={profile.allTimeLbs?.time?.["60"]?.["english"]}
            />
          </Show>
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <PbTable
              mode="time"
              mode2={["15", "30", "60", "120"]}
              pbs={profile.personalBests.time}
            />
            <PbTable
              mode="words"
              mode2={["10", "25", "50", "100"]}
              pbs={profile.personalBests.words}
            />
          </div>
          <Show when={profile.lbOptOut}>
            <span class="text-center text-xs text-sub">
              Note: This account has opted out of the leaderboards, meaning
              their results aren&apos;t verified by the anticheat system and may
              not be legitimate.
            </span>
          </Show>
          <ActivityCalendar noSelect testActivity={profile.testActivity} />
        </div>
      )}
    </AsyncContent>
  );
}

function LeaderboardPosition(props: {
  top15?: RankAndCount;
  top60?: RankAndCount;
}): JSXElement {
  const format = createMemo(() => new Formatting(getConfig));

  return (
    <div class="grid w-full grid-cols-1 items-center gap-4 rounded bg-sub-alt p-4 text-sub md:grid-cols-2 lg:grid-cols-3">
      <span class="text-center md:col-span-2 lg:col-span-1">
        All-Time English Leaderboards
      </span>
      <Show when={props.top15 !== undefined}>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="justify-self-end">15 seconds</div>
          <div class="row-span-2 text-3xl text-text">
            {format().rank(props.top15?.rank)}
          </div>
          <div class="justify-self-end text-xs">
            {formatTopPercentage(props.top15)}
          </div>
        </div>
      </Show>
      <Show when={props.top60 !== undefined}>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="justify-self-end">60 seconds</div>
          <div class="row-span-2 text-3xl text-text">
            {format().rank(props.top60?.rank)}
          </div>
          <div class="justify-self-end text-xs">
            {formatTopPercentage(props.top60)}
          </div>
        </div>
      </Show>
    </div>
  );
}

function PbTable<M extends "time" | "words">(props: {
  mode: M;
  mode2: string[];
  pbs: PersonalBests[M];
}): JSXElement {
  const [showDetails, setShowDetails] = createStore<Record<string, boolean>>(
    {},
  );
  const format = createMemo(() => new Formatting(getConfig));

  const bests = createMemo(() =>
    props.mode2.map((it) => ({
      mode2: it,
      pb: (props.pbs[it] ?? []).sort((a, b) => b.wpm - a.wpm)[0],
    })),
  );

  return (
    <div class="grid grid-cols-2 gap-8 rounded bg-sub-alt p-4 md:grid-cols-4">
      <For each={bests()}>
        {(item) => (
          <div
            class="flex flex-col items-center gap-2 text-xs"
            classList={{
              "-m-2 leading-none": showDetails[item.mode2],
            }}
            onMouseEnter={() => setShowDetails(item.mode2, true)}
            onMouseLeave={() => setShowDetails(item.mode2, false)}
          >
            <Conditional
              if={!showDetails[item.mode2]}
              then={
                <>
                  <div class="text-xs text-sub">
                    {item.mode2} {props.mode === "time" ? "seconds" : "words"}
                  </div>
                  <div class="text-4xl">
                    {format().typingSpeed(item.pb?.wpm, {
                      showDecimalPlaces: false,
                    })}
                  </div>
                  <div class="text-xl">
                    {format().accuracy(item.pb?.acc, {
                      showDecimalPlaces: false,
                    })}
                  </div>
                </>
              }
              else={
                <>
                  <div class="text-xs text-sub">
                    {item.mode2} {props.mode === "time" ? "seconds" : "words"}
                  </div>
                  <div>
                    {format().typingSpeed(item.pb?.wpm)}{" "}
                    {format().typingSpeedUnit}
                  </div>
                  <div>{format().typingSpeed(item.pb?.raw)} raw</div>
                  <div>{format().accuracy(item.pb?.acc)} acc</div>
                  <div>{format().percentage(item.pb?.consistency)} con</div>
                  <div class="text-sub">
                    {formatDate(item.pb?.timestamp ?? 0, "dd MMM yyyy")}
                  </div>
                </>
              }
            />
          </div>
        )}
      </For>
    </div>
  );
}

export const skeletonPage = new Page({
  id: "profile",
  element: qsr(".page.pageProfile"),
  path: "/profile",
  afterHide: async (): Promise<void> => {
    Skeleton.remove("pageProfile");
  },
  beforeShow: async (options): Promise<void> => {
    Skeleton.append("pageProfile", "main");
    const userName = options.params?.["uidOrName"];
    console.log("### before show", userName);
    setCurrentName(userName);
  },
});

/*
onDOMReady(() => {
  Skeleton.save("pageProfile");
});
*/
