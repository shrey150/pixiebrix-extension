/*
 * Copyright (C) 2021 PixieBrix, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import pDefer from "p-defer";
import pTimeout from "p-timeout";
import { isExtensionContext } from "webext-detect-page";
import browser, { Runtime } from "webextension-polyfill";
import { forbidContext } from "@/utils/expectContext";
import { JsonValue } from "type-fest";

// eslint-disable-next-line prefer-destructuring -- It breaks EnvironmentPlugin
const CHROME_EXTENSION_ID = process.env.CHROME_EXTENSION_ID;
const CHROME_EXTENSION_STORAGE_KEY = "chrome_extension_id";

/**
 * A storage key managed manually (i.e., not using redux-persist).
 * @see ReduxStorageKey
 */
export type ManualStorageKey = string & {
  _manualStorageKeyBrand: never;
};

/**
 * A storage key managed by redux-persist.
 * @see ManualStorageKey
 */
export type ReduxStorageKey = string & {
  _reduxStorageKeyBrand: never;
};

export class RequestError extends Error {
  readonly response: unknown;

  constructor(message: string, response: unknown) {
    super(message);
    this.name = "RequestError";
    this.response = response;
  }
}

export function isBrowserActionPanel(): boolean {
  return isExtensionContext() && location.pathname === "/action.html";
}

export function setChromeExtensionId(extensionId = ""): void {
  forbidContext("extension");

  extensionId = extensionId.trim();
  if (extensionId) {
    localStorage.removeItem(CHROME_EXTENSION_STORAGE_KEY);
  } else {
    localStorage.setItem(CHROME_EXTENSION_STORAGE_KEY, extensionId);
  }
}

export function getChromeExtensionId(): string {
  forbidContext("extension");

  return (
    localStorage.getItem(CHROME_EXTENSION_STORAGE_KEY) ?? CHROME_EXTENSION_ID
  );
}

export async function getExtensionVersion() {
  return browser.runtime.getManifest().version;
}

/**
 * Connect to the background page and throw real errors if the connection fails.
 * NOTE: To determine whether the connection was successful, the background page
 * needs to send one message back within a second.
 * */
export async function runtimeConnect(name: string): Promise<Runtime.Port> {
  forbidContext("background");

  const { resolve, reject, promise: connectionPromise } = pDefer();

  const onDisconnect = () => {
    // If the connection fails, the error will only be available on this callback
    // TODO: Also handle port.error in Firefox https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port#type
    const message =
      chrome.runtime.lastError?.message ??
      "There was an error while connecting to the runtime";
    reject(new Error(message));
  };

  const port = browser.runtime.connect(null, { name });
  port.onMessage.addListener(resolve); // Any message is accepted
  port.onDisconnect.addListener(onDisconnect);

  try {
    // The timeout is to avoid hanging if the background isn't set up to respond immediately
    await pTimeout(
      connectionPromise,
      1000,
      "The background page hasn’t responded in time"
    );
    return port;
  } finally {
    port.onMessage.removeListener(resolve);
    port.onDisconnect.removeListener(onDisconnect);
  }
}

export class RuntimeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeNotFoundError";
  }
}

export async function readStorage<T = unknown>(
  storageKey: ManualStorageKey,
  defaultValue?: T
): Promise<T | undefined> {
  // `browser.storage.local` is supposed to have a signature that takes an object that includes default values.
  // On Chrome 93.0.4577.63 that signature appears to return the defaultValue even when the value is set?
  const result = await browser.storage.local.get(storageKey);

  if (Object.prototype.hasOwnProperty.call(result, storageKey)) {
    // eslint-disable-next-line security/detect-object-injection -- Just checked with hasOwnProperty
    return result[storageKey];
  }

  return defaultValue;
}

export async function readReduxStorage<T extends JsonValue = JsonValue>(
  storageKey: ReduxStorageKey,
  defaultValue?: T
): Promise<T | undefined> {
  // `browser.storage.local` is supposed to have a signature that takes an object that includes default values.
  // On Chrome 93.0.4577.63 that signature appears to return the defaultValue even when the value is set?
  const result = await browser.storage.local.get(storageKey);

  if (Object.prototype.hasOwnProperty.call(result, storageKey)) {
    // eslint-disable-next-line security/detect-object-injection -- Just checked with hasOwnProperty
    const value = result[storageKey];
    if (typeof value === "string") {
      return JSON.parse(value);
    }

    if (value !== undefined) {
      console.warn("Expected JSON-stringified value for key %s", storageKey, {
        value,
      });
    }
  }

  return defaultValue;
}

export async function setStorage(
  storageKey: ManualStorageKey,
  value: unknown
): Promise<void> {
  await browser.storage.local.set({ [storageKey]: value });
}

export async function setReduxStorage<T extends JsonValue = JsonValue>(
  storageKey: ReduxStorageKey,
  value: T
): Promise<void> {
  await browser.storage.local.set({ [storageKey]: JSON.stringify(value) });
}
