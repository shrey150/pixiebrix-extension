/*
 * Copyright (C) 2021 Pixie Brix, LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { isBackgroundPage } from "webext-detect-page";
import { browser, Runtime } from "webextension-polyfill-ts";
import { allowBackgroundSender } from "@/background/protocol";
import { runBrowserAction } from "@/contentScript/browserActions";

export const MESSAGE_PREFIX = "@@pixiebrix/browserAction/";

export const RUN_ACTION_PANEL = `${MESSAGE_PREFIX}RUN_ACTION_PANEL`;

type ActionPanelRequest = {
  type: typeof RUN_ACTION_PANEL;
  payload: {
    extensionId: string;
    extensionPointId: string;
  };
};

function handler(
  request: ActionPanelRequest,
  sender: Runtime.MessageSender
): Promise<any> {
  if (allowBackgroundSender(sender)) {
    if (request.type === RUN_ACTION_PANEL) {
      console.log("Action Panel Sender", { sender });

      const { extensionId, extensionPointId } = request.payload;

      return browser.tabs.query({ active: true }).then((tabs) => {
        const tab = tabs[0];
        const target = { tabId: tab.id, frameId: 0 };
        return runBrowserAction(target, { extensionId, extensionPointId });
      });
    }
  }
}

if (isBackgroundPage()) {
  browser.runtime.onMessage.addListener(handler);
}
