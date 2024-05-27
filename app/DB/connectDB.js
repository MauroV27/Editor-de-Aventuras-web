import {config} from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

config();

const firebaseConfig = JSON.parse( process.env.FIREBASE_SERVICE_ACCOUNT_KEY );

/** Singleton that connect server API with firestore */
export class ConnectDB {

    constructor() {
        return this.getConnection();
    }

    getConnection() {
        if ( !ConnectDB._instance ) {
            try {
                
                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);

                ConnectDB._instance = db;

            } catch (err) {
                console.error("[ERROR] : Failed to connect with firebase service --");
                throw err;
            }
        }

        return ConnectDB._instance;
    }
}