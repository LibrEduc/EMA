import { createElement, type HTMLAttributes, type ReactNode } from "react";

export type FlexTagProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  dir?: string;
};

export function FlexTag({
  children,
  ...props
}: FlexTagProps & { tagName: "flex" | "flex-item" | "flex-resizer" }) {
  const { tagName, ...attributes } = props;
  return createElement(tagName, attributes, children);
}

export function WorkspaceCanvas() {
  return (
    <FlexTag tagName="flex-item" id="flex_container_up_left" style={{ flex: 1 }}>
      <div id="shortcuts" hidden />
      <div id="a11y-announcer" hidden />
      <main id="blockly-workspace-main">
        <div id="div_workspace_content_area" />
        <div id="div_workspace_content_blockly" style={{ position: "absolute" }} />
      </main>
    </FlexTag>
  );
}

export function CodeOutputPanel() {
  return (
    <FlexTag tagName="flex-item" id="flex_container_up_right" style={{ flexBasis: 0 }}>
      <FlexTag tagName="flex-item" id="flex_content_code">
        <pre id="div_content_code"><code /></pre>
        <div id="div_content_monacoEditor" />
      </FlexTag>
    </FlexTag>
  );
}

export function WorkspaceLayout() {
  return (
    <FlexTag tagName="flex" id="flex_container_up" className="wrapper_element" dir="ltr" style={{ flex: 1 }}>
      <WorkspaceCanvas />
      <FlexTag tagName="flex-resizer" id="flex_resizer_horizontal" />
      <CodeOutputPanel />
    </FlexTag>
  );
}

export function ConsolePanel() {
  return (
    <>
      <FlexTag tagName="flex-resizer" id="flex_resizer_vertical" />
      <FlexTag tagName="flex" id="flex_container_bottom" className="wrapper_element" style={{ flexBasis: 0 }}>
        <FlexTag tagName="flex-item" id="flex_container_bottom_down" style={{ flex: 1 }} role="presentation">
          <pre id="content_console"><code /></pre>
        </FlexTag>
      </FlexTag>
    </>
  );
}
