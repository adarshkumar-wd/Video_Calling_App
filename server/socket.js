import { log } from "console";

export const socketInitializer = (io) => {
    io.on("connection" , (socket) => {
        console.log("connected" , socket.id);


        socket.on("join:room" , (data) => {
            const {name , roomId} = data;
            console.log(`Name : ${name} Room : ${roomId}`)
            
            socket.join(roomId);
            socket.emit("room:joined" , {"roomId" : roomId})
            io.to(roomId).emit("user:joined" , {name , id: socket.id});

            
        })

        socket.on("user:calling" , (data) => {
            const {to , offer} = data;
            console.log("Hear user Calling")
            io.to(to).emit("user:calling" , {from : socket.id , offer});
        })

        socket.on("call:accepted" , (data) => {
            const {to , answer} = data;

            io.to(to).emit("call:accepted" , {from : socket.id , answer});

        });

        socket.on("nego:needed" , (data) => {
            const {to , offer} = data;
            console.log("nego-accepting")

            io.to(to).emit("nego:needed" , {from : socket.id , offer});

        })

        socket.on("nego:accepted" , (data) => {
            const {to , answer} = data;
            console.log("nego Final send")

            io.to(to).emit("nego:final" , answer);
        })

        socket.on("caller:calling" , (data) => {
            const {to} = data;
            log("caller calling handled...")
            io.to(to).emit("caller:calling" , {from : socket.id})
            log("caller socket id :" , socket.id)
        })

        socket.on("callee:accept:call" , (data) => {
            const {to} = data
            log("callee accept button handled...")
            io.to(to).emit("callee:accept:call")
        })

        

    })
}