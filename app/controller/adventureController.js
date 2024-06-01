import { AdventuresDAO } from '../model/adventuresDAO.js';

const adventureDAO = new AdventuresDAO();

export class AdventureController {
    
    async getLastAdventures(req, res){
        const lastAdventures = await adventureDAO.getLastAdventures();
        return res.status(200).json(lastAdventures);
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
        const {img, title, json} = req.body;

        const resp = await adventureDAO.addAdventure(img, title, json);

        if ( resp == null ){
            return res.status(500).json({
                "ERROR" : "Database failSorry, some database failure occurred."
            });
        }

        return res.status(200).json({...resp});
    }

    async deleteAdventure(req, res){
        const adventureID = req.params.id;

        if ( adventureID == "" || adventureID == null ){
            return res.status(406).json({"ERROR" : `Not acceptable value for adventure_id : ${adventureID}`});
        }

        const deletedAdventure = await adventureDAO.deleteAdventure(adventureID);

        if ( deletedAdventure == null ){
            return res.status(404).json({"ERROR" : `Not found adventure with id : ${adventureID} to delete`});
        }

        return res.status(200).json(deletedAdventure);
    }


    async duplicateAdventure(req, res){
        
        const adventureID = req.params.id;

        if ( adventureID == "" || adventureID == null ){
            return res.status(406).json(`ERROR : Not acceptable value for adventure_id : ${adventureID}`);
        }

        const searchAdventure = await adventureDAO.getAdventure(adventureID);

        if ( searchAdventure == null ){
            return res.status(404).json(`ERROR : Not found adventure with id : ${adventureID}`);
        }

        const {img, title, json} = searchAdventure;

        const resp = await adventureDAO.addAdventure(img, title + "copy", json);

        if ( resp == null ){
            return res.status(500).json({
                "ERROR" : "Database fail! Sorry, some database failure occurred."
            });
        }

        return res.status(200).json({...resp});

    }


}