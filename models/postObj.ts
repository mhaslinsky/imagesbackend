export default interface PostObj {
  id?: any;
  image: string;
  title: string;
  description: string;
  address: string;
  creatorId: string;
  coordinates: { lat: number; lng: number };
}
