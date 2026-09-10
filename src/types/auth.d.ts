import { AuthSession, AuthUser } from "@/auth";

export type Session = AuthSession;
export type User = AuthUser;

export type UserData = {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  alertNotification: boolean;
  createdAt: Date;
  role: string;
  oauthId?: string | null;
  smsNotification: boolean;
  phoneNumber?: string | null;
};

export type BackendUserResponse = {
  message: string;
  statusCode: 200 | 201;
  data: UserData;
};

export type BackendErrorResponse = {
  message: string;
  error: string;
  statusCode: 400 | 401 | 500;
};
