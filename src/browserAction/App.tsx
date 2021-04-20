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

import React from "react";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { browser } from "webextension-polyfill-ts";
import { Button } from "react-bootstrap";
import { useAsyncState } from "@/hooks/common";
import { getAuth } from "@/hooks/auth";
import { Provider } from "react-redux";
import store, { persistor } from "@/options/store";
import { PersistGate } from "redux-persist/integration/react";
import { GridLoader } from "react-spinners";
import { AuthContext } from "@/auth/context";
import { AuthState } from "@/core";
import ActionPanels from "@/browserAction/ActionPanels";

const defaultState: AuthState = {
  isLoggedIn: false,
  extension: true,
  isOnboarded: undefined,
  flags: [],
};

const ActionLayout: React.FunctionComponent = () => {
  return (
    <div>
      <div className="d-flex">
        <div className="flex-grow-1">
          <h3>PixieBrix</h3>
        </div>
        <div>
          <Button
            variant="info"
            onClick={async () => {
              await browser.runtime.openOptionsPage();
            }}
          >
            <FontAwesomeIcon icon={faCog} /> Options
          </Button>
        </div>
      </div>
      <div>
        <ActionPanels />
      </div>
    </div>
  );
};

const App: React.FunctionComponent = () => {
  const [authState] = useAsyncState(getAuth);

  return (
    <Provider store={store}>
      <PersistGate loading={<GridLoader />} persistor={persistor}>
        <AuthContext.Provider value={authState ?? defaultState}>
          <ActionLayout />
        </AuthContext.Provider>
      </PersistGate>
    </Provider>
  );
};

export default App;
