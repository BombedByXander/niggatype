import { TestActivity } from "@monkeytype/schemas/users";
import { JSXElement, onMount } from "solid-js";

import {
  clear as clearTestActivity,
  init as initTestActivity,
} from "../../../elements/test-activity";
import { TestActivityCalendar } from "../../../elements/test-activity-calendar";
import { useRefWithUtils } from "../../../hooks/useRefWithUtils";
import { getFirstDayOfTheWeek } from "../../../utils/date-and-time";

const firstDayOfTheWeek = getFirstDayOfTheWeek();

export function ActivityCalendar(props: {
  noSelect?: true;
  testActivity?: TestActivity;
}): JSXElement {
  // Refs are assigned by SolidJS via the ref attribute
  const [elementRef, element] = useRefWithUtils<HTMLElement>();

  let calendar: TestActivityCalendar | undefined;

  onMount(() => {
    if (props.testActivity !== undefined && element() !== undefined) {
      calendar = new TestActivityCalendar(
        props.testActivity.testsByDays,
        new Date(props.testActivity.lastDay),
        firstDayOfTheWeek,
      );
      // oxlint-disable-next-line typescript/no-non-null-assertion
      initTestActivity(element()!.native, calendar);

      if (props.noSelect) {
        // oxlint-disable-next-line typescript/no-non-null-assertion
        const title = element()!.qsr(".top .title");
        title.appendHtml(" in last 12 months");
      }
    } else {
      calendar = undefined;
      clearTestActivity(element()?.native);
    }
  });

  return (
    <div class="testActivity" ref={elementRef}>
      <div class="wrapper">
        <div class="top">
          <div class="title"></div>
          <div class="legend">
            <span>less</span>
            <div data-level="0"></div>
            <div data-level="1"></div>
            <div data-level="2"></div>
            <div data-level="3"></div>
            <div data-level="4"></div>
            <span>more</span>
          </div>
        </div>
        <div class="activity"></div>
        <div class="months"></div>
        <div class="daysFull"></div>
        <div class="days"></div>
        <div class="nodata hidden">No data found.</div>
        <div class="note">Note: All activity data is using UTC time.</div>
      </div>
    </div>
  );
}
