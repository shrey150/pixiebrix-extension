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
import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { getProperty } from "@/utils";
import { get } from "lodash";
import { UnknownObject } from "@/types";
import { isPipelineExpression } from "@/runtime/mapArgs";
import PipelineComponent from "@/blocks/renderers/documentFolder/PipelineComponent";
import DocumentButton from "@/blocks/renderers/documentFolder/DocumentButton";

const knownComponents = {
  container: Container,
  row: Row,
  column: Col,
  card: Card,
  header_1: (({ children, ...restProps }) => (
    <h1 {...restProps}>{children}</h1>
  )) as React.FC<unknown>,
  header_2: (({ children, ...restProps }) => (
    <h2 {...restProps}>{children}</h2>
  )) as React.FC<unknown>,
  header_3: (({ children, ...restProps }) => (
    <h3 {...restProps}>{children}</h3>
  )) as React.FC<unknown>,
  text: (({ children, ...restProps }) => (
    <p {...restProps}>{children}</p>
  )) as React.FC<unknown>,
};

const UnknownType: React.FC<{ componentType: string }> = ({
  componentType,
}) => <span>Unknown type: {componentType}</span>;

export function getComponent(
  body: any
): { Component: React.ComponentType; props: UnknownObject } {
  const componentType = body.type;
  const Component = getProperty(
    knownComponents,
    componentType
  ) as React.ComponentType;

  const props: UnknownObject = {};

  switch (componentType) {
    case "header_1":
    case "header_2":
    case "header_3": {
      props.children = get(body, "config.title");
      break;
    }

    case "text": {
      props.children = get(body, "config.text");
      break;
    }

    case "container":
    case "row":
    case "column": {
      props.children = body.children.map((child: any, i: number) => {
        const { Component: ChildComponent, props: childProps } = getComponent(
          child
        );
        return <ChildComponent key={i} {...childProps} />;
      });

      break;
    }

    case "block": {
      const pipeline = get(body, "config.pipeline");
      if (!isPipelineExpression(pipeline)) {
        throw new Error("Expected pipeline expression for pipeline");
      }

      return {
        Component: PipelineComponent,
        props: {
          pipeline: pipeline.__value__,
        },
      };
    }

    case "button": {
      const onClick = get(body, "config.onClick");
      if (!isPipelineExpression(onClick)) {
        throw new Error("Expected pipeline expression for onClick");
      }

      return {
        Component: DocumentButton,
        props: {
          title: get(body, "config.title"),
          onClick: onClick.__value__,
        },
      };
    }

    default: {
      return { Component: UnknownType, props: { componentType } };
    }
  }

  return { Component, props };
}