import { ConnectDB } from '../DB/connectDB.js';
import { collection, where, getDocs, doc, getDoc, addDoc, query, updateDoc, deleteDoc } from 'firebase/firestore';

export class AdventuresDAO {

    async getLastAdventures(){
        const db = new ConnectDB();

        const adventuresCol = collection(db, "arquivos");
        const adventuresSnapshot = await getDocs(adventuresCol);
        const adventuresList = adventuresSnapshot.docs.map((doc) => {
            return { id: doc.id , data: doc.data() }
        });

        return adventuresList;
    }


    async getAdventure(adventureID){

        const db = new ConnectDB();

        const adventureRef = doc(db, "arquivos", adventureID);
        const adventureSnap = await getDoc(adventureRef);

        if ( adventureSnap.exists() ){
            const data = adventureSnap.data();
            return data;
        }

        return null;
    }


    async addAdventure(img, title, json){

        const adventureContructor = {
            "img" : img,
            "titulo" : title,
            "json" : json
        }

        const db = new ConnectDB();

        const adventuresCol = collection(db, "arquivos");

        const result = await addDoc(adventuresCol, adventureContructor)
            .then( doc => {
                const data = { ...adventureContructor, id: doc.id }

                return data;//{ data, status: 'OK', message : "Success in create product" }
            })
            .catch( (error => {
                return null
                // if ( error?.message != null ){
                //     return { data : null, status : 'ERROR', message : error.message }
                // }
            })
        );

        return result;
    }

    async deleteAdventure(adventureID){
        // WARN : This function does 2 accesses to the database, the first to check if the object exists and the second to delete it!
        const db = new ConnectDB();

        const adventureRef = doc(db, "arquivos", adventureID);
        const adventureSnap = await getDoc(adventureRef);

        if ( adventureSnap.exists() ){
            await deleteDoc(adventureRef);

            return {"message" : `Document with id : ${adventureID} has been successfully deleted.`};
        }

        return null;

    }
}