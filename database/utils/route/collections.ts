import { catchError } from "../../../lib/common";

const collections = {
    save: async () => {
        try {
        } catch (err) {
            catchError(err);
        }
    },
}

export default collections;
