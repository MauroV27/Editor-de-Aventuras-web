import path from 'path';

import { Router } from "express";
import { AdventureController } from "../controller/adventureController.js";

const routes = Router();

const adventure = new AdventureController();

const __dirname = path.resolve(path.dirname(''));

routes.get("/", function(req, res){
    res.sendFile(path.join(__dirname, '/app/public/menu/index.html'))
});

routes.get("/adventure/:id", function(req, res){
    res.sendFile(path.join(__dirname, '/app/public/player/player.html'))
})


routes.get("/api/", function(req, res){
    return adventure.getLastAdventures(req, res)
});

routes.use("/api/:id", function(req, res){
    return adventure.getAdvenrute(req, res)
});

routes.post("/api/", function(req, res){
    return adventure.addAdventure(req, res)
});

export { routes, __dirname };