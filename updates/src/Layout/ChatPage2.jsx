import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import SearchBar from "../components/other/SearchBar";
import axios from "axios";
import logo from '../assets/logo.jpeg';

var stompClient = null;

export const ChatPage2 = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState("");
  const [tab, setTab] = useState("CHATROOM");
  const [publicChats, setPublicChats] = useState([]);
  const [privateChats, setPrivateChats] = useState(new Map());
  const [username] = useState(localStorage.getItem("chat-username"));
  const navigate = useNavigate();
  const connected = useRef(false);

  if (!username.trim()) {
    navigate("/login");
  }

  useEffect(() => {
    if (!connected.current) {
      connect();
    }
    return () => {
      if (stompClient) {
        stompClient.disconnect();
        connected.current = false;
      }
    };
  }, []);

  const handlePrivateMessage = (user) => {
    setSelectedUser(user);
    setReceiver(user.username);

    if (!privateChats.has(user.username)) {
      privateChats.set(user.username, []);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    console.log("Public message received:", payloadData);
    switch (payloadData.status) {
      case "JOIN":
        if (payloadData.senderName !== username) {
          if (!privateChats.get(payloadData.senderName)) {
            privateChats.set(payloadData.senderName, []);
            setPrivateChats(new Map(privateChats));
          }
        }
        break;
      case "LEAVE":
        if (payloadData.senderName !== username) {
          if (privateChats.get(payloadData.senderName)) {
            privateChats.delete(payloadData.senderName);
            setPrivateChats(new Map(privateChats));
          }
        }
        break;
      case "MESSAGE":
        setPublicChats((prev) => [...prev, payloadData]);
        break;
      default:
        console.warn("Unknown status received:", payloadData.status);
    }
  };

  const onPrivateMessage = (payload) => {
    const payloadData = JSON.parse(payload.body);
    console.log("Private message received:", payloadData);
    if (privateChats.has(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
    } else {
      privateChats.set(payloadData.senderName, [payloadData]);
    }
    setPrivateChats(new Map(privateChats));
  };

  const onConnect = () => {
    console.log("Connected to WebSocket");
    connected.current = true;

    stompClient.subscribe("/chatroom/public", onMessageReceived);
    stompClient.subscribe(`/user/${username}/private`, onPrivateMessage);

    userJoin();
  };

  const onError = (err) => {
    console.error("WebSocket connection error:", err);
  };

  const connect = () => {
    let sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(sock);
    stompClient.connect({}, onConnect, onError);
  };

  const userJoin = () => {
    let chatMessage = {
      senderName: username,
      status: "JOIN",
    };

    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const userLeft = () => {
    let chatMessage = {
      senderName: username,
      status: "LEAVE",
    };

    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const handleLogout = () => {
    userLeft();
    localStorage.removeItem("chat-username");
    navigate("/login");
  };

  // Handle file conversion to base64
  const base64ConversionForImages = (e) => {
    if (e.target.files[0]) {
      getBase64(e.target.files[0]);
    }
  };

  const getBase64 = (file) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setMedia(reader.result);
    reader.onerror = (error) => console.error("Error converting file:", error);
  };

  const sendMessage = () => {
    if (message.trim().length > 0 || media) {
      stompClient.send(
        "/app/message",
        {},
        JSON.stringify({
          senderName: username,
          status: "MESSAGE",
          media: media,
          message: message,
        })
      );
      setMessage("");
      setMedia("");
    }
  };

  const sendPrivate = () => {
    if (message.trim().length > 0 && receiver) {
      let chatMessage = {
        senderName: username,
        receiverName: receiver,
        message: message,
        media: media,
        status: "MESSAGE",
      };

      privateChats.get(receiver).push(chatMessage);
      setPrivateChats(new Map(privateChats));

      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));

      setMessage("");
      setMedia("");
    }
  };

  const tabReceiverSet = (name) => {
    setReceiver(name);
    setTab(name);
  };

  const fetchChatHistory = async (user1, user2) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/messages/history/${user1}/${user2}`
      );

      if (response.status === 200) {
        // Assuming response.data is an array of messages
        setPrivateChats((prevChats) => {
          prevChats.set(user2, response.data);
          return new Map(prevChats);
        });
      } else {
        console.error("Failed to fetch chat history:", response.status);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex w-full h-full">
        {/* Left Container - Adjusted size */}
        <div className="flex flex-col p-3 w-[300px] h-[551px] bg-transparent">
          <ul className="list-none space-y-2">
            {/* Updated 'Ris Chats' section with background color */}
            <li
              className="p-2 flex items-center cursor-default bg-blue-700 text-white"
              style={{ backgroundColor: "#1D4ED8" }}
            >
              <img
                src={logo}
                alt="Logo"
                className="mr-2"
                style={{ width: '50px', height: 'auto', objectFit: 'contain' }}
              />
              <span>Ris Chats</span>
            </li>

            <div className="flex items-center space-x-2 pl-4 pt-3 w-full">
              <SearchBar onUserSelect={handlePrivateMessage} />
              <button
                onClick={handleLogout}
                className="bg-blue-700 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>

            {[...privateChats.keys()].map((name, index) => (
              <li
                key={index}
                onClick={() => {
                  tabReceiverSet(name);
                  fetchChatHistory(username, name); // Fetch chat history when clicking on user tab
                }}
                className={`p-2 cursor-pointer rounded mt-3 ${
                  tab === name ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                <span className="text-lg">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Container - Adjusted to fit the screen */}
        <div className="flex flex-col w-full lg:w-[70%] mt-3">
          {/* Chat Box */}
          <div
            className="p-3 flex-grow overflow-hidden bg-gray-300 border border-green-500 flex flex-col space-y-2 rounded-md"
            style={{ height: "500px" }}
          >
            {tab === "CHATROOM"
              ? publicChats.map((message, index) => (
                  <div
                    className={`flex ${
                      message.senderName !== username
                        ? "justify-start"
                        : "justify-end"
                    }`}
                    key={index}
                  >
                    <div
                      className={`p-2 flex flex-col max-w-lg ${
                        message.senderName !== username
                          ? "bg-white rounded-t-lg rounded-r-lg"
                          : "bg-blue-500 rounded-t-lg rounded-l-lg"
                      }`}
                    >
                      {message.senderName !== username && (
                        <div className="rounded bg-blue-400 mb-2 p-1 text-white">
                          {message.senderName}
                        </div>
                      )}
                      <div
                        className={message.senderName === username ? "text-white" : ""}
                      >
                        {message.message}
                      </div>
                      {message.media &&
                        message.media
                          .split(";")[0]
                          .split("/")[0]
                          .split(":")[1] === "image" && (
                          <img src={message.media} alt="" width={"250px"} />
                        )}
                    </div>
                  </div>
                ))
              : privateChats.get(tab)?.map((message, index) => (
                  <div
                    className={`flex ${
                      message.senderName !== username
                        ? "justify-start"
                        : "justify-end"
                    }`}
                    key={index}
                  >
                    <div
                      className={`p-2 flex flex-col max-w-lg ${
                        message.senderName !== username
                          ? "bg-white rounded-t-lg rounded-r-lg"
                          : "bg-blue-500 rounded-t-lg rounded-l-lg"
                      }`}
                    >
                      {message.senderName !== username && (
                        <div className="rounded bg-blue-400 mb-2 p-1 text-white">
                          {message.senderName}
                        </div>
                      )}
                      <div
                        className={message.senderName === username ? "text-white" : ""}
                      >
                        {message.message}
                      </div>
                      {message.media &&
                        message.media
                          .split(";")[0]
                          .split("/")[0]
                          .split(":")[1] === "image" && (
                          <img src={message.media} alt="" width={"250px"} />
                        )}
                    </div>
                  </div>
                ))}
          </div>

          {/* Message Input Section */}
          <div className="flex items-center p-2 mt-2 border-t border-gray-500">
            <input
              className="w-full px-4 py-2 rounded-l-md border-gray-300"
              placeholder="Enter Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {/* <input
              type="file"
              className="ml-2"
              onChange={base64ConversionForImages}
            /> */}
            <button
              onClick={tab === "CHATROOM" ? sendMessage : sendPrivate}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-r-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
