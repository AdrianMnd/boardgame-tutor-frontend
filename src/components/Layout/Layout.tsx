import "./Layout.css";

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {

    return (

        <div className="layout">

            <a

                href="#main-content"

                className="skip-link"

            >

                Saltar al contenido principal

            </a>

            {children}

        </div>

    );

}

export default Layout;