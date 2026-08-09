import "./Avatar.css";

import Icon from "./Icon";

import {

    Bot,

    User

} from "lucide-react";

interface Props {

    role: "assistant" | "user";

}

function Avatar({

    role

}: Props) {

    return (

        <div

            className={

                role === "assistant"

                    ? "avatar assistant"

                    : "avatar user"

            }

        >

            <Icon

                icon={

                    role === "assistant"

                        ? Bot

                        : User

                }

                size={18}

            />

        </div>

    );

}

export default Avatar;