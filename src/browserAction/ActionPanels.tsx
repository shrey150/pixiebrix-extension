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

import React, { useState } from "react";
import { loadOptions } from "@/options/loader";
import extensionPointRegistry from "@/extensionPoints/registry";
import blockRegistry from "@/blocks/registry";
import {
  ActionPanelConfig,
  ActionPanelExtensionPoint,
} from "@/extensionPoints/actionPanelExtension";
import { IExtension, IExtensionPoint } from "@/core";
import { useAsyncState } from "@/hooks/common";
import { Tab, Tabs } from "react-bootstrap";
import { GridLoader } from "react-spinners";
import { RUN_ACTION_PANEL } from "@/background/browserAction/protocol";
import useAsyncEffect from "use-async-effect";
import { browser } from "webextension-polyfill-ts";
import { castArray } from "lodash";
import { Renderer } from "@/types";
import ConsoleLogger from "@/tests/ConsoleLogger";

// import the built-in bricks
import "@/blocks";
import "@/contrib";

type ExtensionPanel = {
  extension: IExtension<ActionPanelConfig>;
  extensionPoint: ActionPanelExtensionPoint;
};

async function getExtensionPoints(): Promise<ExtensionPanel[]> {
  const { extensions: extensionPointConfigs } = await loadOptions();

  const allExtensionPoints = await extensionPointRegistry.all();
  if (!allExtensionPoints.length) {
    console.warn("Extension point registry is empty");
  }

  const result: ExtensionPanel[] = [];

  for (const [extensionPointId, extensions] of Object.entries(
    extensionPointConfigs
  )) {
    let extensionPoint: IExtensionPoint;

    try {
      extensionPoint = await extensionPointRegistry.lookup(extensionPointId);
    } catch (err) {
      console.warn(`Cannot locate extension point ${extensionPointId}`);
    }

    // FIXME: should look to see if extension point is available
    if (extensionPoint instanceof ActionPanelExtensionPoint) {
      const activeExtensions = Object.values(extensions).filter(
        (x) => x.active
      );
      for (const extension of activeExtensions) {
        result.push({
          extension: (extension as unknown) as IExtension<ActionPanelConfig>,
          extensionPoint,
        });
      }
    }
  }

  return result;
}

const ExtensionPanelTab: React.FunctionComponent<{ panel: ExtensionPanel }> = ({
  panel,
}) => {
  const [data, pending, error] = useAsyncState(async () => {
    return await browser.runtime.sendMessage({
      type: RUN_ACTION_PANEL,
      payload: {
        extensionId: panel.extension.id,
        extensionPointId: panel.extensionPoint.id,
      },
    });
  }, []);

  const [block, blockPending, blockError] = useAsyncState(async () => {
    if (!data) {
      return null;
    }
    for (const blockConfig of castArray(panel.extension.config.body)) {
      // render data in the first renderer
      const block = await blockRegistry.lookup(blockConfig.id);
      if ("render" in block) {
        const body = await (block as Renderer).render(data.args, {
          ctxt: data.ctxt,
          root: null,
          logger: new ConsoleLogger(),
        });
        if (typeof body === "string") {
          return <div dangerouslySetInnerHTML={{ __html: body }} />;
        } else {
          const { Component, props } = body as any;
          return <Component {...props} />;
        }
      }
    }
    throw new Error("No renderer brick found");
  }, [panel.extension, data]);

  return (
    <div>
      {(pending || blockPending) && <GridLoader />}
      {(error || blockError) && (
        <div className="text-danger">{(error ?? blockError).toString()}</div>
      )}
      {block}
    </div>
  );
};

const ActionPanels: React.FunctionComponent = () => {
  const [key, setKey] = useState<string | null>("home");

  const [extensionPoints, pending, error] = useAsyncState(
    async () => await getExtensionPoints(),
    []
  );

  useAsyncEffect(
    async (isMounted) => {
      if (extensionPoints?.length && isMounted()) {
        setKey(extensionPoints[0].extension.id);
      }
    },
    [extensionPoints?.length, setKey]
  );

  return (
    <Tabs id="panel-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
      {(extensionPoints?.length ?? 0) === 0 && (
        <Tab eventKey="home" title={pending ? "Loading" : "Panels"}>
          {pending && <GridLoader />}
          {error && (
            <div className="text-danger">Error: {error.toString()}</div>
          )}
          {!pending && !error && <div>No active panels for page</div>}
        </Tab>
      )}
      {extensionPoints?.map((x) => (
        <Tab
          key={x.extension.id}
          eventKey={x.extension.id}
          title={x.extension.config.heading}
        >
          <ExtensionPanelTab panel={x} />
        </Tab>
      ))}
    </Tabs>
  );
};

export default ActionPanels;
