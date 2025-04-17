import React, {useState, useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TbLayoutSidebarRightExpandFilled, TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaHouse, FaUser, FaUtensils, FaRightFromBracket } from "react-icons/fa6";
import logo from "../assets/logo.png";

import "../styling.css";

const SideNav = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    }

    const handleGoToLogout = async () => {
        try {
            const { data } = await axios.post("http://localhost:5000/user/logout");
            localStorage.removeItem("userInfo");
            navigate("/login");
        } catch (error) {
            console.log(error);
        }
          
    }

    useEffect(() => {
            const storedData = localStorage.getItem('userInfo');
            if(storedData) {
                setToken(JSON.parse(storedData))
            }
        }, []);

    return (
        <div className="sidebar">
            {isExpanded ? 
                <div className="expanded">
                    <div className="heading">
                        <div className="title">
                            <img src={logo} alt="CookXP Logo" className="logo"/>
                                            
                            <div className="name">
                                CookXP
                            </div>
                        </div>
                        <TbLayoutSidebarRightExpandFilled onClick={toggleSidebar} className="icon"/>
                    </div>
                    <div className="navs">
                        <div className="nav" onClick={()=>navigate("/home")}>
                            <FaHouse className="icon"/>
                            <div className="label">
                                Home
                            </div>
                        </div>
                        <div className="nav" onClick={()=>navigate("/explore")}>
                            <FaUtensils className="icon"/>
                            <div className="label">
                                Explore
                            </div>
                        </div>
                        <div className="nav" onClick={()=>navigate("/profile")}>
                            <FaUser className="icon"/>
                            <div className="label">
                                Profile
                            </div>
                        </div>
                    </div>
                    <div className="nav" onClick={handleGoToLogout}>
                        <FaRightFromBracket className="icon"/>
                        <div className="label">
                            Logout
                        </div>
                    </div>
                </div>
                : 
                <div className="collapsed">
                    <div onClick={toggleSidebar}>
                        <TbLayoutSidebarLeftExpandFilled className="icon"/>
                    </div>
                    <div className="navs">
                        <div onClick={()=>navigate("/home")}>
                            <FaHouse className="icon"/>
                        </div>
                        <div onClick={()=>navigate("/explore")}>
                            <FaUtensils className="icon"/>
                        </div>
                        <div onClick={()=>navigate("/profile")}>
                            <FaUser className="icon"/>
                        </div>
                    </div>
                    <div>
                        <FaRightFromBracket onClick={handleGoToLogout} className="icon"/>
                    </div>
                </div>
            }
        </div>
        
    );
} 

export default SideNav;