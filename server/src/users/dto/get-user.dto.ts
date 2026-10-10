export class GetUserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: Date | null;
  address: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goal: string | null;
  activityLevel: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
