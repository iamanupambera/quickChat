declare namespace Express {
  export interface Request {
    user?: {
      user_id: number;
      name: string;
      phone_number: string;
      password: string;
      about: string | null;
      profile_picture_url: string | null;
    };
  }
}

