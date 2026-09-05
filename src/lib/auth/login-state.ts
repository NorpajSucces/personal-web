export type LoginState = {
  stage: "email" | "code";
  email: string;
  message: string;
  error: boolean;
  retryAt: number;
};

export const initialLoginState: LoginState = {
  stage: "email",
  email: "",
  message: "",
  error: false,
  retryAt: 0,
};
