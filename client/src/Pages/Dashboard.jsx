import React from "react";
import useAuth from "../context/authContext";
import { io } from "socket.io-client";
import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import auth from "../lib/auth";
import axios from "../api/axios";

const getDisplayName = (person) => {
  if (person?.name && person.name.trim()) return person.name;
  return person?.email || "Unknown user";
};

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState("system");

  const handleAuthError = useCallback((error) => {
    if (error?.response?.status === 401) {
      logout();
      return true;
    }

    return false;
  }, [logout]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:4444", {
      auth: {
        token: `${auth.token}`,
      },
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("User Connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("User Disconnected");
    });

    socket.on("chat:new", (data) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((item) => item.id === data.id)) return prevMessages;
        return [...prevMessages, data];
      });
    });

    setSocket(socket);
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    setIsLoadingFriends(true);
    axios.get("/api/user/friends")
      .then(({ data }) => {
        setFriendList(data);
      })
      .catch((error) => {
        if (!handleAuthError(error)) {
          alert(error?.response?.data?.message || "Unable to load friends");
        }
      })
      .finally(() => setIsLoadingFriends(false));
  }, [handleAuthError, isConnected]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme");
    const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferredTheme);
    document.documentElement.classList.toggle("dark", preferredTheme === "dark");
    document.documentElement.classList.toggle("light", preferredTheme === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("chat-theme", nextTheme);
  };

  const searchUsers = async (query) => {
    const q = query.trim();
    setSearchQuery(query);
    if (!q) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await axios.get("/api/user/search", { params: { q } });
      setSearchResults(data);
    } catch (error) {
      if (!handleAuthError(error)) {
        alert(error?.response?.data?.message || "Unable to search users");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const openConversation = (selectedUser, conversationId) => {
    setReceiverId(selectedUser.id);
    setReceiverName(getDisplayName(selectedUser));
    setSearchResults([]);
    setSearchQuery("");

    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    axios
      .get("/api/user/messages", { params: { conversationId } })
      .then(({ data }) => setMessages(data))
      .catch((error) => {
        if (!handleAuthError(error)) {
          alert(error?.response?.data?.message || "Unable to load messages");
        }
      })
      .finally(() => setIsLoadingMessages(false));
  };

  const openSearchResult = async (person) => {
    try {
      const { data } = await axios.post("/api/user/conversation/ensure", { userId: person.id });
      const peer = data.peer;

      setFriendList((prev) => (prev.some((item) => item.id === data.conversation.id) ? prev : [data.conversation, ...prev]));
      openConversation(peer, data.conversation.id);
    } catch (error) {
      if (!handleAuthError(error)) {
        alert(error?.response?.data?.message || "Unable to open conversation");
      }
    }
  };

  const chatHandler = function () {
    if (!receiverId || !text.trim()) {
      return alert("Select a friend and type a message first.");
    }

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      text,
      sender: { id: user.id, name: user.name, email: user.email },
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("chat:send", { receiverId, text }, (msg) => {
      if (!msg.ok) {
        setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id));
        return alert(msg.error);
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((item) => item.id !== optimisticMessage.id);
        // chat:new may have already added the real message — don't duplicate it
        if (withoutOptimistic.some((item) => item.id === msg.message.id)) {
          return withoutOptimistic;
        }
        return [...withoutOptimistic, msg.message];
      });
      setText("");
    });
  };
  return (
    <div className="dashboard">
      <div className="topbar">
        <div className="user-info">
          Welcome, <strong>{user.name || user.email}</strong>
        </div>
        <div className="topbar-meta">
          <button type="button" className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <span className={`status-pill ${isConnected ? "connected" : "connecting"}`}>
            <span className="dot" />
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <button className="primary-btn logout-btn" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>

      <div className="chatbox">
        <div className="sidea">
          <div className="friends-header">Friends</div>
          <div className="search-panel">
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchUsers(e.target.value)}
                placeholder="Search by email or name"
              />
              {isSearching && <span className="search-spinner" aria-label="Searching" />}
            </div>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((person) => (
                  <li
                    key={person.id}
                    className="search-result-item"
                    onClick={() => openSearchResult(person)}
                  >
                    <strong>{getDisplayName(person)}</strong>
                    {person.name && person.name.trim() && person.name !== person.email && <span>{person.email}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="friends-subheader">Recent chats</div>
          {isLoadingFriends ? (
            <ul className="friend-list skeleton-list">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="friend-skeleton" />
              ))}
            </ul>
          ) : (
            <ul className="friend-list">
              {friendList.map((f) => {
                const selectedId = user.id === f.userA.id ? f.userB.id : f.userA.id;
                const selectedName = user.id === f.userA.id ? f.userB : f.userA;

                return (
                  <li
                    key={f.id}
                    className={`friend-item ${receiverId === selectedId ? "active" : ""}`}
                    data-initial={getDisplayName(selectedName).charAt(0).toUpperCase()}
                    onClick={() => openConversation(selectedName, f.id)}
                  >
                    <div>
                      <div className="friend-name">{getDisplayName(selectedName)}</div>
                      <div className="friend-meta">Tap to open conversation</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sideb">
          <div className="chat-header">
            {receiverId && <span className="chat-header-status" aria-label="Online" />}
            <div>
              <h2>{receiverName || "Select a conversation"}</h2>
              <p>{receiverId ? "Ready to send a message." : "Choose a friend from the list to start chatting."}</p>
            </div>
          </div>
          <div className="messages">
            {isLoadingMessages ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`message-skeleton ${index % 2 === 0 ? "left" : "right"}`} />
              ))
            ) : !messages.length ? (
              <div className="empty-state">No messages yet. Start the conversation when you’re ready.</div>
            ) : (
              messages.map((m) => {
                const isMine = m.sender.id === user.id;
                return (
                  <article key={m.id} className={`message ${isMine ? "mine" : "theirs"}`}>
                    {!isMine && <div className="sender">{getDisplayName(m.sender)}</div>}
                    <div className="bubble">{m.text}</div>
                    <time className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
                  </article>
                );
              })
            )}
          </div>

          <div className="sendmessage">
            <div className="composer">
              <input
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') chatHandler(); }}
                type="text"
                placeholder={receiverId ? "Type a message" : "Choose a friend first"}
                value={text}
                disabled={!receiverId}
              />
            </div>
            <button
              className="primary-btn"
              onClick={chatHandler}
              disabled={!isConnected || !receiverId}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
