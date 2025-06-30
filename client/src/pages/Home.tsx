import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  interface roomJoined{
    roomId : String
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


  const roomJoined = useCallback((data : roomJoined) => {

    navigate(`/room/${data.roomId}`);

  }, [navigate]);

  useEffect(() => {
    socket?.on("room:joined" , roomJoined);

    return () => {
      socket?.off("room:joined", roomJoined);  
   };

  }, [socket , roomJoined]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-100 to-pink-200 flex flex-col">
      {/* Header */}
      <div className="h-[15%] flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-extrabold italic text-gray-800 text-center">
          Let's Connect with Video Call...!
        </h1>
      </div>

      {/* Form Section */}
      <div className="flex-grow flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-xl px-8 py-10 w-[90%] max-w-md flex flex-col gap-4 items-center"
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-400"
          />

          <input
            type="text"
            placeholder="Enter the Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-400"
          />

          <button
            type="submit"
            style={{ borderRadius: "10px" }}
            className="mt-4 w-[10rem] bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full transition-all"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
