import "./Layout.css";

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {

    return (

        <div className="layout">

            {children}

        </div>

    );

}

export default Layout;