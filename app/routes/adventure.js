import { AdventureController } from "../controller/adventureController.js";

const adventure = new AdventureController();

export function connectAdventureRoutes(router) {
    
    router.get("/api/", adventure.getLastAdventures);
    
    router.get("/api/:id", adventure.getAdvenrute);
    
    router.post("/api/", adventure.addAdventure); 

    router.put("/api/:id", adventure.updateAdventure); 

    router.delete("/api/:id", adventure.deleteAdventure);
    
    router.post("/api/copy/:id", adventure.duplicateAdventure);
    
}