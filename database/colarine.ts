import fs from 'fs';

const database_path = '/etc/bbaby/colarine';
const path_check = async (path: string) => {
    try {
        return await fsPromises.mkdir(path, {recursive: true});   
    } catch (err: any) {
        if (err.code != 'EEXISTS') {
            throw new Error(err.message)
        }
    }
}

const fsPromises = fs.promises;
const collectionsArray = ['BBC'];

// export const colarine = {
//     initialize: async () => {
//         try {
//             const check = await path_check(database_path);
//             console.log(check);
//             const readCollections = async () => {
//                 try {
//                     collectionsArray.map((collection) => {
//                         path_check(`${database_path}/collections/${collection}`)
//                     })
//                 } catch (err) {
//                     if (err instanceof Error) {
//                         console.log(err.message);
//                         throw new Error(err.message);
//                     }
//                 }
//             }
//             console.log('inizialized')
//             const collections = await readCollections();
//             return collections;
//         } catch (err) {
//             if (err instanceof Error) {
//                 console.log(err.message);
//                 throw new Error(err.message);
//             }
//         }
//     },
// }