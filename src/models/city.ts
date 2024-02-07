import { ObjectId } from "mongodb";

export default interface City {  
    _id?: string;
    city: string;
    state_id: string;
    state_name: string;
}
