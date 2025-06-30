import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  interface roomJoined {
    roomId: String;
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      socket?.emit("join:room", { name, roomId });

      setName("");
      setRoomId("");
    },
    [name, roomId]
  );

  const roomJoined = useCallback(
    (data: roomJoined) => {
      navigate(`/room/${data.roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket?.on("room:joined", roomJoined);

    return () => {
      socket?.off("room:joined", roomJoined);
    };
  }, [socket, roomJoined]);

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-[15%] flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-extrabold italic text-white text-center">
          Let's Connect with Video Call...!
        </h1>
      </div>

      {/* Form Section */}
      <div className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 shadow-xl rounded-xl px-8 py-10 w-[90%] max-w-md flex flex-col gap-4 items-center"
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Enter the Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          <button
            type="submit"
            style={{ borderRadius: "10px" }}
            className="mt-4 w-[10rem] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-all"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
