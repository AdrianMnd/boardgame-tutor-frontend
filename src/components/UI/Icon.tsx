import type { LucideIcon } from "lucide-react";

interface Props {

    icon: LucideIcon;

    size?: number;

    strokeWidth?: number;

    className?: string;

}

function Icon({

    icon: IconComponent,

    size = 18,

    strokeWidth = 2,

    className

}: Props) {

    return (

        <IconComponent

            size={size}

            strokeWidth={strokeWidth}

            className={className}

        />

    );

}

export default Icon;