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

import React, { useCallback, useState } from "react";
import styles from "./DataItem.module.scss";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PrimitiveDataValue from "@/devTools/editor/components/dataItem/PrimitiveDataValue";

const ObjectDataValue: React.FC<{
  prop: string;
  value: Record<string, any>;
}> = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  return (
    <>
      <button
        type="button"
        onClick={toggleExpanded}
        className={styles.expander}
      >
        <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretRight} /> value
      </button>
      {isExpanded &&
        <div className={styles.data}>
          {Object.keys(value).map((key) =>
            <PrimitiveDataValue
              key={key}
              prop={key}
              value={value[key]}
            />
          )}
        </div>
      }
    </>
  );
};

export default ObjectDataValue;
