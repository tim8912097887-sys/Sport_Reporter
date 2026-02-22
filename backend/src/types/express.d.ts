import { CreateMatchType } from "@validations/match.ts";

type User = CreateUserType | LoginUserType;

declare global {
    namespace Express {
       interface Request {
          match?: createMatchSchema
       }        
    }
}

export {}