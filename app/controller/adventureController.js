import { AdventuresDAO } from '../model/adventuresDAO.js';

const adventureDAO = new AdventuresDAO();

export class AdventureController {

    lastAdventesCached = [];

    async getLastAdventures(req, res){

        if ( this.lastAdventesCached.length != 0 ){
            return res.status(200).json(this.lastAdventesCached);
        }

        const lastAdventures = await adventureDAO.getLastAdventures();

        this.lastAdventesCached = lastAdventures;

        return res.status(200).json(this.lastAdventesCached);
    }


    async getAdvenrute(req, res){

        const adventureID = req.params.id;

        if ( adventureID == "" || adventureID == null ){
            return res.status(406).json(`ERROR : Not acceptable value for adventure_id : ${adventureID}`);
        }

        const searchAdventure = await adventureDAO.getAdventure(adventureID);

        if ( searchAdventure == null ){
            return res.status(404).json(`ERROR : Not found adventure with id : ${adventureID}`);
        }

        return res.status(200).json(searchAdventure);
    }

    async addAdventure(req, res){
        // const {img, title, json} = req.body;
        // console.log(req.body);

        // console.log(img, title, json)

        // const resp = await adventureDAO.addAdventure(img, title, json)

        return res.status(501).json({"FAIL" : "Resource not implemented yet"})
    }


}