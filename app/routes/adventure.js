import { AdventureController } from "../controller/adventureController.js";

const adventure = new AdventureController();

export function connectAdventureRoutes(router) {
    
    router.get("/api/", adventure.getLastAdventures);
    
    router.get("/api/:id", adventure.getAdvenrute);
    
    router.post("/api/", adventure.addAdventure);
    
}

