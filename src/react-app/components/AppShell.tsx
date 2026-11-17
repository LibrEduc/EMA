import { Toolbar, type ToolbarProps } from "./Toolbar";
import { ConsolePanel, FlexTag, WorkspaceLayout } from "./WorkspaceLayout";
import { HelpDialogs } from "./HelpDialogs";

export type AppShellProps = ToolbarProps;

export function AppShell(props: AppShellProps) {
  return (
    <>
      <a
        href="#blockly-workspace-main"
        className="skip-link lang"
        data-i18n="A11Y_SKIP_TO_WORKSPACE"
        id="skip-to-workspace"
      >
        Aller au workspace Blockly
      </a>
      <FlexTag tagName="flex" id="container_page" className="wrapper_global">
        <Toolbar {...props} />
        <WorkspaceLayout />
        <ConsolePanel />
      </FlexTag>
      <HelpDialogs />
    </>
  );
}
