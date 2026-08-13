import "./Workspace.css";

interface WorkspaceProps {
    children: React.ReactNode;
}

function Workspace({
    children
}: WorkspaceProps) {

    return (

        <main

            id="main-content"

            tabIndex={-1}

            className="workspace"

        >

            {children}

        </main>

    );

}

export default Workspace;