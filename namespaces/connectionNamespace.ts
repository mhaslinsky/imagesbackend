export function ConnectionNS(socket: any) {
  console.log(socket.id);
  socket.on("login", (id: any) => {
    console.log(id);
  });
}
