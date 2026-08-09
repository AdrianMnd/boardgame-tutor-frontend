import "./Workspace.css";

interface WorkspaceProps {
    children: React.ReactNode;
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