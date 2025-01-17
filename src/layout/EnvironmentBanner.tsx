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

import React, { useContext } from "react";
import { getExtensionAuth } from "@/auth/token";
import AuthContext from "@/auth/AuthContext";
import { isExtensionContext } from "webext-detect-page";
import { connectPage } from "@/messaging/external";
import { useAsyncState } from "@/hooks/common";
import Banner, { BannerVariant } from "@/components/banner/Banner";

// TODO: don't use process.env here so that we can use the same JS app bundle for all environments
//  see https://github.com/pixiebrix/pixiebrix-app/issues/259
const environment = process.env.ENVIRONMENT;

const variantMap = new Map<string, BannerVariant>([
  [null, "warning"],
  ["", "warning"],
  ["development", "success"],
  ["staging", "info"],
]);

const EnvironmentBannerMessage: React.FunctionComponent = () => {
  const { extension } = useContext(AuthContext);

  const [hostname] = useAsyncState(async () => {
    const { hostname } = await getExtensionAuth();
    return hostname;
  }, [extension]);

  const [versionName] = useAsyncState(async () => {
    const manifest = isExtensionContext()
      ? chrome.runtime.getManifest()
      : await connectPage();
    return manifest.version_name;
  }, [extension]);

  const syncText = hostname
    ? `synced with ${hostname}`
    : "not synced with server";

  return (
    <>
      You are using {extension ? "extension" : "server"}{" "}
      {environment ?? "unknown"} build {versionName ?? "unknown version"}{" "}
      {extension && syncText}
    </>
  );
};

const EnvironmentBanner: React.FunctionComponent = () => {
  if (environment === "production") {
    return null;
  }

  return (
    <Banner variant={variantMap.get(environment)}>
      <EnvironmentBannerMessage />
    </Banner>
  );
};

export default EnvironmentBanner;
