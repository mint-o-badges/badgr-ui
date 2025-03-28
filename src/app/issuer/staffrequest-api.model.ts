import { UserProfile } from "../common/model/user-profile.model";
import { Issuer } from "./models/issuer.model";

export interface ApiStaffRequest {
    id?: number;
    entity_version?: number;
    entity_id: string;
    issuer: Issuer;
    requestedOn: string;
    status: string;
    user: UserProfile;
  }