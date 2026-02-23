import { CreateMatchType } from "@validations/match.ts";
import { CreateCommentaryType} from "@validations/commentary.ts";

declare global {
    namespace Express {
       interface Request {
          match?: CreateMatchType
          commentary?: CreateCommentaryType
       }        
    }
}

export {}