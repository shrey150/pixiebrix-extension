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

import React, { useMemo } from "react";
import styles from "./DataItem.module.scss";
import cx from "classnames";
import ObjectDataValue from "@/devTools/editor/components/dataItem/ObjectDataValue";
import ArrayDataValue from "@/devTools/editor/components/dataItem/ArrayDataValue";
import PrimitiveDataValue from "@/devTools/editor/components/dataItem/PrimitiveDataValue";

type DataItemType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

const DataItem: React.FC<{
  name: string;
  type: DataItemType;
  value: unknown;
  isStale?: boolean;
  isMuted?: boolean;
}> = ({
  name,
  type,
  value,
  isStale = false,
  isMuted = false
}) => {
  const Value = useMemo(() => {
    if (type === "object") {
      return ObjectDataValue;
    }

    if (type === "array") {
      return ArrayDataValue;
    }

    return PrimitiveDataValue;
  }, [type]);

  return (
    <div className={cx(styles.root, { [styles.muted]: isMuted })}>
      <div className={styles.nameRow}>
        <span className={styles.name}>@{name}</span>
        {isStale && (
          <span className={styles.stale}>Warning: Data is out of date</span>
        )}
      </div>
      <div className={styles.data}>
        <div className={styles.dataRow}>
          type:&nbsp;<span className={styles.type}>{type}</span>
        </div>
        <Value prop="value" value={value}/>
      </div>
    </div>
  );
};

export default DataItem;
