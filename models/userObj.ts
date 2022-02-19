export default interface UserObj {
  id?: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  posts: any[];
}
