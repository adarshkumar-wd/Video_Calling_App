import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { toast, ToastContainer } from "react-toastify";
import ReactPlayer from "react-player";
import peer from "../services/PeerService.ts";

function Room() {
  const [remoteId, setRemoteId] = useState<any>();
  const [myStream, setMyStream] = useState<any>();
  const [remoteStream, setRemoteStream] = useState<any>();
  const [acceptCallDisplay, setAcceptCallDisplay] = useState<Boolean>(false);
  const [displayMakeCallButton, setDisplayMakeCallButton] =
    useState<Boolean>(false);
  const socket = useSocket();

  interface userJoined {
    name: string;
    id: string;
  }

  interface userCalling {
    from: any;
    offer: any;
  }

  interface callAccepting {
    from: any;
    answer: any;
  }

  interface handleIncomingNego {
    from: any;
    offer: any;
  }

  const addStream = () => {
    if (myStream) {
      myStream.getTracks().forEach((track: MediaStreamTrack) => {
        peer.peer.addTrack(track, myStream);
      });
    }
  };

  const userJoined = useCallback((data: userJoined) => {
    const { name, id } = data;
    setRemoteId(id);
    setDisplayMakeCallButton(true);
    // ADD USER NOTIFICATION IN FUTURE
    toast(`${name} joined the Room..`);
  }, []);

  const handleUserCall = useCallback(async (data: userCalling) => {
    const { from, offer } = data;
    console.log("handle call completed");

    const answer = await peer.getAnswer(offer);

    if (answer) {
      socket?.emit("call:accepted", { to: from, answer });
    }
  }, []);

  const handleCallAccepted = useCallback(
    async (data: callAccepting) => {
      const { from, answer } = data;

      await peer.setLocalDescription(answer);
      console.log("Call Accepted successfully");
    },
    [myStream]
  );

  // CALLER

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();

    if (offer) {
      console.log("nego sending");
      socket?.emit("nego:needed", { to: remoteId, offer });
    }
  }, [remoteId]);

  // CALLEE

  const handleIncomingNego = useCallback(async (data: handleIncomingNego) => {
    const { from, offer } = data;
    console.log("Incomming nego");
    const answer = await peer.getAnswer(offer);

    if (answer) {
      socket?.emit("nego:accepted", { to: from, answer });
    }
  }, []);

  // CALLER

  const finalNego = useCallback(async (answer: any) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [remoteId]);

  // CALLER CONTEXT

  const handleMakeCall = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      socket?.emit("caller:calling", { to: remoteId });
      setDisplayMakeCallButton(false);
    },
    [socket, remoteId, myStream]
  );

  // CALLEE CONTEXT

  const handleCallerCalling = useCallback((data: any) => {
    console.log("Socket Id of Caller : ", data.from);
    // addStream();
    setRemoteId(data.from); // SET CALLER REMOTE ID
    setAcceptCallDisplay(true);
    console.log("caller calling received , at calle context..");
  }, []);

  // CALLEE CONTEXT

  const handleAcceptButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log("Callee Clicked Accept Button..");

      console.log("SenderId : ", remoteId);
      socket?.emit("callee:accept:call", { to: remoteId });
      setAcceptCallDisplay(false);
    },
    [remoteId]
  );

  // CALLER CONTEXT..

  const handleCalleeAccept = useCallback(async () => {
    //Handle Callee Call at Caller Context..
    // addStream();
    console.log("Start HandShaking... With Callee");

    const offer = await peer.getOffer();
    console.log("offer :", offer);
    if (offer) {
      socket?.emit("user:calling", { to: remoteId, offer });
      console.log("calling done successfully.. ");
    }
  }, [remoteId]);

  // Get ans set Caller Stream

  useEffect(() => {
    const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
    };
    getMedia();
  }, []);

  useEffect(() => {
    addStream();
  }, [myStream]);

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      console.log(event);
      const remoteStream = event.streams[0];
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket?.on("user:joined", userJoined);
    socket?.on("user:calling", handleUserCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("nego:needed", handleIncomingNego);
    socket?.on("nego:final", finalNego);
    socket?.on("caller:calling", handleCallerCalling);
    socket?.on("callee:accept:call", handleCalleeAccept);

    return () => {
      socket?.off("user:joined", userJoined);
      socket?.off("user:calling", handleUserCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("nego:needed", handleIncomingNego);
      socket?.off("nego:final", finalNego);
      socket?.off("caller:calling", handleCallerCalling);
      socket?.off("callee:accept:call", handleCalleeAccept);
    };
  }, [
    socket,
    userJoined,
    handleUserCall,
    handleCallAccepted,
    handleIncomingNego,
    finalNego,
    handleCallerCalling,
    handleCalleeAccept,
  ]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-6 relative">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">Video Room</h1>

        {/* Main Content - Centered vertically and horizontally */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {/* Video Containers - Centered row */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 items-center justify-center">
            {/* My Track */}
            <div className="w-full max-w-md bg-gray-800 p-3 rounded-lg">
              <h2 className="text-center mb-2">My Track</h2>
              <div className="aspect-video bg-gray-700 rounded-md overflow-hidden">
                <ReactPlayer
                  playing
                  muted
                  width="100%"
                  height="100%"
                  url={myStream}
                />
              </div>
            </div>

            {/* Remote Track */}
            <div className="w-full max-w-md bg-gray-800 p-3 rounded-lg">
              <h2 className="text-center mb-2">Remote Track</h2>
              <div className="aspect-video bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                {remoteStream ? (
                  <ReactPlayer
                    playing
                    muted
                    width="100%"
                    height="100%"
                    url={remoteStream}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">
                    Waiting for remote video...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Text - Positioned below videos */}
          <div className="mt-4 text-center min-h-6">
            {!displayMakeCallButton && !acceptCallDisplay && (
              <p className={remoteStream ? "text-green-400" : "text-gray-400"}>
                {remoteStream
                  ? "Call connected."
                  : "Waiting for another participant to join..."}
              </p>
            )}
            {acceptCallDisplay && (
              <p className="text-yellow-300">Caller is trying to reach you!</p>
            )}
          </div>
        </div>

        {/* Call Buttons - Centered Overlay */}
        {(displayMakeCallButton || acceptCallDisplay) && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
              {
                displayMakeCallButton ? <h3 className="text-xl">Make a call to Your Partner</h3> : <h3 className="text-xl">Your Partner Wants to connects with you</h3>
              }
              {displayMakeCallButton && (
                <button
                  onClick={handleMakeCall}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Make a Call
                </button>
              )}
              {acceptCallDisplay && (
                <button
                  onClick={handleAcceptButton}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  Accept the Call
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Room;
