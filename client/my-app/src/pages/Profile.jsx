import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "../components/SideNav";
import axios from "axios";
import { FaCircleXmark, FaUser } from "react-icons/fa6";
import { Input, Progress } from "antd";

import profileBadge from "../assets/profilebadge.png";
import badge1 from "../assets/badge1.png";
import badge3 from "../assets/badge3.png";
import badge5 from "../assets/badge5.png";
import badge10 from "../assets/badge10.png";

import "../styling.css";

const Profile = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [userFriends, setUserFriends] = useState([]);
    const [userAchievements, setUserAchievements] = useState([]);
    const friendText = useRef();

    const handleGoToSignup = () => {
        navigate("/signup");
    };

    const handleGetUserInfo = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/user/' + token.username);
            const achievementResponse = await axios.get("http://localhost:5000/achievement/user/" + token.username);
            if(data && data.userDetails ){
                setUserInfo(data.userDetails);
                setUserAchievements(achievementResponse.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleGetUserFriends = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/user/friend/' + token.username);
            if(data && data.userFriends){
                setUserFriends(data.userFriends);
                console.log(data.userFriends);
            }
        } catch (error) {
            console.log(error);
        }

    }

    const handleAddFriend = async() => { 
        const names = {
            username: userInfo.username,
            friend_username: friendText.current.value,
        }
        try {
            const response = await axios.post('http://localhost:5000/user/friend/add', names);
            if(response){
                if(response.status == 201) {
                    console.log("friend added");
                    navigate(0);
                }
                else{
                    console.log(response);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRemoveFriends = async(friend_username) => {
        const names = {
            username: userInfo.username,
            friend_username: friend_username,
        }
        try {
            const response = await axios.delete('http://localhost:5000/user/friend/', {
                data:names,
            });
            if(response){
                if(response.status == 200) {
                    console.log("friend deleted");
                    navigate(0);
                }
                else{
                    console.log(response);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const storedData = localStorage.getItem('userInfo');
        if(storedData) {
            setToken(JSON.parse(storedData));
        }
        else{
            handleGoToSignup();
        }
    }, []);

    useEffect(() => {
        if (token) {
            handleGetUserInfo();
            handleGetUserFriends();
        }
    }, [token]);

    const renderAchievements = () => {
        //For Paige: basically maps out image logos for the achievements when you have them
        const achievementImages ={
            "Profile Created" : profileBadge,
            "1st Recipe Completion" : badge1,
            "3 Recipes Completed" : badge3,
            "5 Recipes Completed" : badge5,
            "10 Recipes Completed" : badge10,
        }

        return(
            //This is based off your other render code, it should work similarly i think
            <div className="badges">
                {userAchievements.map((achievement, index) => {
                    const { name, description, earned_date } = achievement;
                    const imageSrc = achievementImages[name] || "/assets/default.png";

                    return (
                    <div key={index} className="badge">
                        <img src={imageSrc} alt={name} className="badgeImg"/>
                        <div className="info">
                            <div className="name">{name}</div>
                            <div className="description">{description}</div>
                        </div>
                        <div className="date">{new Date(earned_date).toLocaleDateString()}</div>
                    </div>
                    );
                })}
            </div>
        );
    }

    const renderChefRank = () => {
        let rank = "";
        const points = userInfo?.chef_level;

        if (points >= 0 && points < 100) {
            rank = "Dishwasher";
        }
        else if (points >= 100 && points < 200) {
            rank = "Junior Chef";
        }
        else if (points >= 200 && points < 300) {
            rank = "Grill Chef";
        }
        else if (points >= 300 && points < 400) {
            rank = "Entree Chef";
        }
        else if (points >= 400 && points < 500) {
            rank = "Relief Chef";
        }
        else if (points >= 500 && points < 600) {
            rank = "Deputy Chef";
        }
        else if (points >= 600 && points < 700) {
            rank = "Head Chef";
        }
        else if (points >= 700) {
            rank = "Executive Chef";
        }

        return (
            <div>
                {rank}
            </div>
        )
    }

    return (
        <div className="profile">
            <SideNav />

            <div className="body">
                <div className="title">
                    <div className="profilePic">
                        <FaUser color="white" size={30}/>
                    </div>

                    <div className="username">
                        {userInfo?.username}
                    </div>
                </div>
                <div className="content">
                    <div className="levels">
                        <div className="current">
                            <div className="rank">
                                {renderChefRank()}
                            </div>

                            <div className="status">
                                <div className="points">
                                    <div>
                                        Level {Math.floor(userInfo?.chef_level / 100)}
                                    </div>
                                    <div>
                                    {userInfo?.chef_level%100} points
                                    </div>
                                </div>

                                <div className="bar">
                                    <Progress percent={userInfo?.chef_level%100} size={[ , 30]} trailColor="white" strokeColor="#FF8F49" showInfo={false}/>
                                </div>

                                <div className="labels">
                                <div>
                                    LEVEL {Math.floor(userInfo?.chef_level/100)}
                                </div>
                                <div>
                                    LEVEL {Math.floor(userInfo?.chef_level/100) + 1}
                                </div>
                                </div>
                            </div>
                        </div>

                        <div className="next">
                        {100 - userInfo?.chef_level%100} points until level {Math.floor(userInfo?.chef_level/100) + 1}!
                        </div>
                    </div>

                    <div className="achievements">
                        <div className="heading">
                            Achievements
                        </div>
                        
                        {renderAchievements()}
                    </div>

                    

                    <div className="friends">
                        <div className="myFriends">
                            <div className="heading">
                                My Friends
                            </div>

                            <div className="addFriend">
                                <input type="text" ref={friendText} placeholder="Enter username to add..." className="input"/>
                                <div className="addButton" onClick={handleAddFriend}>Add Friend</div>
                            </div>
                            
                            {userFriends == [] ?
                                <div>
                                    You have no friends.
                                </div> : <div className="items">
                                    {userFriends.map((friend, index) => (
                                        <div key={index} className="item">
                                            {friend.friend_username}
                                            <FaCircleXmark  className="remove" onClick={() => handleRemoveFriends(friend.friend_username)}/> 
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
