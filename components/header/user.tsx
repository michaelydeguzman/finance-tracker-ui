import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function UserHeader() {
  return (
    <>
      <Avatar>
        <AvatarImage src="https://avatars.githubusercontent.com/u/33743505?v=4" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div>Hi, Michael</div>
    </>
  );
}
