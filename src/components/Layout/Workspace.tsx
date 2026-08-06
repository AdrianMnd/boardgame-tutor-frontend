import "./Workspace.css";

import type { ReactNode } from "react";

interface WorkspaceProps {

    children: ReactNode;

}

function Workspace({

    children

}: WorkspaceProps) {

    return (

        <main className="workspace">

            {children}

        </main>

    );

}

export default Workspace;