import UserObj from "./models/userObj";

const user1: UserObj = {
  id: "u1",
  username: "Michael Haslinsky",
  email: "mhaslinsky@gmail.com",
  password: "password",
};
const user2: UserObj = {
  id: "u2",
  username: "Valon Rama",
  email: "vrama21@gmail.com",
  password: "1234",
};

export let users: UserObj[] = [user1, user2];

export function overWriteData(inData: UserObj[]) {
  users = inData;
}
